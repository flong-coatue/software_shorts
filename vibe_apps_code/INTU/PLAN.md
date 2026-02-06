# INTU — AI Bookkeeper
**Category:** Accounting / Finance | **Stack:** React / Next.js | **Incumbent:** Intuit (QuickBooks, TurboTax)

## Thesis
Bookkeeping is data entry + categorization + report formatting — all trivially automatable. An AI agent ingests raw bank transactions, auto-categorizes them, and generates financial statements in seconds.

---

## data/
| File | Description |
|------|-------------|
| `bank_transactions.json` | 6 months of mock checking account transactions — date, description, amount, running balance (~300 rows) |
| `invoices.json` | AP/AR invoices — vendor/customer, amount, due date, status (paid/unpaid/overdue) (~80 rows) |
| `chart_of_accounts.json` | Standard COA structure (assets, liabilities, equity, revenue, expenses) with account codes (~40 accounts) |
| `tax_rules.json` | Simplified tax rules — sales tax rates by state, depreciation schedules, deduction categories |

## interface/
Main component: `BookkeeperApp.tsx` (imported by Next.js page route at `/intu`)

**Features:**
1. **Transaction Categorizer** — Table of bank transactions with auto-assigned COA categories + confidence scores. Color-coded confidence badges. Click to override category.
2. **Financial Statement Generator** — Tabbed view: Income Statement, Balance Sheet, Cash Flow Statement. Clean formatted tables with fiscal periods as columns. One-click generate from categorized data.
3. **Compliance Dashboard** — Card grid with red/yellow/green flags: overdue invoices, uncategorized transactions, unusual amounts, missing docs. Click a flag to drill into the issue.
4. **Cash Flow Forecast** — 90-day forward projection chart (Recharts area chart with confidence bands). Based on recurring patterns in historical transactions.

**Key React components:**
- `TransactionTable` — sortable/filterable data table with inline category editing
- `FinancialStatement` — tabular financial statement renderer (periods as columns)
- `ComplianceCard` — status card with severity indicator
- `ForecastChart` — Recharts area chart with confidence interval shading

**"AI" logic:** Keyword-matching on transaction descriptions → COA categories. Confidence = rule specificity score. No LLM needed.

## outputs/
| File | Description |
|------|-------------|
| `income_statement_sample.json` | Sample generated P&L data |
| `balance_sheet_sample.json` | Sample generated balance sheet data |
| `compliance_report_sample.md` | Markdown compliance flag report |
