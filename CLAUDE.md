# SaaS AI Displacement — Vibe Coded Demos

This project contains a collection of vibe-coded demo apps illustrating how AI could displace incumbent SaaS products. Each app is a self-contained Next.js application that simulates an "AI-native" replacement for a specific public company's core product.

## Project Structure

```
flong_software/
├── saas-ai-displacement/       # Research: analysis framework, CSV data, category notes
├── vibe_apps_code/             # Demo apps (one per ticker)
│   ├── CRM/app/                # AI Deal Room (Salesforce replacement)
│   ├── INTU/app/               # AI Bookkeeper (QuickBooks/TurboTax replacement)
│   ├── MNDY/app/               # AI Project Manager (monday.com replacement)
│   ├── ADBE/                   # (planned)
│   ├── CSGP/                   # (planned)
│   ├── GTLB/                   # (planned)
│   ├── SHOP/                   # (planned)
│   ├── SNOW/                   # (planned)
│   └── SPGI/                   # (planned)
```

## Tech Stack (all apps)

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Language:** TypeScript

All "AI" logic is client-side only (keyword matching, rule-based scoring, template interpolation). No LLM API calls.

## Running the Apps

Each app lives in `vibe_apps_code/<TICKER>/app/`. First-time setup requires `npm install` in each app directory.

### Quick Start (all 3 apps)

```bash
# Install dependencies (first time only)
cd vibe_apps_code/CRM/app  && npm install
cd vibe_apps_code/INTU/app && npm install
cd vibe_apps_code/MNDY/app && npm install

# Run all 3 on different ports
cd vibe_apps_code/CRM/app  && npm run dev -- -p 3000 &
cd vibe_apps_code/INTU/app && npm run dev -- -p 3001 &
cd vibe_apps_code/MNDY/app && npm run dev -- -p 3002 &
```

### App URLs

| App | Ticker | Port | URL | Description |
|-----|--------|------|-----|-------------|
| AI Deal Room | CRM | 3000 | http://localhost:3000/crm | Pipeline dashboard, deal scoring, email composer |
| AI Bookkeeper | INTU | 3001 | http://localhost:3001/intu | Transaction categorizer, financial statements, compliance, forecasting |
| AI Project Manager | MNDY | 3002 | http://localhost:3002/mndy | Kanban board, Gantt chart, workload view, status reports |

### Stop All Servers

```bash
lsof -ti:3000,3001,3002 | xargs kill -9
```

## App Details

### CRM — AI Deal Room
**Thesis:** CRM is a pipeline tracker + email drafter. AI scores deals, surfaces risks, and writes follow-ups — making the rep a supervisor, not a data entry clerk.

- Pipeline Dashboard with funnel visualization and metric cards
- Deal Detail Panel with AI-scored win probability and risk factors
- Interaction Timeline with sentiment badges
- Email Composer with template interpolation

### INTU — AI Bookkeeper
**Thesis:** Bookkeeping is data entry + categorization + report formatting — all trivially automatable. An AI agent ingests bank transactions, auto-categorizes them, and generates financial statements in seconds.

- Transaction Categorizer with confidence-scored COA mapping (click to override)
- Financial Statement Generator (Income Statement, Balance Sheet, Cash Flow)
- Compliance Dashboard with severity-flagged issues
- 90-Day Cash Flow Forecast with confidence bands

### MNDY — AI Project Manager
**Thesis:** Describe your project in one sentence and get a full task breakdown, Gantt chart, and team assignments. monday.com's UI is low moat — seat growth stalls as AI agents commoditize the interface layer.

- Kanban Board with drag-and-drop and AI project generation
- Interactive SVG Gantt Chart with dependency arrows and critical path
- Team Workload View with allocation thresholds
- Status Report Generator with copy/download

## Adding New Apps

Each app follows a consistent pattern. See any existing `PLAN.md` for the spec:

1. `<TICKER>/PLAN.md` — Feature spec and data schema
2. `<TICKER>/app/src/data/` — Mock JSON data
3. `<TICKER>/app/src/lib/` — Types, utilities, "AI" logic
4. `<TICKER>/app/src/components/` — React components
5. `<TICKER>/app/src/app/<route>/page.tsx` — Next.js page

Config files (package.json, tsconfig, postcss, eslint, gitignore) are identical across all apps.
