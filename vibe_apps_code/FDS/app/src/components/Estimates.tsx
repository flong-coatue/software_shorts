"use client";

import { useState, useEffect } from "react";
import { useTicker } from "@/lib/TickerContext";
import { getProvider } from "@/lib/api";
import { formatCurrency, formatPercent, formatDate, formatBillions, changeColor, changeSign } from "@/lib/utils";
import type { Estimates as EstimatesType, EstimatePeriod, EarningsSurprise } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export default function Estimates() {
  const { ticker } = useTicker();
  const [data, setData] = useState<EstimatesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const provider = getProvider();
    provider.getEstimates(ticker).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [ticker]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#999] text-sm tracking-wider animate-pulse">
          LOADING ESTIMATES...
        </div>
      </div>
    );
  }

  const { consensus, surpriseHistory: surprises } = data;

  // ---------------------------------------------------------------------------
  // Chart data: EPS surprise per period
  // ---------------------------------------------------------------------------
  const chartData = surprises.map((s: EarningsSurprise) => ({
    period: s.period,
    estimate: s.epsEstimate,
    actual: s.epsActual,
    surprise: s.surprise,
    surprisePct: s.surprisePercent,
    beat: s.surprise >= 0,
  }));

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const revCell = (value: number | undefined | null) => {
    if (value == null) return <span className="text-[#555]">—</span>;
    const color = changeColor(value);
    return <span style={{ color }}>{changeSign(value)}%</span>;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* SECTION 1 — CONSENSUS ESTIMATES                                    */}
      {/* ================================================================== */}
      <div>
        <h2 className="fds-section-header">CONSENSUS ESTIMATES</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* ---------- Revenue Estimates ---------- */}
          <div>
            <h3 className="text-[#ccc] text-xs font-semibold tracking-widest mb-2 uppercase">
              Revenue Estimates
            </h3>
            <table className="fds-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Consensus</th>
                  <th>High</th>
                  <th>Low</th>
                  <th># Analysts</th>
                  <th>30d Rev</th>
                </tr>
              </thead>
              <tbody>
                {consensus.map((row: EstimatePeriod, i: number) => (
                  <tr key={`rev-${i}`}>
                    <td className="font-medium text-[#e0e0e0]">{row.period}</td>
                    <td>{formatBillions(row.revenueEstimate)}</td>
                    <td>{formatBillions(row.revenueHigh)}</td>
                    <td>{formatBillions(row.revenueLow)}</td>
                    <td className="text-center">{row.revenueAnalysts}</td>
                    <td>{revCell(row.revenueRevision30d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- EPS Estimates ---------- */}
          <div>
            <h3 className="text-[#ccc] text-xs font-semibold tracking-widest mb-2 uppercase">
              EPS Estimates
            </h3>
            <table className="fds-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Consensus</th>
                  <th>High</th>
                  <th>Low</th>
                  <th># Analysts</th>
                  <th>30d Rev</th>
                  <th>60d Rev</th>
                  <th>90d Rev</th>
                </tr>
              </thead>
              <tbody>
                {consensus.map((row: EstimatePeriod, i: number) => (
                  <tr key={`eps-${i}`}>
                    <td className="font-medium text-[#e0e0e0]">{row.period}</td>
                    <td>{formatCurrency(row.epsEstimate)}</td>
                    <td>{formatCurrency(row.epsHigh)}</td>
                    <td>{formatCurrency(row.epsLow)}</td>
                    <td className="text-center">{row.epsAnalysts}</td>
                    <td>{revCell(row.epsRevision30d)}</td>
                    <td>{revCell(row.epsRevision60d)}</td>
                    <td>{revCell(row.epsRevision90d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2 — EARNINGS SURPRISE HISTORY                              */}
      {/* ================================================================== */}
      <div>
        <h2 className="fds-section-header">EARNINGS SURPRISE HISTORY</h2>
        <table className="fds-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Report Date</th>
              <th>EPS Est</th>
              <th>EPS Act</th>
              <th>Surprise</th>
              <th>Surprise %</th>
              <th>Rev Est</th>
              <th>Rev Act</th>
              <th>Rev Surprise %</th>
            </tr>
          </thead>
          <tbody>
            {surprises.map((s: EarningsSurprise, i: number) => {
              const epsBeat = s.surprise >= 0;
              const revBeat = s.revenueSurprisePercent >= 0;
              return (
                <tr key={`surprise-${i}`}>
                  <td className="font-medium text-[#e0e0e0]">{s.period}</td>
                  <td>{formatDate(s.reportDate)}</td>
                  <td>{formatCurrency(s.epsEstimate)}</td>
                  <td>{formatCurrency(s.epsActual)}</td>
                  <td>
                    <span style={{ color: epsBeat ? "#4ade80" : "#f87171" }}>
                      {changeSign(s.surprise)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: epsBeat ? "#4ade80" : "#f87171" }}>
                      {formatPercent(s.surprisePercent)}
                    </span>
                  </td>
                  <td>{formatBillions(s.revenueEstimate)}</td>
                  <td>{formatBillions(s.revenueActual)}</td>
                  <td>
                    <span style={{ color: revBeat ? "#4ade80" : "#f87171" }}>
                      {formatPercent(s.revenueSurprisePercent)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* SECTION 3 — EPS BEAT / MISS CHART                                  */}
      {/* ================================================================== */}
      <div>
        <h2 className="fds-section-header">EPS BEAT / MISS HISTORY</h2>
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-4" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="period"
                tick={{ fill: "#999", fontSize: 11 }}
                axisLine={{ stroke: "#555" }}
                tickLine={{ stroke: "#555" }}
              />
              <YAxis
                tick={{ fill: "#999", fontSize: 11 }}
                axisLine={{ stroke: "#555" }}
                tickLine={{ stroke: "#555" }}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #444",
                  borderRadius: 4,
                  color: "#e0e0e0",
                  fontSize: 12,
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  value != null ? `$${Number(value).toFixed(2)}` : "—",
                  name === "estimate" ? "EPS Estimate" : "EPS Actual",
                ]}
                labelStyle={{ color: "#999" }}
              />
              <ReferenceLine y={0} stroke="#555" />

              {/* Estimate bars — neutral gray */}
              <Bar dataKey="estimate" name="estimate" fill="#555" barSize={18} radius={[2, 2, 0, 0]}>
                {chartData.map((_: unknown, idx: number) => (
                  <Cell key={`est-${idx}`} fill="#555" />
                ))}
              </Bar>

              {/* Actual bars — green if beat, red if miss */}
              <Bar dataKey="actual" name="actual" fill="#4ade80" barSize={18} radius={[2, 2, 0, 0]}>
                {chartData.map((entry: { beat: boolean }, idx: number) => (
                  <Cell
                    key={`act-${idx}`}
                    fill={entry.beat ? "#4ade80" : "#f87171"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
