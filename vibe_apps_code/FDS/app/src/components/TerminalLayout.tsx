"use client";

import React from "react";
import { TickerProvider, useTicker } from "@/lib/TickerContext";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Snapshot from "./Snapshot";
import Financials from "./Financials";
import Charts from "./Charts";
import Estimates from "./Estimates";

function MainContent() {
  const { activeView } = useTicker();

  return (
    <div style={{
      flex: 1,
      overflow: "auto",
      background: "var(--fds-bg-primary)",
    }}>
      {activeView === "snapshot" && <Snapshot />}
      {activeView === "financials" && <Financials />}
      {activeView === "charts" && <Charts />}
      {activeView === "estimates" && <Estimates />}
    </div>
  );
}

export default function TerminalLayout() {
  return (
    <TickerProvider>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--fds-bg-primary)",
      }}>
        <TopBar />
        <div style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}>
          <Sidebar />
          <MainContent />
        </div>
        {/* Status Bar */}
        <div style={{
          height: 22,
          background: "var(--fds-header-bg)",
          borderTop: "1px solid var(--fds-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          justifyContent: "space-between",
          fontSize: 10,
          color: "var(--fds-text-tertiary)",
          flexShrink: 0,
        }}>
          <span>Data Source: Mock (swap to FMP in api/index.ts)</span>
          <span>Press Ctrl+K to search tickers</span>
        </div>
      </div>
    </TickerProvider>
  );
}
