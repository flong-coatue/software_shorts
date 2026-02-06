// ── Company Profile ─────────────────────────────────────────────────────────

export interface CompanyProfile {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  ceo: string;
  employees: number;
  founded: number;
  headquarters: string;
  website: string;
  ipoDate: string;
}

// ── Market Data ─────────────────────────────────────────────────────────────

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  sharesOutstanding: number;
  high52w: number;
  low52w: number;
  timestamp: string;
}

export interface KeyMetrics {
  ticker: string;
  peRatio: number;
  forwardPE: number;
  pegRatio: number;
  priceToBook: number;
  priceToSales: number;
  evToEbitda: number;
  evToRevenue: number;
  enterpriseValue: number;
  beta: number;
  dividendYield: number;
  payoutRatio: number;
  roe: number;
  roa: number;
  roic: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  revenueGrowth: number;
  epsGrowth: number;
  freeCashFlowYield: number;
}

// ── Price History ───────────────────────────────────────────────────────────

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Financial Statements ────────────────────────────────────────────────────

export interface IncomeStatementRow {
  period: string;       // e.g. "Q1 FY25", "FY2024"
  periodEnd: string;    // ISO date
  isAnnual: boolean;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossMargin: number;
  researchAndDevelopment: number;
  sellingGeneralAdmin: number;
  totalOperatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number;
  interestExpense: number;
  otherIncome: number;
  pretaxIncome: number;
  incomeTax: number;
  netIncome: number;
  netMargin: number;
  eps: number;
  epsDiluted: number;
  sharesOutstanding: number;
  sharesDiluted: number;
  ebitda: number;
}

export interface BalanceSheetRow {
  period: string;
  periodEnd: string;
  isAnnual: boolean;
  cashAndEquivalents: number;
  shortTermInvestments: number;
  totalCash: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  propertyPlantEquipment: number;
  goodwill: number;
  intangibleAssets: number;
  totalAssets: number;
  accountsPayable: number;
  shortTermDebt: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  retainedEarnings: number;
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowRow {
  period: string;
  periodEnd: string;
  isAnnual: boolean;
  netIncome: number;
  depreciationAmortization: number;
  stockBasedComp: number;
  changeInWorkingCapital: number;
  operatingCashFlow: number;
  capitalExpenditures: number;
  acquisitions: number;
  investingCashFlow: number;
  debtIssuance: number;
  debtRepayment: number;
  shareRepurchases: number;
  dividendsPaid: number;
  financingCashFlow: number;
  freeCashFlow: number;
  netChangeInCash: number;
}

export interface Financials {
  incomeStatement: IncomeStatementRow[];
  balanceSheet: BalanceSheetRow[];
  cashFlow: CashFlowRow[];
}

// ── Estimates ───────────────────────────────────────────────────────────────

export interface EstimatePeriod {
  period: string;          // "FY2025", "FY2026", "Q1 FY26"
  periodEnd: string;
  isAnnual: boolean;
  revenueEstimate: number;
  revenueHigh: number;
  revenueLow: number;
  revenueAnalysts: number;
  revenueRevision30d: number;
  epsEstimate: number;
  epsHigh: number;
  epsLow: number;
  epsAnalysts: number;
  epsRevision30d: number;
  epsRevision60d: number;
  epsRevision90d: number;
}

export interface EarningsSurprise {
  period: string;
  reportDate: string;
  epsEstimate: number;
  epsActual: number;
  surprise: number;
  surprisePercent: number;
  revenueEstimate: number;
  revenueActual: number;
  revenueSurprise: number;
  revenueSurprisePercent: number;
}

export interface Estimates {
  consensus: EstimatePeriod[];
  surpriseHistory: EarningsSurprise[];
}

// ── Peer Comparison ─────────────────────────────────────────────────────────

export interface PeerData {
  ticker: string;
  name: string;
  marketCap: number;
  price: number;
  changePercent: number;
  peRatio: number;
  forwardPE: number;
  evToEbitda: number;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
}

// ── API Provider Interface ──────────────────────────────────────────────────

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" | "MAX";
export type FinancialStatement = "income" | "balance" | "cashflow";
export type PeriodType = "annual" | "quarterly";
export type ViewType = "snapshot" | "financials" | "charts" | "estimates";

export interface DataProvider {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getQuote(ticker: string): Promise<Quote>;
  getKeyMetrics(ticker: string): Promise<KeyMetrics>;
  getPriceHistory(ticker: string, range: TimeRange): Promise<PriceBar[]>;
  getFinancials(ticker: string, periodType: PeriodType): Promise<Financials>;
  getEstimates(ticker: string): Promise<Estimates>;
  getPeers(ticker: string): Promise<PeerData[]>;
  searchTickers(query: string): Promise<{ ticker: string; name: string; exchange: string }[]>;
}
