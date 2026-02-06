/**
 * Financial Modeling Prep (FMP) API Provider
 *
 * Drop-in replacement for MockProvider. Get a free API key at:
 * https://financialmodelingprep.com/
 *
 * To activate:
 * 1. Add your API key to .env.local: FMP_API_KEY=your_key_here
 * 2. In api/index.ts, import FMPProvider and set it as active
 *
 * FMP endpoints used:
 * - /api/v3/profile/{ticker}           → CompanyProfile + Quote
 * - /api/v3/key-metrics/{ticker}       → KeyMetrics
 * - /api/v3/historical-price-full/{ticker} → PriceHistory
 * - /api/v3/income-statement/{ticker}  → IncomeStatement
 * - /api/v3/balance-sheet-statement/{ticker} → BalanceSheet
 * - /api/v3/cash-flow-statement/{ticker}    → CashFlow
 * - /api/v3/analyst-estimates/{ticker} → Estimates
 * - /api/v3/search?query={q}          → Ticker search
 */

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

const BASE_URL = "https://financialmodelingprep.com/api/v3";

export class FMPProvider implements DataProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private url(path: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams({ apikey: this.apiKey, ...params });
    return `${BASE_URL}${path}?${searchParams}`;
  }

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const res = await fetch(this.url(path, params));
    if (!res.ok) throw new Error(`FMP API error: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async getCompanyProfile(ticker: string): Promise<CompanyProfile> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any[]>(`/profile/${ticker}`);
    const p = data[0];
    return {
      ticker: p.symbol,
      name: p.companyName,
      exchange: p.exchangeShortName,
      sector: p.sector,
      industry: p.industry,
      description: p.description,
      ceo: p.ceo,
      employees: p.fullTimeEmployees,
      founded: parseInt(p.ipoDate?.split("-")[0] ?? "0"),
      headquarters: `${p.city}, ${p.state}`,
      website: p.website,
      ipoDate: p.ipoDate,
    };
  }

  async getQuote(ticker: string): Promise<Quote> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any[]>(`/quote/${ticker}`);
    const q = data[0];
    return {
      ticker: q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changesPercentage,
      open: q.open,
      high: q.dayHigh,
      low: q.dayLow,
      previousClose: q.previousClose,
      volume: q.volume,
      avgVolume: q.avgVolume,
      marketCap: q.marketCap,
      sharesOutstanding: q.sharesOutstanding,
      high52w: q.yearHigh,
      low52w: q.yearLow,
      timestamp: q.timestamp?.toString() ?? new Date().toISOString(),
    };
  }

  async getKeyMetrics(ticker: string): Promise<KeyMetrics> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any[]>(`/key-metrics/${ticker}`, { limit: "1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratios = await this.fetch<any[]>(`/ratios/${ticker}`, { limit: "1" });
    const m = data[0] ?? {};
    const r = ratios[0] ?? {};
    return {
      ticker,
      peRatio: r.priceEarningsRatio ?? 0,
      forwardPE: r.priceEarningsToGrowthRatio ?? 0,
      pegRatio: r.priceEarningsToGrowthRatio ?? 0,
      priceToBook: r.priceToBookRatio ?? 0,
      priceToSales: r.priceToSalesRatio ?? 0,
      evToEbitda: m.enterpriseValueOverEBITDA ?? 0,
      evToRevenue: m.evToOperatingCashFlow ?? 0,
      enterpriseValue: m.enterpriseValue ?? 0,
      beta: 1.0,
      dividendYield: r.dividendYield ?? 0,
      payoutRatio: r.payoutRatio ?? 0,
      roe: r.returnOnEquity ?? 0,
      roa: r.returnOnAssets ?? 0,
      roic: m.roic ?? 0,
      grossMargin: r.grossProfitMargin ?? 0,
      operatingMargin: r.operatingProfitMargin ?? 0,
      netMargin: r.netProfitMargin ?? 0,
      debtToEquity: r.debtEquityRatio ?? 0,
      currentRatio: r.currentRatio ?? 0,
      quickRatio: r.quickRatio ?? 0,
      revenueGrowth: 0,
      epsGrowth: 0,
      freeCashFlowYield: m.freeCashFlowYield ?? 0,
    };
  }

  async getPriceHistory(ticker: string, range: TimeRange): Promise<PriceBar[]> {
    // Map range to FMP params
    const rangeMap: Record<TimeRange, string> = {
      "1D": "1hour", "1W": "1hour", "1M": "1day",
      "3M": "1day", "6M": "1day", "1Y": "1day",
      "2Y": "1day", "5Y": "1day", "MAX": "1day",
    };
    const limitMap: Record<TimeRange, number> = {
      "1D": 8, "1W": 40, "1M": 22, "3M": 66,
      "6M": 130, "1Y": 252, "2Y": 504, "5Y": 1260, "MAX": 2520,
    };

    const interval = rangeMap[range];
    const limit = limitMap[range];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    if (interval === "1day") {
      data = await this.fetch<{ historical: { date: string; open: number; high: number; low: number; close: number; volume: number }[] }>(
        `/historical-price-full/${ticker}`,
        { serietype: "line" }
      );
      return (data.historical ?? []).slice(0, limit).reverse().map((d: { date: string; open: number; high: number; low: number; close: number; volume: number }) => ({
        date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume,
      }));
    } else {
      data = await this.fetch<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]>(
        `/historical-chart/${interval}/${ticker}`
      );
      return (data ?? []).slice(0, limit).reverse().map((d: { date: string; open: number; high: number; low: number; close: number; volume: number }) => ({
        date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume,
      }));
    }
  }

  async getFinancials(ticker: string, periodType: PeriodType): Promise<Financials> {
    const period = periodType === "quarterly" ? "quarter" : "annual";
    const limit = periodType === "quarterly" ? "8" : "3";

    const [is, bs, cf] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fetch<any[]>(`/income-statement/${ticker}`, { period, limit }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fetch<any[]>(`/balance-sheet-statement/${ticker}`, { period, limit }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fetch<any[]>(`/cash-flow-statement/${ticker}`, { period, limit }),
    ]);

    return {
      incomeStatement: (is ?? []).reverse().map((r) => ({
        period: r.period === "FY" ? `FY${r.calendarYear}` : `${r.period} FY${r.calendarYear?.slice(2)}`,
        periodEnd: r.date,
        isAnnual: periodType === "annual",
        revenue: r.revenue,
        costOfRevenue: r.costOfRevenue,
        grossProfit: r.grossProfit,
        grossMargin: r.grossProfit / r.revenue,
        researchAndDevelopment: r.researchAndDevelopmentExpenses,
        sellingGeneralAdmin: r.sellingGeneralAndAdministrativeExpenses,
        totalOperatingExpenses: r.operatingExpenses,
        operatingIncome: r.operatingIncome,
        operatingMargin: r.operatingIncome / r.revenue,
        interestExpense: r.interestExpense,
        otherIncome: r.totalOtherIncomeExpensesNet,
        pretaxIncome: r.incomeBeforeTax,
        incomeTax: r.incomeTaxExpense,
        netIncome: r.netIncome,
        netMargin: r.netIncome / r.revenue,
        eps: r.eps,
        epsDiluted: r.epsdiluted,
        sharesOutstanding: r.weightedAverageShsOut,
        sharesDiluted: r.weightedAverageShsOutDil,
        ebitda: r.ebitda,
      })),
      balanceSheet: (bs ?? []).reverse().map((r) => ({
        period: r.period === "FY" ? `FY${r.calendarYear}` : `${r.period} FY${r.calendarYear?.slice(2)}`,
        periodEnd: r.date,
        isAnnual: periodType === "annual",
        cashAndEquivalents: r.cashAndCashEquivalents,
        shortTermInvestments: r.shortTermInvestments,
        totalCash: r.cashAndShortTermInvestments,
        accountsReceivable: r.netReceivables,
        inventory: r.inventory,
        totalCurrentAssets: r.totalCurrentAssets,
        propertyPlantEquipment: r.propertyPlantEquipmentNet,
        goodwill: r.goodwill,
        intangibleAssets: r.intangibleAssets,
        totalAssets: r.totalAssets,
        accountsPayable: r.accountPayables,
        shortTermDebt: r.shortTermDebt,
        totalCurrentLiabilities: r.totalCurrentLiabilities,
        longTermDebt: r.longTermDebt,
        totalLiabilities: r.totalLiabilities,
        totalStockholdersEquity: r.totalStockholdersEquity,
        retainedEarnings: r.retainedEarnings,
        totalLiabilitiesAndEquity: r.totalLiabilitiesAndStockholdersEquity,
      })),
      cashFlow: (cf ?? []).reverse().map((r) => ({
        period: r.period === "FY" ? `FY${r.calendarYear}` : `${r.period} FY${r.calendarYear?.slice(2)}`,
        periodEnd: r.date,
        isAnnual: periodType === "annual",
        netIncome: r.netIncome,
        depreciationAmortization: r.depreciationAndAmortization,
        stockBasedComp: r.stockBasedCompensation,
        changeInWorkingCapital: r.changeInWorkingCapital,
        operatingCashFlow: r.operatingCashFlow,
        capitalExpenditures: r.capitalExpenditure,
        acquisitions: r.acquisitionsNet,
        investingCashFlow: r.netCashUsedForInvestingActivites,
        debtIssuance: r.debtRepayment > 0 ? r.debtRepayment : 0,
        debtRepayment: r.debtRepayment < 0 ? r.debtRepayment : 0,
        shareRepurchases: r.commonStockRepurchased,
        dividendsPaid: r.dividendsPaid,
        financingCashFlow: r.netCashUsedProvidedByFinancingActivities,
        freeCashFlow: r.freeCashFlow,
        netChangeInCash: r.netChangeInCash,
      })),
    };
  }

  async getEstimates(ticker: string): Promise<Estimates> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any[]>(`/analyst-estimates/${ticker}`, { limit: "8" });
    return {
      consensus: (data ?? []).reverse().map((e) => ({
        period: `FY${new Date(e.date).getFullYear()}`,
        periodEnd: e.date,
        isAnnual: true,
        revenueEstimate: e.estimatedRevenueAvg,
        revenueHigh: e.estimatedRevenueHigh,
        revenueLow: e.estimatedRevenueLow,
        revenueAnalysts: e.numberAnalystEstimatedRevenue,
        revenueRevision30d: 0,
        epsEstimate: e.estimatedEpsAvg,
        epsHigh: e.estimatedEpsHigh,
        epsLow: e.estimatedEpsLow,
        epsAnalysts: e.numberAnalystsEstimatedEps,
        epsRevision30d: 0,
        epsRevision60d: 0,
        epsRevision90d: 0,
      })),
      surpriseHistory: [],
    };
  }

  async getPeers(ticker: string): Promise<PeerData[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const peers = await this.fetch<any[]>(`/stock_peers?symbol=${ticker}`);
    const peerTickers = (peers[0]?.peersList ?? []).slice(0, 5);
    const profiles = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      peerTickers.map((t: string) => this.fetch<any[]>(`/profile/${t}`).then((d) => d[0]).catch(() => null))
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return profiles.filter(Boolean).map((p: any) => ({
      ticker: p.symbol,
      name: p.companyName,
      marketCap: p.mktCap,
      price: p.price,
      changePercent: p.changes,
      peRatio: 0, forwardPE: 0, evToEbitda: 0,
      revenueGrowth: 0, grossMargin: 0, operatingMargin: 0, netMargin: 0, roe: 0,
    }));
  }

  async searchTickers(query: string): Promise<{ ticker: string; name: string; exchange: string }[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any[]>("/search", { query, limit: "10" });
    return (data ?? []).map((r) => ({
      ticker: r.symbol,
      name: r.name,
      exchange: r.exchangeShortName,
    }));
  }
}
