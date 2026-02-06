// Bank transaction from checking account
export interface BankTransaction {
  id: string;
  date: string; // ISO date
  description: string;
  amount: number; // negative = debit, positive = credit
  running_balance: number;
  type: "debit" | "credit";
}

// AP/AR invoice
export interface Invoice {
  id: string;
  type: "payable" | "receivable";
  counterparty: string;
  description: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: "paid" | "unpaid" | "overdue";
  paid_date: string | null;
}

// Chart of Accounts entry
export interface AccountEntry {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parent_code: string | null;
  description: string;
}

// Tax rule
export interface TaxRule {
  id: string;
  category: "sales_tax" | "depreciation" | "deduction";
  name: string;
  rate: number;
  applicable_states: string[];
  description: string;
}

// AI categorization result
export interface CategorizationResult {
  accountCode: string;
  accountName: string;
  confidence: number; // 0-1
}

// Transaction with AI categorization applied
export interface CategorizedTransaction extends BankTransaction {
  categorization: CategorizationResult;
  overrideAccountCode?: string;
  overrideAccountName?: string;
}

// Compliance flag item
export interface ComplianceFlag {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "overdue_invoices" | "uncategorized" | "unusual_amounts" | "missing_docs";
  title: string;
  description: string;
  items: ComplianceFlagItem[];
}

export interface ComplianceFlagItem {
  id: string;
  label: string;
  detail: string;
  amount?: number;
}

// Financial statement line item
export interface StatementLineItem {
  label: string;
  values: Record<string, number>; // month key -> amount
  isSubtotal?: boolean;
  isBold?: boolean;
  indent?: number;
}

// Forecast data point
export interface ForecastPoint {
  date: string;
  actual?: number;
  projected?: number;
  upperBound?: number;
  lowerBound?: number;
}

// Tab navigation
export type TabId = "transactions" | "statements" | "compliance" | "forecast";

// Statement sub-tabs
export type StatementType = "income" | "balance" | "cashflow";

// Sort configuration
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}
