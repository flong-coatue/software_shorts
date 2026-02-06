// ── Number Formatting ───────────────────────────────────────────────────────

export function formatNumber(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return "$" + formatNumber(value, decimals);
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return formatNumber(value, decimals) + "%";
}

export function formatLargeNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return sign + "$" + (abs / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return sign + "$" + (abs / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(1) + "K";
  return sign + "$" + abs.toFixed(0);
}

export function formatMillions(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return formatNumber(value / 1e6, decimals);
}

export function formatBillions(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return (value / 1e9).toFixed(decimals);
}

export function formatVolume(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";
  return value.toString();
}

export function formatCompactCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(1) + "T";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + "B";
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(0) + "M";
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(0) + "K";
  return sign + abs.toFixed(0);
}

// ── Color helpers ───────────────────────────────────────────────────────────

export function changeColor(value: number): string {
  if (value > 0) return "var(--fds-accent-green)";
  if (value < 0) return "var(--fds-accent-red)";
  return "var(--fds-text-secondary)";
}

export function changeSign(value: number): string {
  return value > 0 ? "+" : "";
}

// ── Date helpers ────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
