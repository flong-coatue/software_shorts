"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  DollarSign,
} from "lucide-react";

import { CategorizedTransaction, Invoice, ComplianceFlag } from "@/lib/types";
import { buildComplianceFlags, computeComplianceScore } from "@/lib/financials";

interface ComplianceDashboardProps {
  transactions: CategorizedTransaction[];
  invoices: Invoice[];
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle size={20} color="#C62828" />;
    case "warning":
      return <AlertCircle size={20} color="#F9A825" />;
    default:
      return <CheckCircle size={20} color="#2E7D32" />;
  }
}

function getSeverityColors(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "#FFEBEE",
        border: "#EF9A9A",
        badge: "#C62828",
        badgeBg: "#FFCDD2",
      };
    case "warning":
      return {
        bg: "#FFF8E1",
        border: "#FFE082",
        badge: "#F57F17",
        badgeBg: "#FFF9C4",
      };
    default:
      return {
        bg: "#E8F5E9",
        border: "#A5D6A7",
        badge: "#2E7D32",
        badgeBg: "#C8E6C9",
      };
  }
}

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  return `$${absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#2E7D32";
  if (score >= 60) return "#F9A825";
  return "#C62828";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "#E8F5E9";
  if (score >= 60) return "#FFF8E1";
  return "#FFEBEE";
}

export default function ComplianceDashboard({
  transactions,
  invoices,
}: ComplianceDashboardProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const flags = useMemo(
    () => buildComplianceFlags(transactions, invoices),
    [transactions, invoices]
  );

  const complianceScore = useMemo(() => computeComplianceScore(flags), [flags]);

  const totalIssues = flags.reduce((sum, f) => sum + f.items.length, 0);
  const criticalCount = flags
    .filter((f) => f.severity === "critical")
    .reduce((sum, f) => sum + f.items.length, 0);
  const warningCount = flags
    .filter((f) => f.severity === "warning")
    .reduce((sum, f) => sum + f.items.length, 0);

  return (
    <div>
      {/* Score Header */}
      <div
        className="rounded-xl shadow-sm border p-6 mb-6 flex items-center gap-8"
        style={{ background: "#fff", borderColor: "#E0E0E0" }}
      >
        {/* Score Circle */}
        <div className="flex-shrink-0">
          <div
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-4"
            style={{
              borderColor: getScoreColor(complianceScore),
              background: getScoreBg(complianceScore),
            }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: getScoreColor(complianceScore) }}
            >
              {complianceScore}
            </span>
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: getScoreColor(complianceScore) }}
            >
              Score
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1" style={{ color: "#212121" }}>
            Compliance Overview
          </h2>
          <p className="text-sm mb-4" style={{ color: "#757575" }}>
            Automated review of financial records and transaction categorization
          </p>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#FFEBEE" }}
              >
                <AlertTriangle size={16} color="#C62828" />
              </div>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "#C62828" }}
                >
                  {criticalCount}
                </div>
                <div className="text-xs" style={{ color: "#757575" }}>
                  Critical
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#FFF8E1" }}
              >
                <AlertCircle size={16} color="#F9A825" />
              </div>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "#F57F17" }}
                >
                  {warningCount}
                </div>
                <div className="text-xs" style={{ color: "#757575" }}>
                  Warnings
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#E8F5E9" }}
              >
                <ShieldCheck size={16} color="#2E7D32" />
              </div>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "#2E7D32" }}
                >
                  {totalIssues}
                </div>
                <div className="text-xs" style={{ color: "#757575" }}>
                  Total Items
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => {
          const colors = getSeverityColors(flag.severity);
          const isExpanded = expandedCardId === flag.id;

          return (
            <div
              key={flag.id}
              className="rounded-xl shadow-sm border overflow-hidden transition-all"
              style={{
                background: "#fff",
                borderColor: colors.border,
              }}
            >
              {/* Card Header */}
              <button
                onClick={() =>
                  setExpandedCardId(isExpanded ? null : flag.id)
                }
                className="w-full px-5 py-4 flex items-center gap-3 text-left transition-colors"
                style={{
                  background: colors.bg,
                }}
              >
                {getSeverityIcon(flag.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "#212121" }}
                    >
                      {flag.title}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: colors.badgeBg,
                        color: colors.badge,
                      }}
                    >
                      {flag.items.length}{" "}
                      {flag.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#757575" }}>
                    {flag.description}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} color="#757575" />
                ) : (
                  <ChevronDown size={16} color="#757575" />
                )}
              </button>

              {/* Expanded Items */}
              {isExpanded && flag.items.length > 0 && (
                <div
                  className="border-t"
                  style={{ borderColor: colors.border }}
                >
                  {flag.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="px-5 py-3 flex items-center gap-3"
                      style={{
                        borderBottom:
                          idx < flag.items.length - 1
                            ? "1px solid #F5F5F5"
                            : undefined,
                      }}
                    >
                      <div className="flex-1">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#212121" }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#9E9E9E" }}
                        >
                          {item.detail}
                        </div>
                      </div>
                      {item.amount !== undefined && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} color="#757575" />
                          <span
                            className="text-sm font-mono font-medium"
                            style={{
                              color:
                                item.amount < 0 ? "#C62828" : "#2E7D32",
                            }}
                          >
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
