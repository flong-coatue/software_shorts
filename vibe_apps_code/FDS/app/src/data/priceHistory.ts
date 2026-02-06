import type { PriceBar } from "@/lib/types";

// ── Ticker Parameters ───────────────────────────────────────────────────────

interface TickerParams {
  basePrice: number;
  annualVol: number;     // annualized volatility (e.g., 0.25 = 25%)
  avgDailyVolume: number;
  drift: number;         // annualized drift / trend
}

const tickerParams: Record<string, TickerParams> = {
  AAPL: { basePrice: 248.72, annualVol: 0.25, avgDailyVolume: 48_750_000, drift: 0.12 },
  MSFT: { basePrice: 462.15, annualVol: 0.23, avgDailyVolume: 21_200_000, drift: 0.15 },
  GOOGL: { basePrice: 205.48, annualVol: 0.28, avgDailyVolume: 26_500_000, drift: 0.14 },
  AMZN: { basePrice: 235.64, annualVol: 0.30, avgDailyVolume: 43_100_000, drift: 0.18 },
  META: { basePrice: 685.30, annualVol: 0.32, avgDailyVolume: 13_800_000, drift: 0.20 },
  NVDA: { basePrice: 139.82, annualVol: 0.45, avgDailyVolume: 290_000_000, drift: 0.35 },
};

// ── Deterministic Pseudo-Random Number Generator ────────────────────────────
// Simple seeded PRNG (mulberry32) for consistent output given the same seed.

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert a string to a numeric seed
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

// Box-Muller transform: uniform -> standard normal
function boxMuller(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

// ── Date Helpers ────────────────────────────────────────────────────────────

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace("Z", "");
}

// ── Trading Days Generator ──────────────────────────────────────────────────

function getTradingDays(endDate: Date, count: number): Date[] {
  const days: Date[] = [];
  const current = new Date(endDate);
  // Make sure we start from a weekday
  while (isWeekend(current)) {
    current.setDate(current.getDate() - 1);
  }
  while (days.length < count) {
    if (!isWeekend(current)) {
      days.unshift(new Date(current));
    }
    current.setDate(current.getDate() - 1);
  }
  return days;
}

// ── Intraday Time Slots ─────────────────────────────────────────────────────

function getIntradaySlots(date: Date, intervalMinutes: number): Date[] {
  const slots: Date[] = [];
  const start = new Date(date);
  start.setHours(9, 30, 0, 0); // Market open 9:30 AM ET
  const end = new Date(date);
  end.setHours(16, 0, 0, 0); // Market close 4:00 PM ET

  let current = new Date(start);
  while (current <= end) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
  }
  return slots;
}

function getHourlySlots(startDate: Date, days: number): Date[] {
  const slots: Date[] = [];
  const tradingDays = getTradingDays(startDate, days);

  for (const day of tradingDays) {
    const daySlots = getIntradaySlots(day, 60);
    slots.push(...daySlots);
  }
  return slots;
}

// ── Price Generation Core ───────────────────────────────────────────────────

function generateBars(
  params: TickerParams,
  seed: number,
  dates: Date[],
  isIntraday: boolean
): PriceBar[] {
  const rng = mulberry32(seed);
  const bars: PriceBar[] = [];

  // Calculate the per-bar volatility and drift
  const barsPerYear = isIntraday ? 252 * 78 : 252; // ~78 five-min bars per day
  const barVol = params.annualVol / Math.sqrt(barsPerYear);
  const barDrift = params.drift / barsPerYear;

  // Walk backwards from basePrice to find the starting price
  // We simulate forward from an earlier price to arrive at basePrice at the end
  let price = params.basePrice;

  // Pre-roll: determine starting price by reverse-engineering
  // Generate all returns first, then scale so final price = basePrice
  const returns: number[] = [];
  for (let i = 0; i < dates.length; i++) {
    const z = boxMuller(rng);
    returns.push(barDrift + barVol * z);
  }

  // Calculate what starting price would give us the basePrice at the end
  let cumReturn = 0;
  for (const r of returns) {
    cumReturn += r;
  }
  const startPrice = params.basePrice * Math.exp(-cumReturn);
  price = startPrice;

  for (let i = 0; i < dates.length; i++) {
    const dailyReturn = returns[i];

    // Generate OHLC from the return
    const open = price;
    const close = price * Math.exp(dailyReturn);

    // Intra-bar high/low: simulate with additional randomness
    const rng2 = mulberry32(seed + i * 7919);
    const highExtra = Math.abs(boxMuller(rng2)) * barVol * price * 0.5;
    const lowExtra = Math.abs(boxMuller(rng2)) * barVol * price * 0.5;

    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;

    // Volume: base + random variation, with higher volume at open/close for intraday
    let volumeMultiplier = 0.8 + rng() * 0.4;
    if (isIntraday) {
      const barIndex = i % 78;
      if (barIndex < 6 || barIndex > 72) {
        volumeMultiplier *= 1.8; // Higher volume at open/close
      }
    }
    const barVolume = Math.round(
      (params.avgDailyVolume / (isIntraday ? 78 : 1)) * volumeMultiplier
    );

    const dateStr = isIntraday ? formatDateTime(dates[i]) : formatDate(dates[i]);

    bars.push({
      date: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(Math.max(low, 0.01) * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: barVolume,
    });

    price = close;
  }

  return bars;
}

// ── Range Configuration ─────────────────────────────────────────────────────

interface RangeConfig {
  tradingDays: number;
  isIntraday: boolean;
  intervalMinutes?: number;
}

const rangeConfigs: Record<string, RangeConfig> = {
  "1D": { tradingDays: 1, isIntraday: true, intervalMinutes: 5 },
  "1W": { tradingDays: 5, isIntraday: true, intervalMinutes: 60 },
  "1M": { tradingDays: 22, isIntraday: false },
  "3M": { tradingDays: 63, isIntraday: false },
  "6M": { tradingDays: 126, isIntraday: false },
  "1Y": { tradingDays: 252, isIntraday: false },
  "2Y": { tradingDays: 504, isIntraday: false },
  "5Y": { tradingDays: 1260, isIntraday: false },
  MAX: { tradingDays: 2520, isIntraday: false },
};

// ── Main Export ─────────────────────────────────────────────────────────────

/**
 * Generate synthetic but deterministic OHLCV price data for a given ticker
 * and time range. The same ticker + range combination always produces
 * identical output.
 *
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @param range - Time range: "1D", "1W", "1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"
 * @returns Array of PriceBar objects
 */
export function generatePriceHistory(ticker: string, range: string): PriceBar[] {
  const params = tickerParams[ticker] || {
    basePrice: 100,
    annualVol: 0.30,
    avgDailyVolume: 10_000_000,
    drift: 0.10,
  };

  const config = rangeConfigs[range] || rangeConfigs["1Y"];
  const seed = hashString(`${ticker}-${range}`);
  const endDate = new Date("2026-02-05");

  let dates: Date[];

  if (range === "1D") {
    // Intraday 5-minute bars for the most recent trading day
    let tradingDay = new Date(endDate);
    while (isWeekend(tradingDay)) {
      tradingDay.setDate(tradingDay.getDate() - 1);
    }
    dates = getIntradaySlots(tradingDay, config.intervalMinutes!);
  } else if (range === "1W") {
    // Hourly bars for the past 5 trading days
    dates = getHourlySlots(endDate, config.tradingDays);
  } else {
    // Daily bars
    dates = getTradingDays(endDate, config.tradingDays);
  }

  return generateBars(params, seed, dates, config.isIntraday);
}

/**
 * Get the list of supported tickers with their price parameters.
 * Useful for validation.
 */
export function getSupportedTickers(): string[] {
  return Object.keys(tickerParams);
}
