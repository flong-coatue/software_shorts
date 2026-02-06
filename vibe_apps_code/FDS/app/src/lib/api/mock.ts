import type {
  DataProvider,
  CompanyProfile,
  Quote,
  KeyMetrics,
  PriceBar,
  Financials,
  Estimates,
  PeerData,
  TimeRange,
  PeriodType,
} from "@/lib/types";
import { companyProfiles, quotes, keyMetricsData, peerGroups, allTickers } from "@/data/companies";
import { getFinancialsForTicker } from "@/data/financials";
import { generatePriceHistory } from "@/data/priceHistory";
import { getEstimatesForTicker } from "@/data/estimates";

// Simulate network delay (20-80ms) for realism
const delay = (ms: number = 40) => new Promise((r) => setTimeout(r, ms + Math.random() * 40));

export class MockProvider implements DataProvider {
  async getCompanyProfile(ticker: string): Promise<CompanyProfile> {
    await delay();
    const t = ticker.toUpperCase();
    const profile = companyProfiles[t];
    if (!profile) throw new Error(`Unknown ticker: ${t}`);
    return profile;
  }

  async getQuote(ticker: string): Promise<Quote> {
    await delay();
    const t = ticker.toUpperCase();
    const quote = quotes[t];
    if (!quote) throw new Error(`Unknown ticker: ${t}`);
    return quote;
  }

  async getKeyMetrics(ticker: string): Promise<KeyMetrics> {
    await delay();
    const t = ticker.toUpperCase();
    const metrics = keyMetricsData[t];
    if (!metrics) throw new Error(`Unknown ticker: ${t}`);
    return metrics;
  }

  async getPriceHistory(ticker: string, range: TimeRange): Promise<PriceBar[]> {
    await delay(60);
    return generatePriceHistory(ticker.toUpperCase(), range);
  }

  async getFinancials(ticker: string, periodType: PeriodType): Promise<Financials> {
    await delay(60);
    return getFinancialsForTicker(ticker.toUpperCase(), periodType);
  }

  async getEstimates(ticker: string): Promise<Estimates> {
    await delay();
    return getEstimatesForTicker(ticker.toUpperCase());
  }

  async getPeers(ticker: string): Promise<PeerData[]> {
    await delay();
    const t = ticker.toUpperCase();
    const peerTickers = peerGroups[t] ?? ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];
    return peerTickers.filter((p) => p !== t).map((p) => {
      const q = quotes[p];
      const m = keyMetricsData[p];
      return {
        ticker: p,
        name: companyProfiles[p]?.name ?? p,
        marketCap: q?.marketCap ?? 0,
        price: q?.price ?? 0,
        changePercent: q?.changePercent ?? 0,
        peRatio: m?.peRatio ?? 0,
        forwardPE: m?.forwardPE ?? 0,
        evToEbitda: m?.evToEbitda ?? 0,
        revenueGrowth: m?.revenueGrowth ?? 0,
        grossMargin: m?.grossMargin ?? 0,
        operatingMargin: m?.operatingMargin ?? 0,
        netMargin: m?.netMargin ?? 0,
        roe: m?.roe ?? 0,
      };
    });
  }

  async searchTickers(query: string): Promise<{ ticker: string; name: string; exchange: string }[]> {
    await delay(20);
    const q = query.toUpperCase();
    return allTickers.filter(
      (t) => t.ticker.includes(q) || t.name.toUpperCase().includes(q)
    );
  }
}
