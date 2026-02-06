"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  FileText,
  ShieldCheck,
  TrendingUp,
  Bot,
} from "lucide-react";

import { TabId, CategorizedTransaction } from "@/lib/types";
import { categorizeTransaction } from "@/lib/categorizer";

import TransactionTable from "./TransactionTable";
import FinancialStatements from "./FinancialStatements";
import ComplianceDashboard from "./ComplianceDashboard";
import ForecastChart from "./ForecastChart";

import bankTransactionsData from "@/data/bank_transactions.json";
import invoicesData from "@/data/invoices.json";
import chartOfAccountsData from "@/data/chart_of_accounts.json";

import type { BankTransaction, Invoice, AccountEntry } from "@/lib/types";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "transactions", label: "Transactions", icon: <BookOpen size={18} /> },
  { id: "statements", label: "Statements", icon: <FileText size={18} /> },
  { id: "compliance", label: "Compliance", icon: <ShieldCheck size={18} /> },
  { id: "forecast", label: "Forecast", icon: <TrendingUp size={18} /> },
];

export default function BookkeeperApp() {
  const [activeTab, setActiveTab] = useState<TabId>("transactions");

  const rawTransactions = bankTransactionsData as BankTransaction[];
  const invoices = invoicesData as Invoice[];
  const accounts = chartOfAccountsData as AccountEntry[];

  // Categorize all transactions once
  const [overrides, setOverrides] = useState<
    Record<string, { code: string; name: string }>
  >({});

  const categorizedTransactions: CategorizedTransaction[] = useMemo(() => {
    return rawTransactions.map((t) => {
      const categorization = categorizeTransaction(t.description, t.amount);
      const override = overrides[t.id];
      return {
        ...t,
        categorization,
        overrideAccountCode: override?.code,
        overrideAccountName: override?.name,
      };
    });
  }, [rawTransactions, overrides]);

  const handleOverride = (
    transactionId: string,
    accountCode: string,
    accountName: string
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [transactionId]: { code: accountCode, name: accountName },
    }));
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between shadow-md"
        style={{ background: "#1B5E20" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Bookkeeper
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Intelligent transaction categorization & financial insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: "#4CAF50", color: "#fff" }}
          >
            {categorizedTransactions.length} transactions loaded
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        className="px-6 flex gap-1 border-b"
        style={{
          background: "#fff",
          borderColor: "#E0E0E0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab.id ? "#1B5E20" : "#757575",
              borderBottom:
                activeTab === tab.id ? "2px solid #1B5E20" : "2px solid transparent",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="p-6">
        {activeTab === "transactions" && (
          <TransactionTable
            transactions={categorizedTransactions}
            accounts={accounts}
            onOverride={handleOverride}
          />
        )}
        {activeTab === "statements" && (
          <FinancialStatements transactions={categorizedTransactions} />
        )}
        {activeTab === "compliance" && (
          <ComplianceDashboard
            transactions={categorizedTransactions}
            invoices={invoices}
          />
        )}
        {activeTab === "forecast" && (
          <ForecastChart transactions={categorizedTransactions} />
        )}
      </main>
    </div>
  );
}
