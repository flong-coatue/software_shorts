"use client";

import { useState, useMemo } from "react";
import { CategorizedTransaction, StatementType } from "@/lib/types";
import {
  buildIncomeStatement,
  buildBalanceSheet,
  buildCashFlowStatement,
  MONTHS,
  MONTH_KEYS,
} from "@/lib/financials";

interface FinancialStatementsProps {
  transactions: CategorizedTransaction[];
}

const statementTabs: { id: StatementType; label: string }[] = [
  { id: "income", label: "Income Statement" },
  { id: "balance", label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow" },
];

function formatAmount(amount: number | undefined): string {
  if (amount === undefined || amount === 0) return "-";
  const abs = Math.abs(amount);
  const formatted = abs >= 1000
    ? `${(abs / 1000).toFixed(1)}k`
    : abs.toFixed(0);
  if (amount < 0) return `(${formatted})`;
  return formatted;
}

function formatAmountFull(amount: number | undefined): string {
  if (amount === undefined || amount === 0) return "-";
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (amount < 0) return `($${formatted})`;
  return `$${formatted}`;
}

export default function FinancialStatements({
  transactions,
}: FinancialStatementsProps) {
  const [activeStatement, setActiveStatement] =
    useState<StatementType>("income");

  const incomeStatement = useMemo(
    () => buildIncomeStatement(transactions),
    [transactions]
  );
  const balanceSheet = useMemo(
    () => buildBalanceSheet(transactions),
    [transactions]
  );
  const cashFlowStatement = useMemo(
    () => buildCashFlowStatement(transactions),
    [transactions]
  );

  const currentLines = useMemo(() => {
    switch (activeStatement) {
      case "income":
        return incomeStatement;
      case "balance":
        return balanceSheet;
      case "cashflow":
        return cashFlowStatement;
    }
  }, [activeStatement, incomeStatement, balanceSheet, cashFlowStatement]);

  const statementTitle = useMemo(() => {
    switch (activeStatement) {
      case "income":
        return "Income Statement";
      case "balance":
        return "Balance Sheet";
      case "cashflow":
        return "Statement of Cash Flows";
    }
  }, [activeStatement]);

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="flex gap-2 mb-6">
        {statementTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatement(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background:
                activeStatement === tab.id ? "#1B5E20" : "#fff",
              color: activeStatement === tab.id ? "#fff" : "#616161",
              border:
                activeStatement === tab.id
                  ? "1px solid #1B5E20"
                  : "1px solid #E0E0E0",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statement Card */}
      <div
        className="rounded-xl shadow-sm border overflow-hidden"
        style={{ background: "#fff", borderColor: "#E0E0E0" }}
      >
        {/* Title */}
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "#E0E0E0" }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: "#212121" }}
          >
            {statementTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: "#9E9E9E" }}>
            For the period August 2025 - January 2026 (6 months) | All amounts
            in USD
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "#FAFAFA",
                  borderBottom: "2px solid #E0E0E0",
                }}
              >
                <th
                  className="px-6 py-3 text-left font-semibold"
                  style={{ color: "#424242", minWidth: "240px" }}
                >
                  Account
                </th>
                {MONTHS.map((month, idx) => (
                  <th
                    key={month}
                    className="px-4 py-3 text-right font-semibold"
                    style={{
                      color: "#424242",
                      minWidth: "100px",
                      background:
                        idx === MONTHS.length - 1 ? "#F5F5F5" : undefined,
                    }}
                  >
                    {month}
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-right font-semibold"
                  style={{
                    color: "#1B5E20",
                    minWidth: "120px",
                    background: "#E8F5E9",
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLines.map((line, idx) => {
                // Empty separator row
                if (line.label === "" && Object.keys(line.values).length === 0) {
                  return (
                    <tr key={idx}>
                      <td colSpan={MONTHS.length + 2} className="py-2" />
                    </tr>
                  );
                }

                // Section header (no values)
                const hasValues = MONTH_KEYS.some(
                  (k) => line.values[k] !== undefined && line.values[k] !== 0
                );
                const isHeader =
                  !hasValues &&
                  line.isBold &&
                  !line.isSubtotal;

                if (isHeader) {
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #E0E0E0",
                        background: "#FAFAFA",
                      }}
                    >
                      <td
                        colSpan={MONTHS.length + 2}
                        className="px-6 py-2.5 font-bold text-xs uppercase tracking-wider"
                        style={{ color: "#616161" }}
                      >
                        {line.label}
                      </td>
                    </tr>
                  );
                }

                const total = MONTH_KEYS.reduce(
                  (sum, k) => sum + (line.values[k] || 0),
                  0
                );

                return (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-gray-50"
                    style={{
                      borderBottom: line.isSubtotal
                        ? "2px solid #E0E0E0"
                        : "1px solid #F5F5F5",
                      background: line.isSubtotal ? "#FAFAFA" : undefined,
                    }}
                  >
                    <td
                      className="px-6 py-2.5"
                      style={{
                        color: line.isBold ? "#212121" : "#424242",
                        fontWeight: line.isBold ? 600 : 400,
                        paddingLeft: line.indent
                          ? `${24 + line.indent * 20}px`
                          : "24px",
                      }}
                    >
                      {line.label}
                    </td>
                    {MONTH_KEYS.map((monthKey, mIdx) => (
                      <td
                        key={monthKey}
                        className="px-4 py-2.5 text-right font-mono"
                        style={{
                          color:
                            (line.values[monthKey] || 0) < 0
                              ? "#C62828"
                              : line.isBold
                              ? "#212121"
                              : "#616161",
                          fontWeight: line.isBold ? 600 : 400,
                          fontSize: "13px",
                          background:
                            mIdx === MONTHS.length - 1
                              ? "#FAFAFA"
                              : undefined,
                        }}
                      >
                        {activeStatement === "balance"
                          ? formatAmountFull(line.values[monthKey])
                          : formatAmount(line.values[monthKey])}
                      </td>
                    ))}
                    <td
                      className="px-4 py-2.5 text-right font-mono font-semibold"
                      style={{
                        color: total < 0 ? "#C62828" : "#1B5E20",
                        fontSize: "13px",
                        background: "#E8F5E9",
                      }}
                    >
                      {activeStatement === "balance"
                        ? "-"
                        : formatAmountFull(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
