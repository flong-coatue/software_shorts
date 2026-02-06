"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

import { CategorizedTransaction } from "@/lib/types";
import { buildForecast } from "@/lib/financials";

interface ForecastChartProps {
  transactions: CategorizedTransaction[];
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null;

  return (
    <div
      className="rounded-lg shadow-lg border p-3"
      style={{ background: "#fff", borderColor: "#E0E0E0" }}
    >
      <p className="text-xs font-medium mb-2" style={{ color: "#757575" }}>
        {formatDateLabel(label)}
      </p>
      {payload
        .filter((p) => p.value !== undefined && p.value !== null)
        .map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span style={{ color: "#616161" }}>
              {p.name === "actual"
                ? "Actual"
                : p.name === "projected"
                ? "Projected"
                : p.name === "upperBound"
                ? "Upper Bound"
                : "Lower Bound"}
              :
            </span>
            <span className="font-mono font-medium" style={{ color: "#212121" }}>
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
    </div>
  );
}

export default function ForecastChart({ transactions }: ForecastChartProps) {
  const forecastData = useMemo(
    () => buildForecast(transactions),
    [transactions]
  );

  // Summary metrics
  const lastActual = forecastData.find((p) => p.actual !== undefined && !p.projected);
  const lastProjected = forecastData[forecastData.length - 1];
  const projectedChange =
    lastActual && lastProjected?.projected
      ? lastProjected.projected - (lastActual.actual || 0)
      : 0;

  // Find the transition point (last actual data point)
  const lastActualPoint = [...forecastData]
    .reverse()
    .find((p) => p.actual !== undefined);
  const transitionDate = lastActualPoint?.date || "";

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="rounded-xl shadow-sm border p-5"
          style={{ background: "#fff", borderColor: "#E0E0E0" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} color="#1B5E20" />
            <span className="text-xs font-medium" style={{ color: "#757575" }}>
              Current Balance
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "#212121" }}>
            {lastActual?.actual
              ? formatCurrency(lastActual.actual)
              : "N/A"}
          </div>
          <div className="text-xs mt-1" style={{ color: "#9E9E9E" }}>
            As of{" "}
            {lastActual?.date
              ? formatDateLabel(lastActual.date)
              : "N/A"}
          </div>
        </div>

        <div
          className="rounded-xl shadow-sm border p-5"
          style={{ background: "#fff", borderColor: "#E0E0E0" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} color="#4CAF50" />
            <span className="text-xs font-medium" style={{ color: "#757575" }}>
              90-Day Projected Balance
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "#212121" }}>
            {lastProjected?.projected
              ? formatCurrency(lastProjected.projected)
              : "N/A"}
          </div>
          <div
            className="text-xs mt-1"
            style={{
              color: projectedChange >= 0 ? "#2E7D32" : "#C62828",
            }}
          >
            {projectedChange >= 0 ? "+" : ""}
            {formatCurrency(projectedChange)} projected change
          </div>
        </div>

        <div
          className="rounded-xl shadow-sm border p-5"
          style={{ background: "#fff", borderColor: "#E0E0E0" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} color="#F9A825" />
            <span className="text-xs font-medium" style={{ color: "#757575" }}>
              Confidence Range (Day 90)
            </span>
          </div>
          <div className="text-lg font-bold" style={{ color: "#212121" }}>
            {lastProjected?.lowerBound && lastProjected?.upperBound
              ? `${formatCurrency(lastProjected.lowerBound)} - ${formatCurrency(
                  lastProjected.upperBound
                )}`
              : "N/A"}
          </div>
          <div className="text-xs mt-1" style={{ color: "#9E9E9E" }}>
            Based on historical variance analysis
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="rounded-xl shadow-sm border p-6"
        style={{ background: "#fff", borderColor: "#E0E0E0" }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#212121" }}>
            90-Day Cash Flow Projection
          </h2>
          <p className="text-xs mt-1" style={{ color: "#9E9E9E" }}>
            Historical balance with forward projection based on recurring
            transaction patterns and seasonal adjustments
          </p>
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <AreaChart
            data={forecastData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A5D6A7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A5D6A7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />

            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 11, fill: "#9E9E9E" }}
              tickLine={false}
              axisLine={{ stroke: "#E0E0E0" }}
              interval="preserveStartEnd"
            />

            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: "#9E9E9E" }}
              tickLine={false}
              axisLine={{ stroke: "#E0E0E0" }}
              width={70}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  actual: "Actual Balance",
                  projected: "Projected Balance",
                  upperBound: "Upper Confidence Bound",
                  lowerBound: "Lower Confidence Bound",
                };
                return (
                  <span style={{ color: "#616161" }}>
                    {labels[value] || value}
                  </span>
                );
              }}
            />

            {/* Confidence band - upper */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#bandGradient)"
              name="upperBound"
              connectNulls={false}
            />

            {/* Confidence band - lower */}
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#fff"
              name="lowerBound"
              connectNulls={false}
            />

            {/* Historical actual line */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#1B5E20"
              strokeWidth={2.5}
              fill="url(#actualGradient)"
              name="actual"
              connectNulls={false}
              dot={{ fill: "#1B5E20", r: 3, strokeWidth: 0 }}
            />

            {/* Projected line */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#4CAF50"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#projectedGradient)"
              name="projected"
              connectNulls={false}
              dot={false}
            />

            {/* Divider line between actual and projected */}
            {transitionDate && (
              <ReferenceLine
                x={transitionDate}
                stroke="#BDBDBD"
                strokeDasharray="4 4"
                label={{
                  value: "Forecast Start",
                  position: "top",
                  fill: "#9E9E9E",
                  fontSize: 10,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Method Note */}
        <div
          className="mt-4 px-4 py-3 rounded-lg text-xs"
          style={{ background: "#F5F5F5", color: "#757575" }}
        >
          <strong>Methodology:</strong> Projection uses a weighted moving
          average of historical daily cash flows, adjusted for detected recurring
          patterns (bi-monthly payroll, monthly rent, periodic client payments).
          Confidence bands widen over time proportional to the square root of
          days forward, reflecting increasing uncertainty. This is a simplified
          heuristic model and should not be used for financial planning without
          additional analysis.
        </div>
      </div>
    </div>
  );
}
