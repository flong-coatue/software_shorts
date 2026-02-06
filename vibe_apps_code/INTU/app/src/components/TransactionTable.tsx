"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
} from "lucide-react";

import { CategorizedTransaction, AccountEntry, SortConfig } from "@/lib/types";
import {
  getConfidenceColor,
  getConfidenceBgColor,
  getConfidenceLabel,
} from "@/lib/categorizer";

interface TransactionTableProps {
  transactions: CategorizedTransaction[];
  accounts: AccountEntry[];
  onOverride: (
    transactionId: string,
    accountCode: string,
    accountName: string
  ) => void;
}

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionTable({
  transactions,
  accounts,
  onOverride,
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "desc",
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
        setDropdownSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const expenseAccounts = useMemo(
    () => accounts.filter((a) => a.type === "expense" || a.type === "revenue" || a.type === "asset"),
    [accounts]
  );

  const filteredDropdownAccounts = useMemo(
    () =>
      expenseAccounts.filter(
        (a) =>
          a.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
          a.code.includes(dropdownSearch)
      ),
    [expenseAccounts, dropdownSearch]
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.categorization.accountName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      switch (sortConfig.key) {
        case "date":
          return (a.date > b.date ? 1 : -1) * dir;
        case "description":
          return a.description.localeCompare(b.description) * dir;
        case "amount":
          return (a.amount - b.amount) * dir;
        case "category":
          return (
            (a.overrideAccountName || a.categorization.accountName).localeCompare(
              b.overrideAccountName || b.categorization.accountName
            ) * dir
          );
        case "confidence":
          return (a.categorization.confidence - b.categorization.confidence) * dir;
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, searchQuery, sortConfig]);

  // Summary stats
  const stats = useMemo(() => {
    const debits = filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const credits = filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return { debits, credits, net: debits + credits };
  }, [filteredTransactions]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown size={14} color="#9E9E9E" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} color="#1B5E20" />
    ) : (
      <ArrowDown size={14} color="#1B5E20" />
    );
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color="#9E9E9E"
          />
          <input
            type="text"
            placeholder="Search transactions by description, category, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: "#E0E0E0",
              background: "#fff",
              color: "#212121",
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "#4CAF50",
            }}
          />
        </div>
        <span className="text-sm" style={{ color: "#757575" }}>
          {filteredTransactions.length} of {transactions.length} transactions
        </span>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden shadow-sm border"
        style={{ background: "#fff", borderColor: "#E0E0E0" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #E0E0E0" }}>
                {[
                  { key: "date", label: "Date", width: "120px" },
                  { key: "description", label: "Description", width: "auto" },
                  { key: "amount", label: "Amount", width: "140px" },
                  { key: "category", label: "Category", width: "220px" },
                  { key: "confidence", label: "Confidence", width: "120px" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                    style={{ color: "#424242", width: col.width }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon columnKey={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => {
                const effectiveName =
                  t.overrideAccountName || t.categorization.accountName;
                const effectiveCode =
                  t.overrideAccountCode || t.categorization.accountCode;
                const isOverridden = !!t.overrideAccountCode;
                const confidence = isOverridden ? 1.0 : t.categorization.confidence;

                return (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: "1px solid #F5F5F5" }}
                  >
                    {/* Date */}
                    <td className="px-4 py-3" style={{ color: "#616161" }}>
                      {formatDate(t.date)}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3" style={{ color: "#212121" }}>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9E9E9E" }}>
                        {t.id}
                      </div>
                    </td>

                    {/* Amount */}
                    <td
                      className="px-4 py-3 font-mono font-medium"
                      style={{ color: t.amount >= 0 ? "#2E7D32" : "#C62828" }}
                    >
                      {formatCurrency(t.amount)}
                    </td>

                    {/* Category (clickable dropdown) */}
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => {
                          setOpenDropdownId(
                            openDropdownId === t.id ? null : t.id
                          );
                          setDropdownSearch("");
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          background: isOverridden ? "#E3F2FD" : "#F5F5F5",
                          color: isOverridden ? "#1565C0" : "#424242",
                          border: isOverridden
                            ? "1px solid #90CAF9"
                            : "1px solid #E0E0E0",
                        }}
                      >
                        <span className="font-mono text-[10px]" style={{ color: "#9E9E9E" }}>
                          {effectiveCode}
                        </span>
                        {effectiveName}
                        <ChevronDown size={12} />
                      </button>

                      {/* Dropdown */}
                      {openDropdownId === t.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 mt-1 w-72 rounded-lg shadow-lg border overflow-hidden"
                          style={{
                            background: "#fff",
                            borderColor: "#E0E0E0",
                            left: 0,
                          }}
                        >
                          <div className="p-2 border-b" style={{ borderColor: "#F5F5F5" }}>
                            <input
                              type="text"
                              placeholder="Search accounts..."
                              value={dropdownSearch}
                              onChange={(e) =>
                                setDropdownSearch(e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded text-xs border focus:outline-none focus:ring-1"
                              style={{
                                borderColor: "#E0E0E0",
                                // @ts-expect-error CSS custom property
                                "--tw-ring-color": "#4CAF50",
                              }}
                              autoFocus
                            />
                          </div>
                          <div
                            className="max-h-48 overflow-y-auto"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            {filteredDropdownAccounts.map((account) => (
                              <button
                                key={account.code}
                                onClick={() => {
                                  onOverride(t.id, account.code, account.name);
                                  setOpenDropdownId(null);
                                  setDropdownSearch("");
                                }}
                                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-50"
                                style={{
                                  borderBottom: "1px solid #FAFAFA",
                                }}
                              >
                                <span
                                  className="font-mono w-10 flex-shrink-0"
                                  style={{ color: "#9E9E9E" }}
                                >
                                  {account.code}
                                </span>
                                <span style={{ color: "#212121" }}>
                                  {account.name}
                                </span>
                                {effectiveCode === account.code && (
                                  <Check
                                    size={12}
                                    className="ml-auto"
                                    color="#4CAF50"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3">
                      {isOverridden ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: "#E3F2FD",
                            color: "#1565C0",
                          }}
                        >
                          Manual
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: getConfidenceBgColor(confidence),
                            color: getConfidenceColor(confidence),
                          }}
                        >
                          {(confidence * 100).toFixed(0)}%{" "}
                          {getConfidenceLabel(confidence)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Row */}
        <div
          className="px-4 py-3 flex items-center justify-between text-sm font-medium"
          style={{
            background: "#FAFAFA",
            borderTop: "2px solid #E0E0E0",
            color: "#424242",
          }}
        >
          <span>Summary ({filteredTransactions.length} transactions)</span>
          <div className="flex gap-8">
            <span>
              Total Debits:{" "}
              <span style={{ color: "#C62828" }}>
                {formatCurrency(stats.debits)}
              </span>
            </span>
            <span>
              Total Credits:{" "}
              <span style={{ color: "#2E7D32" }}>
                {formatCurrency(stats.credits)}
              </span>
            </span>
            <span>
              Net:{" "}
              <span
                style={{ color: stats.net >= 0 ? "#2E7D32" : "#C62828" }}
              >
                {formatCurrency(stats.net)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
