"use client";

import React from "react";
import { useTicker } from "@/lib/TickerContext";
import type { ViewType } from "@/lib/types";
import {
  LayoutDashboard,
  Table2,
  LineChart,
  TrendingUp,
} from "lucide-react";

interface NavItem {
  id: ViewType;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "snapshot", label: "Company Snapshot", shortLabel: "Snapshot", icon: <LayoutDashboard size={14} /> },
  { id: "financials", label: "Financial Statements", shortLabel: "Financials", icon: <Table2 size={14} /> },
  { id: "charts", label: "Interactive Charts", shortLabel: "Charts", icon: <LineChart size={14} /> },
  { id: "estimates", label: "Estimates & Consensus", shortLabel: "Estimates", icon: <TrendingUp size={14} /> },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useTicker();

  return (
    <div style={{
      width: 180,
      background: "var(--fds-sidebar-bg)",
      borderRight: "1px solid var(--fds-border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      paddingTop: 8,
    }}>
      {/* Section Label */}
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "var(--fds-text-tertiary)",
        padding: "6px 14px 8px",
      }}>
        Analysis
      </div>

      {/* Nav Items */}
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: isActive ? "var(--fds-sidebar-active)" : "transparent",
              border: "none",
              borderLeft: isActive ? "2px solid var(--fds-accent-blue)" : "2px solid transparent",
              color: isActive ? "var(--fds-text-bright)" : "var(--fds-text-secondary)",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--fds-bg-hover)";
                e.currentTarget.style.color = "var(--fds-text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--fds-text-secondary)";
              }
            }}
          >
            <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
            <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}

      {/* Bottom spacer and branding */}
      <div style={{ flex: 1 }} />
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid var(--fds-border-subtle)",
        fontSize: 9,
        color: "var(--fds-text-tertiary)",
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>AI TERMINAL</div>
        <div>FMP-ready data layer</div>
        <div style={{ marginTop: 4, color: "var(--fds-accent-blue)", fontSize: 10 }}>v0.1.0</div>
      </div>
    </div>
  );
}
