import { CategorizedTransaction, StatementLineItem, ForecastPoint, ComplianceFlag, ComplianceFlagItem, Invoice } from "./types";

// Month labels for the 6-month period
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
const MONTH_KEYS = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];

function getMonthKey(date: string): string {
  return date.substring(0, 7);
}

function sumByMonth(
  transactions: CategorizedTransaction[],
  filterFn: (t: CategorizedTransaction) => boolean
): Record<string, number> {
  const result: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (result[k] = 0));

  transactions.filter(filterFn).forEach((t) => {
    const mk = getMonthKey(t.date);
    if (result[mk] !== undefined) {
      result[mk] += Math.abs(t.amount);
    }
  });

  return result;
}

function getEffectiveCode(t: CategorizedTransaction): string {
  return t.overrideAccountCode || t.categorization.accountCode;
}

// ──────────────────────────────────────────
// Income Statement
// ──────────────────────────────────────────
export function buildIncomeStatement(
  transactions: CategorizedTransaction[]
): StatementLineItem[] {
  const lines: StatementLineItem[] = [];

  // Service Revenue (4000)
  const serviceRev = sumByMonth(transactions, (t) => getEffectiveCode(t) === "4000");
  lines.push({ label: "Service Revenue", values: serviceRev, indent: 1 });

  // Interest Income (4200)
  const interestInc = sumByMonth(transactions, (t) => getEffectiveCode(t) === "4200");
  lines.push({ label: "Interest Income", values: interestInc, indent: 1 });

  // Other Income (4300)
  const otherInc = sumByMonth(transactions, (t) => getEffectiveCode(t) === "4300");
  lines.push({ label: "Other Income", values: otherInc, indent: 1 });

  // Total Revenue
  const totalRev: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalRev[k] = (serviceRev[k] || 0) + (interestInc[k] || 0) + (otherInc[k] || 0);
  });
  lines.push({ label: "Total Revenue", values: totalRev, isSubtotal: true, isBold: true });

  // Operating Expenses
  const payroll = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5000");
  lines.push({ label: "Payroll", values: payroll, indent: 1 });

  const rent = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5100");
  lines.push({ label: "Rent", values: rent, indent: 1 });

  const marketing = sumByMonth(transactions, (t) =>
    ["5200", "5210", "5220"].includes(getEffectiveCode(t))
  );
  lines.push({ label: "Marketing & Advertising", values: marketing, indent: 1 });

  const software = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5300");
  lines.push({ label: "Software & Subscriptions", values: software, indent: 1 });

  const cloud = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5400");
  lines.push({ label: "Cloud & Infrastructure", values: cloud, indent: 1 });

  const supplies = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5500");
  lines.push({ label: "Office Supplies", values: supplies, indent: 1 });

  const travel = sumByMonth(transactions, (t) =>
    ["5600", "5610", "5620", "5630", "5640"].includes(getEffectiveCode(t))
  );
  lines.push({ label: "Travel & Entertainment", values: travel, indent: 1 });

  const telecom = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5700");
  lines.push({ label: "Telecommunications", values: telecom, indent: 1 });

  const insurance = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5800");
  lines.push({ label: "Insurance", values: insurance, indent: 1 });

  const utilities = sumByMonth(transactions, (t) => getEffectiveCode(t) === "5900");
  lines.push({ label: "Utilities", values: utilities, indent: 1 });

  const shipping = sumByMonth(transactions, (t) => getEffectiveCode(t) === "6100");
  lines.push({ label: "Shipping & Postage", values: shipping, indent: 1 });

  const recruiting = sumByMonth(transactions, (t) => getEffectiveCode(t) === "6400");
  lines.push({ label: "Recruiting", values: recruiting, indent: 1 });

  const misc = sumByMonth(transactions, (t) => getEffectiveCode(t) === "6300");
  lines.push({ label: "Miscellaneous", values: misc, indent: 1 });

  // Total OpEx
  const totalOpEx: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalOpEx[k] =
      (payroll[k] || 0) +
      (rent[k] || 0) +
      (marketing[k] || 0) +
      (software[k] || 0) +
      (cloud[k] || 0) +
      (supplies[k] || 0) +
      (travel[k] || 0) +
      (telecom[k] || 0) +
      (insurance[k] || 0) +
      (utilities[k] || 0) +
      (shipping[k] || 0) +
      (recruiting[k] || 0) +
      (misc[k] || 0);
  });
  lines.push({ label: "Total Operating Expenses", values: totalOpEx, isSubtotal: true, isBold: true });

  // Net Income
  const netIncome: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    netIncome[k] = (totalRev[k] || 0) - (totalOpEx[k] || 0);
  });
  lines.push({ label: "Net Income", values: netIncome, isSubtotal: true, isBold: true });

  return lines;
}

// ──────────────────────────────────────────
// Balance Sheet (simplified/illustrative)
// ──────────────────────────────────────────
export function buildBalanceSheet(
  transactions: CategorizedTransaction[]
): StatementLineItem[] {
  const lines: StatementLineItem[] = [];

  // Use last running balance per month as cash proxy
  const cashByMonth: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (cashByMonth[k] = 0));
  transactions.forEach((t) => {
    const mk = getMonthKey(t.date);
    if (cashByMonth[mk] !== undefined) {
      cashByMonth[mk] = t.running_balance;
    }
  });

  lines.push({ label: "ASSETS", values: {}, isBold: true });
  lines.push({ label: "Current Assets", values: {}, isBold: true, indent: 0 });
  lines.push({ label: "Cash & Equivalents", values: cashByMonth, indent: 1 });

  // AR - simulate some receivables
  const arByMonth: Record<string, number> = {};
  MONTH_KEYS.forEach((k, i) => {
    arByMonth[k] = 15000 + i * 2500 + Math.round(Math.sin(i) * 5000);
  });
  lines.push({ label: "Accounts Receivable", values: arByMonth, indent: 1 });

  const prepaidByMonth: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (prepaidByMonth[k] = 4800));
  lines.push({ label: "Prepaid Expenses", values: prepaidByMonth, indent: 1 });

  const totalCurrent: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalCurrent[k] = (cashByMonth[k] || 0) + (arByMonth[k] || 0) + (prepaidByMonth[k] || 0);
  });
  lines.push({ label: "Total Current Assets", values: totalCurrent, isSubtotal: true, isBold: true });

  // Fixed Assets
  lines.push({ label: "Fixed Assets", values: {}, isBold: true, indent: 0 });
  const equipByMonth: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (equipByMonth[k] = 28500));
  lines.push({ label: "Office Equipment", values: equipByMonth, indent: 1 });

  const accumDepr: Record<string, number> = {};
  MONTH_KEYS.forEach((k, i) => (accumDepr[k] = -(8500 + i * 475)));
  lines.push({ label: "Less: Accum. Depreciation", values: accumDepr, indent: 1 });

  const netFixed: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    netFixed[k] = (equipByMonth[k] || 0) + (accumDepr[k] || 0);
  });
  lines.push({ label: "Net Fixed Assets", values: netFixed, isSubtotal: true, isBold: true });

  const totalAssets: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalAssets[k] = (totalCurrent[k] || 0) + (netFixed[k] || 0);
  });
  lines.push({ label: "TOTAL ASSETS", values: totalAssets, isSubtotal: true, isBold: true });

  // LIABILITIES
  lines.push({ label: "", values: {} });
  lines.push({ label: "LIABILITIES", values: {}, isBold: true });

  const apByMonth: Record<string, number> = {};
  MONTH_KEYS.forEach((k, i) => {
    apByMonth[k] = 8200 + i * 800 + Math.round(Math.cos(i) * 2000);
  });
  lines.push({ label: "Accounts Payable", values: apByMonth, indent: 1 });

  const accrued: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (accrued[k] = 12500));
  lines.push({ label: "Accrued Expenses", values: accrued, indent: 1 });

  const payrollLiab: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (payrollLiab[k] = 6200));
  lines.push({ label: "Payroll Liabilities", values: payrollLiab, indent: 1 });

  const totalLiab: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalLiab[k] = (apByMonth[k] || 0) + (accrued[k] || 0) + (payrollLiab[k] || 0);
  });
  lines.push({ label: "Total Liabilities", values: totalLiab, isSubtotal: true, isBold: true });

  // EQUITY
  lines.push({ label: "EQUITY", values: {}, isBold: true });
  const equity: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    equity[k] = (totalAssets[k] || 0) - (totalLiab[k] || 0);
  });
  lines.push({ label: "Total Equity", values: equity, indent: 1 });

  const totalLiabEquity: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    totalLiabEquity[k] = (totalLiab[k] || 0) + (equity[k] || 0);
  });
  lines.push({ label: "TOTAL LIABILITIES & EQUITY", values: totalLiabEquity, isSubtotal: true, isBold: true });

  return lines;
}

// ──────────────────────────────────────────
// Cash Flow Statement (simplified)
// ──────────────────────────────────────────
export function buildCashFlowStatement(
  transactions: CategorizedTransaction[]
): StatementLineItem[] {
  const lines: StatementLineItem[] = [];

  // Operating: net income + add back depreciation + working capital changes
  const netIncomeByMonth: Record<string, number> = {};
  const incomeStatement = buildIncomeStatement(transactions);
  const niLine = incomeStatement.find((l) => l.label === "Net Income");
  if (niLine) {
    MONTH_KEYS.forEach((k) => (netIncomeByMonth[k] = niLine.values[k] || 0));
  }

  lines.push({ label: "OPERATING ACTIVITIES", values: {}, isBold: true });
  lines.push({ label: "Net Income", values: netIncomeByMonth, indent: 1 });

  const depreciation: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (depreciation[k] = 475));
  lines.push({ label: "Depreciation", values: depreciation, indent: 1 });

  const wcChanges: Record<string, number> = {};
  MONTH_KEYS.forEach((k, i) => {
    wcChanges[k] = Math.round(-1200 + Math.sin(i * 1.5) * 3000);
  });
  lines.push({ label: "Changes in Working Capital", values: wcChanges, indent: 1 });

  const operatingCash: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    operatingCash[k] = (netIncomeByMonth[k] || 0) + (depreciation[k] || 0) + (wcChanges[k] || 0);
  });
  lines.push({ label: "Net Cash from Operations", values: operatingCash, isSubtotal: true, isBold: true });

  // Investing: equipment purchases
  lines.push({ label: "", values: {} });
  lines.push({ label: "INVESTING ACTIVITIES", values: {}, isBold: true });

  const equipPurchase: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (equipPurchase[k] = 0));
  // Standing desks in November
  equipPurchase["2025-11"] = -1900;
  lines.push({ label: "Equipment Purchases", values: equipPurchase, indent: 1 });

  const savingsTransfer: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (savingsTransfer[k] = 0));
  savingsTransfer["2025-10"] = -25000;
  lines.push({ label: "Transfers to Savings", values: savingsTransfer, indent: 1 });

  const investingCash: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    investingCash[k] = (equipPurchase[k] || 0) + (savingsTransfer[k] || 0);
  });
  lines.push({ label: "Net Cash from Investing", values: investingCash, isSubtotal: true, isBold: true });

  // Financing: none for this period
  lines.push({ label: "", values: {} });
  lines.push({ label: "FINANCING ACTIVITIES", values: {}, isBold: true });
  const financing: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => (financing[k] = 0));
  lines.push({ label: "Net Cash from Financing", values: financing, isSubtotal: true, isBold: true });

  // Net Change
  lines.push({ label: "", values: {} });
  const netChange: Record<string, number> = {};
  MONTH_KEYS.forEach((k) => {
    netChange[k] = (operatingCash[k] || 0) + (investingCash[k] || 0) + (financing[k] || 0);
  });
  lines.push({ label: "Net Change in Cash", values: netChange, isSubtotal: true, isBold: true });

  return lines;
}

// ──────────────────────────────────────────
// Compliance Flags
// ──────────────────────────────────────────
export function buildComplianceFlags(
  transactions: CategorizedTransaction[],
  invoices: Invoice[]
): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];

  // 1. Overdue Invoices
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const overdueItems: ComplianceFlagItem[] = overdueInvoices.map((inv) => ({
    id: inv.id,
    label: `${inv.counterparty} - ${inv.id}`,
    detail: `Due ${inv.due_date} | ${inv.description}`,
    amount: inv.amount,
  }));
  flags.push({
    id: "overdue",
    severity: overdueInvoices.length > 2 ? "critical" : "warning",
    category: "overdue_invoices",
    title: "Overdue Invoices",
    description: `${overdueInvoices.length} invoice(s) past due date requiring immediate follow-up`,
    items: overdueItems,
  });

  // 2. Uncategorized / Low Confidence Transactions
  const lowConfidence = transactions.filter(
    (t) => !t.overrideAccountCode && t.categorization.confidence < 0.6
  );
  const uncatItems: ComplianceFlagItem[] = lowConfidence.map((t) => ({
    id: t.id,
    label: `${t.description}`,
    detail: `${t.date} | Confidence: ${(t.categorization.confidence * 100).toFixed(0)}%`,
    amount: t.amount,
  }));
  flags.push({
    id: "uncategorized",
    severity: lowConfidence.length > 5 ? "critical" : lowConfidence.length > 0 ? "warning" : "info",
    category: "uncategorized",
    title: "Uncategorized Transactions",
    description: `${lowConfidence.length} transaction(s) with low categorization confidence need manual review`,
    items: uncatItems,
  });

  // 3. Unusual Amounts (>2 std dev from mean for same vendor)
  const vendorAmounts: Record<string, number[]> = {};
  transactions.forEach((t) => {
    const vendor = t.description.split(" - ")[0].trim();
    if (!vendorAmounts[vendor]) vendorAmounts[vendor] = [];
    vendorAmounts[vendor].push(Math.abs(t.amount));
  });

  const unusualItems: ComplianceFlagItem[] = [];
  Object.entries(vendorAmounts).forEach(([vendor, amounts]) => {
    if (amounts.length < 3) return; // Need enough data points
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    );
    if (stdDev === 0) return;

    transactions
      .filter((t) => t.description.startsWith(vendor))
      .forEach((t) => {
        const absAmount = Math.abs(t.amount);
        if (absAmount > mean + 2 * stdDev) {
          unusualItems.push({
            id: t.id,
            label: `${t.description}`,
            detail: `$${absAmount.toLocaleString()} vs avg $${mean.toFixed(0)} (${((absAmount - mean) / stdDev).toFixed(1)} std devs)`,
            amount: t.amount,
          });
        }
      });
  });
  flags.push({
    id: "unusual",
    severity: unusualItems.length > 3 ? "warning" : "info",
    category: "unusual_amounts",
    title: "Unusual Amounts",
    description: `${unusualItems.length} transaction(s) with amounts significantly above vendor average`,
    items: unusualItems,
  });

  // 4. Missing Documentation (invoices without matching transaction)
  const unpaidReceivables = invoices.filter(
    (inv) => inv.type === "receivable" && inv.status !== "paid"
  );
  const missingItems: ComplianceFlagItem[] = unpaidReceivables.map((inv) => ({
    id: inv.id,
    label: `${inv.counterparty} - Outstanding AR`,
    detail: `Due ${inv.due_date} | No payment recorded`,
    amount: inv.amount,
  }));
  flags.push({
    id: "missing_docs",
    severity: missingItems.length > 3 ? "warning" : "info",
    category: "missing_docs",
    title: "Missing Documentation",
    description: `${missingItems.length} receivable(s) without matching payment records`,
    items: missingItems,
  });

  return flags;
}

export function computeComplianceScore(flags: ComplianceFlag[]): number {
  // Start at 100, deduct based on severity and count
  let score = 100;
  flags.forEach((flag) => {
    const count = flag.items.length;
    if (flag.severity === "critical") {
      score -= count * 5;
    } else if (flag.severity === "warning") {
      score -= count * 2;
    } else {
      score -= count * 0.5;
    }
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ──────────────────────────────────────────
// Forecast (90-day projection)
// ──────────────────────────────────────────
export function buildForecast(transactions: CategorizedTransaction[]): ForecastPoint[] {
  const points: ForecastPoint[] = [];

  // Build daily balance map from transactions
  const dailyBalance: Record<string, number> = {};
  const dailyNetFlow: Record<string, number> = {};

  transactions.forEach((t) => {
    dailyBalance[t.date] = t.running_balance;
    if (!dailyNetFlow[t.date]) dailyNetFlow[t.date] = 0;
    dailyNetFlow[t.date] += t.amount;
  });

  // Get sorted dates
  const sortedDates = Object.keys(dailyBalance).sort();
  const lastDate = sortedDates[sortedDates.length - 1];
  const lastBalance = dailyBalance[lastDate];

  // Add historical data points (sample weekly)
  const historicalDates = sortedDates.filter((_, i) => i % 3 === 0 || i === sortedDates.length - 1);
  historicalDates.forEach((date) => {
    points.push({
      date,
      actual: dailyBalance[date],
    });
  });

  // Calculate average daily net flow for projection
  const totalDays = sortedDates.length;
  const totalNetFlow = Object.values(dailyNetFlow).reduce((a, b) => a + b, 0);
  const avgDailyFlow = totalNetFlow / totalDays;

  // Calculate variance for confidence bands
  const dailyFlows = Object.values(dailyNetFlow);
  const flowVariance =
    dailyFlows.reduce((sum, flow) => sum + Math.pow(flow - avgDailyFlow, 2), 0) /
    dailyFlows.length;
  const flowStdDev = Math.sqrt(flowVariance);

  // Detect bi-monthly payroll pattern (large debits on 1st and 15th)
  const payrollDays = [1, 15];
  const payrollAmount = -24500; // from the data

  // Project 90 days forward
  const startDate = new Date(lastDate);
  let projectedBalance = lastBalance;

  for (let day = 1; day <= 90; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfMonth = date.getDate();

    // Base flow (average daily)
    let dailyProjection = avgDailyFlow * 0.5; // conservative multiplier

    // Add payroll pattern
    if (payrollDays.includes(dayOfMonth)) {
      dailyProjection += payrollAmount;
    }

    // Add monthly revenue patterns (around 1st and middle of month)
    if (dayOfMonth === 1) {
      dailyProjection += 20000; // Stripe deposits
    }
    if (dayOfMonth >= 5 && dayOfMonth <= 10) {
      dailyProjection += 3000; // Client payments stagger in
    }

    // Add monthly fixed costs (rent on 2nd, insurance end of month)
    if (dayOfMonth === 2) {
      dailyProjection -= 4200; // rent
    }
    if (dayOfMonth >= 27) {
      dailyProjection -= 900; // insurance
    }

    projectedBalance += dailyProjection;

    // Confidence band widens over time
    const uncertaintyGrowth = flowStdDev * Math.sqrt(day) * 0.3;

    // Sample every 3 days for the chart
    if (day % 3 === 0 || day === 1 || day === 90) {
      points.push({
        date: dateStr,
        projected: Math.round(projectedBalance),
        upperBound: Math.round(projectedBalance + uncertaintyGrowth),
        lowerBound: Math.round(projectedBalance - uncertaintyGrowth),
      });
    }
  }

  return points;
}

export { MONTHS, MONTH_KEYS };
