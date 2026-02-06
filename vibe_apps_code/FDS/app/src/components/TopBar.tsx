"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTicker } from "@/lib/TickerContext";
import { getProvider } from "@/lib/api";
import type { Quote } from "@/lib/types";
import { formatCurrency, formatPercent, changeColor, changeSign } from "@/lib/utils";
import { Search, Zap } from "lucide-react";

export default function TopBar() {
  const { ticker, setTicker } = useTicker();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ ticker: string; name: string; exchange: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProvider().getQuote(ticker).then(setQuote).catch(() => {});
  }, [ticker]);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length === 0) { setResults([]); setShowResults(false); return; }
    const r = await getProvider().searchTickers(q);
    setResults(r);
    setShowResults(r.length > 0);
  }, []);

  const selectTicker = useCallback((t: string) => {
    setTicker(t);
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.blur();
  }, [setTicker]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.length > 0) {
      const match = results[0];
      if (match) selectTicker(match.ticker);
      else {
        setTicker(query.toUpperCase());
        setQuery("");
        setShowResults(false);
      }
    }
    if (e.key === "Escape") {
      setQuery("");
      setShowResults(false);
      inputRef.current?.blur();
    }
  }, [query, results, selectTicker, setTicker]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{
      height: 38,
      background: "var(--fds-header-bg)",
      borderBottom: "1px solid var(--fds-border)",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Zap size={14} color="var(--fds-accent-blue)" fill="var(--fds-accent-blue)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fds-text-bright)", letterSpacing: "0.05em" }}>
          VIBE CODED FACTSET
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--fds-border)" }} />

      {/* Search */}
      <div style={{ position: "relative", flex: "0 0 280px" }} ref={dropdownRef}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--fds-bg-primary)",
          border: "1px solid var(--fds-border)",
          borderRadius: 2,
          padding: "0 8px",
        }}>
          <Search size={12} color="var(--fds-text-tertiary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 0 && results.length > 0 && setShowResults(true)}
            placeholder="Search ticker or company..."
            style={{
              background: "transparent",
              border: "none",
              color: "var(--fds-text-primary)",
              fontSize: 12,
              padding: "5px 6px",
              width: "100%",
              outline: "none",
            }}
          />
        </div>
        {showResults && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--fds-bg-secondary)",
            border: "1px solid var(--fds-border)",
            borderTop: "none",
            borderRadius: "0 0 3px 3px",
            zIndex: 100,
            maxHeight: 200,
            overflowY: "auto",
          }}>
            {results.map((r) => (
              <div
                key={r.ticker}
                onClick={() => selectTicker(r.ticker)}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--fds-border-subtle)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--fds-bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <span style={{ color: "var(--fds-accent-blue)", fontWeight: 600, fontSize: 12 }}>{r.ticker}</span>
                  <span style={{ color: "var(--fds-text-secondary)", fontSize: 11, marginLeft: 8 }}>{r.name}</span>
                </div>
                <span style={{ color: "var(--fds-text-tertiary)", fontSize: 10 }}>{r.exchange}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Ticker Badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "3px 10px",
        background: "var(--fds-bg-tertiary)",
        borderRadius: 2,
        border: "1px solid var(--fds-border)",
      }}>
        <span style={{ color: "var(--fds-accent-blue)", fontWeight: 700, fontSize: 13 }}>{ticker}</span>
        {quote && (
          <>
            <span style={{ color: "var(--fds-text-bright)", fontWeight: 600, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(quote.price)}
            </span>
            <span style={{ color: changeColor(quote.change), fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
              {changeSign(quote.change)}{formatCurrency(quote.change)} ({changeSign(quote.changePercent)}{formatPercent(quote.changePercent)})
            </span>
          </>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10, color: "var(--fds-text-tertiary)" }}>
        <span>MOCK DATA</span>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--fds-accent-green)",
        }} />
        <span style={{ color: "var(--fds-text-secondary)" }}>
          {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
