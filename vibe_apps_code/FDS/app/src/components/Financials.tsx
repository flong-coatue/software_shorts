"use client";

import { useState, useEffect, useCallback } from "react";
import { useTicker } from "@/lib/TickerContext";
import { getProvider } from "@/lib/api";
import { formatMillions, formatPercent } from "@/lib/utils";
import type {
  Financials as FinancialsType,
  IncomeStatementRow,
  BalanceSheetRow,
  CashFlowRow,
} from "@/lib/types";

type StatementType = "income" | "balance" | "cashflow";
type PeriodType = "annual" | "quarterly";

interface SectionDef<T> {
  label: string;
  rows: { key: keyof T; label: string; isPercent?: boolean }[];
}

const incomeStatementSections: SectionDef<IncomeStatementRow>[] = [
  {
    label: "Revenue",
    rows: [
      { key: "revenue", label: "Revenue" },
      { key: "costOfRevenue", label: "Cost of Revenue" },
      { key: "grossProfit", label: "Gross Profit" },
      { key: "grossMargin", label: "Gross Margin %", isPercent: true },
    ],
  },
  {
    label: "Operating",
    rows: [
      { key: "researchAndDevelopment", label: "R&D" },
      { key: "sellingGeneralAdmin", label: "SG&A" },
      { key: "totalOperatingExpenses", label: "Total OpEx" },
      { key: "operatingIncome", label: "Operating Income" },
      { key: "operatingMargin", label: "Operating Margin %", isPercent: true },
    ],
  },
  {
    label: "Bottom Line",
    rows: [
      { key: "interestExpense", label: "Interest Expense" },
      { key: "otherIncome", label: "Other Income" },
      { key: "pretaxIncome", label: "Pre-tax Income" },
      { key: "incomeTax", label: "Income Tax" },
      { key: "netIncome", label: "Net Income" },
      { key: "netMargin", label: "Net Margin %", isPercent: true },
    ],
  },
  {
    label: "Per Share",
    rows: [
      { key: "eps", label: "EPS" },
      { key: "epsDiluted", label: "EPS (Diluted)" },
      { key: "sharesOutstanding", label: "Shares Out" },
      { key: "ebitda", label: "EBITDA" },
    ],
  },
];

const balanceSheetSections: SectionDef<BalanceSheetRow>[] = [
  {
    label: "Assets",
    rows: [
      { key: "cashAndEquivalents", label: "Cash & Equivalents" },
      { key: "shortTermInvestments", label: "Short-term Investments" },
      { key: "totalCash", label: "Total Cash" },
      { key: "accountsReceivable", label: "A/R" },
      { key: "inventory", label: "Inventory" },
      { key: "totalCurrentAssets", label: "Total Current Assets" },
      { key: "propertyPlantEquipment", label: "PP&E" },
      { key: "goodwill", label: "Goodwill" },
      { key: "intangibleAssets", label: "Intangibles" },
      { key: "totalAssets", label: "Total Assets" },
    ],
  },
  {
    label: "Liabilities",
    rows: [
      { key: "accountsPayable", label: "A/P" },
      { key: "shortTermDebt", label: "Short-term Debt" },
      { key: "totalCurrentLiabilities", label: "Total Current Liabilities" },
      { key: "longTermDebt", label: "Long-term Debt" },
      { key: "totalLiabilities", label: "Total Liabilities" },
    ],
  },
  {
    label: "Equity",
    rows: [
      { key: "totalStockholdersEquity", label: "Stockholders' Equity" },
      { key: "retainedEarnings", label: "Retained Earnings" },
      { key: "totalLiabilitiesAndEquity", label: "Total Liab + Equity" },
    ],
  },
];

const cashFlowSections: SectionDef<CashFlowRow>[] = [
  {
    label: "Operating",
    rows: [
      { key: "netIncome", label: "Net Income" },
      { key: "depreciationAmortization", label: "D&A" },
      { key: "stockBasedComp", label: "SBC" },
      { key: "changeInWorkingCapital", label: "Working Capital Changes" },
      { key: "operatingCashFlow", label: "Operating Cash Flow" },
    ],
  },
  {
    label: "Investing",
    rows: [
      { key: "capitalExpenditures", label: "CapEx" },
      { key: "acquisitions", label: "Acquisitions" },
      { key: "investingCashFlow", label: "Investing Cash Flow" },
    ],
  },
  {
    label: "Financing",
    rows: [
      { key: "debtIssuance", label: "Debt Issuance" },
      { key: "debtRepayment", label: "Debt Repayment" },
      { key: "shareRepurchases", label: "Share Repurchases" },
      { key: "dividendsPaid", label: "Dividends" },
      { key: "financingCashFlow", label: "Financing Cash Flow" },
    ],
  },
  {
    label: "Summary",
    rows: [
      { key: "freeCashFlow", label: "Free Cash Flow" },
      { key: "netChangeInCash", label: "Net Change in Cash" },
    ],
  },
];

// Per-share items should not be divided by 1e6
const perShareKeys = new Set(["eps", "epsDiluted"]);
// Shares outstanding divided by 1e6 but displayed differently
const sharesKeys = new Set(["sharesOutstanding"]);

function formatCellValue(
  value: number | undefined | null,
  isPercent: boolean,
  fieldKey: string
): { display: string; isNegative: boolean } {
  if (value === undefined || value === null) {
    return { display: "—", isNegative: false };
  }

  if (isPercent) {
    return {
      display: formatPercent(value),
      isNegative: value < 0,
    };
  }

  if (perShareKeys.has(fieldKey)) {
    const isNeg = value < 0;
    const abs = Math.abs(value);
    const formatted = abs.toFixed(2);
    return {
      display: isNeg ? `(${formatted})` : formatted,
      isNegative: isNeg,
    };
  }

  if (sharesKeys.has(fieldKey)) {
    return {
      display: formatMillions(value),
      isNegative: false,
    };
  }

  return {
    display: formatMillions(value),
    isNegative: value < 0,
  };
}

export default function Financials() {
  const { ticker } = useTicker();
  const [statementType, setStatementType] = useState<StatementType>("income");
  const [periodType, setPeriodType] = useState<PeriodType>("annual");
  const [data, setData] = useState<FinancialsType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const result = await provider.getFinancials(ticker, periodType);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch financials:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, periodType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statementTabs: { key: StatementType; label: string }[] = [
    { key: "income", label: "Income Statement" },
    { key: "balance", label: "Balance Sheet" },
    { key: "cashflow", label: "Cash Flow" },
  ];

  const periodTabs: { key: PeriodType; label: string }[] = [
    { key: "annual", label: "Annual" },
    { key: "quarterly", label: "Quarterly" },
  ];

  function getPeriodLabels(): string[] {
    if (!data) return [];
    switch (statementType) {
      case "income":
        return (data.incomeStatement ?? []).map((r) => r.period);
      case "balance":
        return (data.balanceSheet ?? []).map((r) => r.period);
      case "cashflow":
        return (data.cashFlow ?? []).map((r) => r.period);
    }
  }

  function renderSectionedTable<T extends { period: string }>(
    sections: SectionDef<T>[],
    rows: T[]
  ) {
    const periods = rows.map((r) => r.period);

    return (
      <table className="fds-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                borderBottom: "2px solid #3a3a3a",
                color: "#8a9bae",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.5px",
                position: "sticky",
                left: 0,
                backgroundColor: "#1a1d23",
                minWidth: "200px",
              }}
            >
              ($M)
            </th>
            {periods.map((p) => (
              <th
                key={p}
                style={{
                  textAlign: "right",
                  padding: "8px 12px",
                  borderBottom: "2px solid #3a3a3a",
                  color: "#8a9bae",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.5px",
                  minWidth: "120px",
                }}
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <>
              {/* Section header row */}
              <tr key={`section-${section.label}`}>
                <td
                  colSpan={periods.length + 1}
                  style={{
                    padding: "10px 12px 6px",
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#4a90d9",
                    backgroundColor: "#14161a",
                    borderBottom: "1px solid #2a2d33",
                  }}
                >
                  {section.label}
                </td>
              </tr>
              {/* Data rows */}
              {section.rows.map((rowDef) => (
                <tr
                  key={String(rowDef.key)}
                  style={{
                    borderBottom: "1px solid #1e2128",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e2128";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td
                    style={{
                      textAlign: "left",
                      padding: "6px 12px 6px 24px",
                      color: "#c8d0da",
                      fontSize: "13px",
                      fontWeight: 400,
                      position: "sticky",
                      left: 0,
                      backgroundColor: "inherit",
                    }}
                  >
                    {rowDef.label}
                  </td>
                  {rows.map((periodRow) => {
                    const rawValue = periodRow[rowDef.key as keyof T];
                    const numValue =
                      typeof rawValue === "number" ? rawValue : null;
                    const { display, isNegative } = formatCellValue(
                      numValue,
                      !!rowDef.isPercent,
                      String(rowDef.key)
                    );
                    return (
                      <td
                        key={periodRow.period}
                        className={isNegative ? "fds-negative" : ""}
                        style={{
                          textAlign: "right",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          color: isNegative ? "#e74c3c" : "#d0d7e0",
                        }}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    );
  }

  function renderTable() {
    if (!data) return null;

    switch (statementType) {
      case "income":
        return renderSectionedTable(
          incomeStatementSections,
          data.incomeStatement ?? []
        );
      case "balance":
        return renderSectionedTable(
          balanceSheetSections,
          data.balanceSheet ?? []
        );
      case "cashflow":
        return renderSectionedTable(cashFlowSections, data.cashFlow ?? []);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #2a2d33",
          backgroundColor: "#1a1d23",
          flexShrink: 0,
        }}
      >
        {/* Statement Type Tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {statementTabs.map((tab) => (
            <button
              key={tab.key}
              className="fds-btn"
              onClick={() => setStatementType(tab.key)}
              style={{
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid #3a3a3a",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor:
                  statementType === tab.key ? "#4a90d9" : "#1e2128",
                color: statementType === tab.key ? "#ffffff" : "#8a9bae",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period Toggle */}
        <div style={{ display: "flex", gap: "4px" }}>
          {periodTabs.map((tab) => (
            <button
              key={tab.key}
              className="fds-btn"
              onClick={() => setPeriodType(tab.key)}
              style={{
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid #3a3a3a",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor:
                  periodType === tab.key ? "#4a90d9" : "#1e2128",
                color: periodType === tab.key ? "#ffffff" : "#8a9bae",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "0",
          backgroundColor: "#1a1d23",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              color: "#8a9bae",
              fontSize: "14px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #2a2d33",
                  borderTop: "3px solid #4a90d9",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              Loading financials for {ticker}...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !data ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              color: "#e74c3c",
              fontSize: "14px",
            }}
          >
            Failed to load financial data for {ticker}.
          </div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
}
