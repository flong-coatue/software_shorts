"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTicker } from "@/lib/TickerContext";
import { getProvider } from "@/lib/api";
import { formatCurrency, formatVolume, formatDateShort, changeColor, changeSign, formatPercent } from "@/lib/utils";
import type { PriceBar, Quote, TimeRange } from "@/lib/types";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
} from "recharts";

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "2Y", "5Y"];

function calcSMA(data: PriceBar[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((sum, d) => sum + d.close, 0) / period;
  });
}

interface ChartDataPoint extends PriceBar {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  volumeColor: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function PriceTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as ChartDataPoint | undefined;
  if (!d) return null;

  return (
    <div
      style={{
        background: "#2a2d37",
        border: "1px solid #333640",
        borderRadius: 4,
        padding: "8px 12px",
        fontSize: 12,
        color: "#c8cad0",
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: "#e2e4e8" }}>
        {formatDateShort(d.date)}
      </div>
      <div>Open: <span style={{ color: "#e2e4e8" }}>{formatCurrency(d.open)}</span></div>
      <div>High: <span style={{ color: "#e2e4e8" }}>{formatCurrency(d.high)}</span></div>
      <div>Low: <span style={{ color: "#e2e4e8" }}>{formatCurrency(d.low)}</span></div>
      <div>Close: <span style={{ color: "#e2e4e8" }}>{formatCurrency(d.close)}</span></div>
      <div>Volume: <span style={{ color: "#e2e4e8" }}>{formatVolume(d.volume)}</span></div>
    </div>
  );
}

function VolumeTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as ChartDataPoint | undefined;
  if (!d) return null;

  return (
    <div
      style={{
        background: "#2a2d37",
        border: "1px solid #333640",
        borderRadius: 4,
        padding: "6px 10px",
        fontSize: 11,
        color: "#c8cad0",
      }}
    >
      <div>{formatDateShort(d.date)}</div>
      <div>Vol: {formatVolume(d.volume)}</div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function Charts() {
  const { ticker } = useTicker();
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y");
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [priceData, setPriceData] = useState<PriceBar[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const provider = getProvider();
        const [bars, q] = await Promise.all([
          provider.getPriceHistory(ticker, timeRange),
          provider.getQuote(ticker),
        ]);
        if (!cancelled) {
          setPriceData(bars);
          setQuote(q);
        }
      } catch (err) {
        console.error("Charts: failed to load data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticker, timeRange]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!priceData.length) return [];
    const sma20Data = calcSMA(priceData, 20);
    const sma50Data = calcSMA(priceData, 50);
    const sma200Data = calcSMA(priceData, 200);

    return priceData.map((bar, i) => ({
      ...bar,
      sma20: sma20Data[i],
      sma50: sma50Data[i],
      sma200: sma200Data[i],
      volumeColor:
        bar.close > bar.open ? "#4caf50" : bar.close < bar.open ? "#e53935" : "#555a66",
    }));
  }, [priceData]);

  const priceDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    let min = Infinity;
    let max = -Infinity;
    for (const d of chartData) {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    }
    const pad = (max - min) * 0.05;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8e929e] text-sm animate-pulse">Loading chart data...</div>
      </div>
    );
  }

  const change = quote ? quote.change : 0;
  const changePct = quote ? quote.changePercent : 0;

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2d37]">
        {/* Left: ticker + price */}
        <div className="flex items-baseline gap-3">
          <span className="text-[#e2e4e8] font-semibold text-base tracking-wide">
            {ticker}
          </span>
          {quote && (
            <>
              <span className="text-[#e2e4e8] text-lg font-mono">
                {formatCurrency(quote.price)}
              </span>
              <span
                className="text-sm font-mono"
                style={{ color: changeColor(change) }}
              >
                {changeSign(change)}
                {formatCurrency(Math.abs(change))} ({formatPercent(Math.abs(changePct))})
              </span>
            </>
          )}
        </div>

        {/* Right: time range buttons */}
        <div className="flex gap-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className="fds-btn"
              style={{
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 3,
                background: tr === timeRange ? "#2563eb" : "transparent",
                color: tr === timeRange ? "#fff" : "#8e929e",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* ── MA Toggle Buttons ── */}
      <div className="flex gap-2 px-3 py-1.5 border-b border-[#2a2d37]">
        {([
          { key: "sma20", label: "SMA 20", active: showSMA20, toggle: () => setShowSMA20((v) => !v), color: "#d4b84a" },
          { key: "sma50", label: "SMA 50", active: showSMA50, toggle: () => setShowSMA50((v) => !v), color: "#e09040" },
          { key: "sma200", label: "SMA 200", active: showSMA200, toggle: () => setShowSMA200((v) => !v), color: "#4a90d9" },
        ] as const).map(({ key, label, active, toggle, color }) => (
          <button
            key={key}
            onClick={toggle}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 3,
              border: `1px solid ${active ? color : "#555a66"}`,
              background: active ? `${color}18` : "transparent",
              color: active ? color : "#8e929e",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Charts Area ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Price Chart — 80% */}
        <div style={{ flex: "4 1 0%", minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4a90d9" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4a90d9" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#2a2d37"
                strokeDasharray=""
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fill: "#8e929e", fontSize: 10 }}
                axisLine={{ stroke: "#2a2d37" }}
                tickLine={false}
                minTickGap={40}
              />

              <YAxis
                orientation="right"
                domain={priceDomain}
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fill: "#8e929e", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip content={<PriceTooltip />} />

              <Area
                type="monotone"
                dataKey="close"
                stroke="#4a90d9"
                strokeWidth={1.5}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 3, fill: "#4a90d9" }}
                isAnimationActive={false}
              />

              {showSMA20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#d4b84a"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )}

              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#e09040"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )}

              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  stroke="#4a90d9"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart — 20% */}
        <div style={{ flex: "1 1 0%", minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 4 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fill: "#8e929e", fontSize: 10 }}
                axisLine={{ stroke: "#2a2d37" }}
                tickLine={false}
                minTickGap={40}
              />

              <YAxis
                orientation="right"
                tickFormatter={(v: number) => formatVolume(v)}
                tick={{ fill: "#8e929e", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip content={<VolumeTooltip />} />

              <Bar
                dataKey="volume"
                isAnimationActive={false}
                opacity={0.6}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const color =
                    payload.close > payload.open
                      ? "#4caf50"
                      : payload.close < payload.open
                        ? "#e53935"
                        : "#555a66";
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                      opacity={0.6}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
