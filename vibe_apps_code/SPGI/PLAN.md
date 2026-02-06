# SPGI — AI Research Terminal
**Category:** Information Services / Data Providers | **Stack:** React / Next.js | **Incumbent:** S&P Global (SPGI), FactSet (FDS), Thomson Reuters (TRI)

## Thesis
The $30K/seat FactSet/CapIQ terminal is mostly a UI on top of accessible data. AI assembles and formats financial research in seconds.

> **Note:** This targets the CapIQ/FDS portion. SPGI's Ratings business is a defensible duopoly — legally required, mission-critical, only ~5% of rev from CapIQ.

---

## data/
| File | Description |
|------|-------------|
| `company_financials.json` | 5 companies x 3 years — revenue, EBITDA, net income, debt, cash, margins, growth rates |
| `market_data.json` | Daily price data for 5 companies over 1 year — date, ticker, price, volume, market_cap (~1,250 rows) |
| `credit_metrics.json` | Credit ratios — debt/EBITDA, interest coverage, FCF yield, current ratio for 5 companies |
| `peer_comps.json` | Comp table — EV/Revenue, EV/EBITDA, P/E, growth, margins for 5 companies |
| `research_snippets.json` | Pre-written analyst commentary per company — bull case, bear case, key risks, catalysts |

## interface/
Main component: `ResearchTerminalApp.tsx` (imported by Next.js page route at `/spgi`)

**Features:**
1. **Company Tear Sheet** — Dropdown selector. Key metrics in card grid (market cap, EV/EBITDA, revenue growth, credit proxy). 1-year price chart (Recharts line) alongside. Dark terminal aesthetic.
2. **Financial Tables** — Tabbed view: P&L, Balance Sheet, Cash Flow. 3-year data with fiscal periods as columns. Conditional text coloring (green positive / red negative growth).
3. **Peer Comp Table** — All 5 companies in a sortable table. Selected company row highlighted. Rank badges on each metric. Click column headers to sort.
4. **Research Report Generator** — "Generate Report" button assembles formatted markdown: company overview, financial summary, peer positioning, bull/bear case, key risks. Rendered in a modal with "Download .md" button.

**Key React components:**
- `TearSheet` — metric cards + price chart layout
- `FinancialTable` — fiscal-periods-as-columns table with conditional formatting
- `CompTable` — sortable comparison table with rank indicators
- `ReportModal` — full-screen modal rendering assembled markdown with download

**"AI" logic:** Template-driven report assembly — pull data from JSON, insert into markdown template, apply bull/bear commentary. Dark theme with monospace accents for terminal feel.

## outputs/
| File | Description |
|------|-------------|
| `sample_research_report.md` | Pre-generated company research report |
| `comp_table_sample.json` | Formatted peer comp data |
| `credit_analysis_sample.md` | Credit-style analysis output |
