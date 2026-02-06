"use client";

import { useEffect, useState } from "react";
import { useTicker } from "@/lib/TickerContext";
import { getProvider } from "@/lib/api";
import {
  formatLargeNumber,
  formatPercent,
  formatCurrency,
  formatNumber,
  formatVolume,
  changeColor,
  changeSign,
} from "@/lib/utils";
import type { CompanyProfile, Quote, KeyMetrics, PeerData } from "@/lib/types";

interface SnapshotData {
  profile: CompanyProfile;
  quote: Quote;
  metrics: KeyMetrics;
  peers: PeerData[];
}

export default function Snapshot() {
  const { ticker } = useTicker();
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const provider = getProvider();
        const [profile, quote, metrics, peers] = await Promise.all([
          provider.getCompanyProfile(ticker) as Promise<CompanyProfile>,
          provider.getQuote(ticker) as Promise<Quote>,
          provider.getKeyMetrics(ticker) as Promise<KeyMetrics>,
          provider.getPeers(ticker) as Promise<PeerData[]>,
        ]);
        if (!cancelled) {
          setData({ profile, quote, metrics, peers });
        }
      } catch (err) {
        console.error("Snapshot fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          color: "var(--fds-text-secondary)",
          fontSize: "14px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          padding: "40px",
          color: "var(--fds-text-secondary)",
          fontSize: "14px",
        }}
      >
        No data available for {ticker}.
      </div>
    );
  }

  const { profile, quote, metrics, peers } = data;

  return (
    <div style={{ padding: "16px 20px", color: "var(--fds-text-primary)" }}>
      {/* ── Top Section - Company Header Bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "4px",
        }}
      >
        {/* Left: Name, ticker badge, exchange */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--fds-text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            {profile.name}
          </span>
          <span
            style={{
              background: "var(--fds-accent-blue)",
              color: "#fff",
              padding: "2px 10px",
              borderRadius: "3px",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            {ticker}
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "var(--fds-text-tertiary)",
            }}
          >
            {profile.exchange}
          </span>
        </div>

        {/* Right: Price, change, change% */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--fds-text-primary)",
            }}
          >
            {formatCurrency(quote.price)}
          </span>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: changeColor(quote.change),
            }}
          >
            {changeSign(quote.change)}
            {formatNumber(Math.abs(quote.change))}
          </span>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: changeColor(quote.changePercent),
            }}
          >
            ({changeSign(quote.changePercent)}
            {formatPercent(Math.abs(quote.changePercent))})
          </span>
        </div>
      </div>

      {/* Description line */}
      <div
        style={{
          fontSize: "12px",
          color: "var(--fds-text-tertiary)",
          marginBottom: "20px",
          lineHeight: 1.4,
          maxWidth: "80%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {profile.description}
      </div>

      {/* ── Key Stats Grid (2x4) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: "var(--fds-border)",
          border: "1px solid var(--fds-border)",
          borderRadius: "4px",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        {[
          { label: "MARKET CAP", value: formatLargeNumber(quote.marketCap) },
          {
            label: "ENTERPRISE VALUE",
            value: formatLargeNumber(metrics.enterpriseValue),
          },
          { label: "P/E (TTM)", value: formatNumber(metrics.peRatio) },
          { label: "FORWARD P/E", value: formatNumber(metrics.forwardPE) },
          { label: "EV/EBITDA", value: formatNumber(metrics.evToEbitda) },
          { label: "PRICE/SALES", value: formatNumber(metrics.priceToSales) },
          {
            label: "DIVIDEND YIELD",
            value: formatPercent(metrics.dividendYield),
          },
          { label: "BETA", value: formatNumber(metrics.beta) },
        ].map((cell) => (
          <div
            key={cell.label}
            style={{
              background: "var(--fds-bg-secondary)",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--fds-text-tertiary)",
                letterSpacing: "0.8px",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              {cell.label}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--fds-text-primary)",
              }}
            >
              {cell.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Section - Two Columns ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60% 40%",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Left Column */}
        <div>
          {/* Valuation Section */}
          <SectionHeader title="Valuation" />
          <DataTable
            rows={[
              { label: "P/E", value: formatNumber(metrics.peRatio) },
              { label: "Forward P/E", value: formatNumber(metrics.forwardPE) },
              { label: "PEG Ratio", value: formatNumber(metrics.pegRatio) },
              {
                label: "Price/Book",
                value: formatNumber(metrics.priceToBook),
              },
              {
                label: "Price/Sales",
                value: formatNumber(metrics.priceToSales),
              },
              { label: "EV/EBITDA", value: formatNumber(metrics.evToEbitda) },
              {
                label: "EV/Revenue",
                value: formatNumber(metrics.evToRevenue),
              },
            ]}
          />

          {/* Profitability Section */}
          <SectionHeader title="Profitability" />
          <DataTable
            rows={[
              {
                label: "Gross Margin",
                value: formatPercent(metrics.grossMargin),
              },
              {
                label: "Operating Margin",
                value: formatPercent(metrics.operatingMargin),
              },
              { label: "Net Margin", value: formatPercent(metrics.netMargin) },
              { label: "ROE", value: formatPercent(metrics.roe) },
              { label: "ROA", value: formatPercent(metrics.roa) },
              { label: "ROIC", value: formatPercent(metrics.roic) },
            ]}
          />
        </div>

        {/* Right Column */}
        <div>
          {/* Trading Data Section */}
          <SectionHeader title="Trading Data" />
          <DataTable
            rows={[
              {
                label: "52W High",
                value: formatCurrency(quote.high52w),
              },
              {
                label: "52W Low",
                value: formatCurrency(quote.low52w),
              },
              {
                label: "Avg Volume",
                value: formatVolume(quote.avgVolume),
              },
              {
                label: "Shares Outstanding",
                value: formatLargeNumber(quote.sharesOutstanding),
              },
              {
                label: "Short % of Float",
                value: formatPercent(0),
              },
            ]}
          />

          {/* Financials Section */}
          <SectionHeader title="Financials" />
          <DataTable
            rows={[
              {
                label: "Revenue Growth",
                value: formatPercent(metrics.revenueGrowth),
              },
              {
                label: "EPS Growth",
                value: formatPercent(metrics.epsGrowth),
              },
              {
                label: "FCF Yield",
                value: formatPercent(metrics.freeCashFlowYield),
              },
              {
                label: "Debt/Equity",
                value: formatNumber(metrics.debtToEquity),
              },
              {
                label: "Current Ratio",
                value: formatNumber(metrics.currentRatio),
              },
            ]}
          />
        </div>
      </div>

      {/* ── Bottom Section - Peer Comparison Table ── */}
      <SectionHeader title="Peer Comparison" />
      <div style={{ overflowX: "auto" }}>
        <table className="fds-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th style={{ textAlign: "right" }}>Mkt Cap</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "right" }}>Chg%</th>
              <th style={{ textAlign: "right" }}>P/E</th>
              <th style={{ textAlign: "right" }}>Fwd PE</th>
              <th style={{ textAlign: "right" }}>EV/EBITDA</th>
              <th style={{ textAlign: "right" }}>Rev Growth</th>
              <th style={{ textAlign: "right" }}>Gross Mgn</th>
              <th style={{ textAlign: "right" }}>Op Mgn</th>
              <th style={{ textAlign: "right" }}>ROE</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((peer) => {
              const isCurrentTicker =
                peer.ticker.toUpperCase() === ticker.toUpperCase();
              return (
                <tr
                  key={peer.ticker}
                  style={
                    isCurrentTicker
                      ? {
                          background: "var(--fds-bg-tertiary)",
                        }
                      : undefined
                  }
                >
                  <td
                    style={{
                      fontWeight: isCurrentTicker ? 700 : 500,
                      color: "var(--fds-accent-blue)",
                    }}
                  >
                    {peer.ticker}
                  </td>
                  <td>{peer.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatLargeNumber(peer.marketCap)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(peer.price)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: changeColor(peer.changePercent),
                    }}
                  >
                    {changeSign(peer.changePercent)}
                    {formatPercent(Math.abs(peer.changePercent))}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(peer.peRatio)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(peer.forwardPE)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(peer.evToEbitda)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatPercent(peer.revenueGrowth)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatPercent(peer.grossMargin)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatPercent(peer.operatingMargin)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatPercent(peer.roe)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--fds-accent-blue)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "8px 0 6px 0",
        borderBottom: "1px solid var(--fds-border)",
        marginBottom: "0",
        marginTop: "12px",
      }}
    >
      {title}
    </div>
  );
}

function DataTable({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
      }}
    >
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.label}
            style={{
              borderBottom: "1px solid var(--fds-border)",
            }}
          >
            <td
              style={{
                padding: "6px 8px 6px 0",
                color: "var(--fds-text-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {row.label}
            </td>
            <td
              style={{
                padding: "6px 0",
                textAlign: "right",
                color: "var(--fds-text-primary)",
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
