# SNOW — AI Data Analyst
**Category:** Data / Analytics | **Stack:** React / Next.js | **Incumbent:** Snowflake (SNOW), Datadog (DDOG), MongoDB (MDB)

## Thesis
You don't need a $90B data warehouse to do analytics — describe what you want in English, get a chart in seconds.

---

## data/
| File | Description |
|------|-------------|
| `sales_data.json` | 2 years of sales transactions — date, region, product_category, customer_segment, revenue, units, cost (~2,000 rows, trimmed for JSON) |
| `customer_data.json` | Customer dimension table — id, name, segment, region, acquisition_date, lifetime_value (~200 rows) |
| `product_data.json` | Product dimension table — id, name, category, unit_price, cost, launch_date (~50 rows) |
| `query_mappings.json` | 15 pre-built natural language → filter/aggregation mappings (the "NLP engine") |

## interface/
Main component: `DataAnalystApp.tsx` (imported by Next.js page route at `/snow`)

**Features:**
1. **Natural Language Query Bar** — Prominent search input at top. Type a plain-English question (e.g., "What were Q4 sales by region?"). App matches to a pre-built query pattern. Shows the interpreted query breakdown for transparency.
2. **Auto-Visualization** — Automatically picks chart type: bar for categories, line for time series, scatter for correlations, pie for composition. Recharts rendering. Chart type toggle to override.
3. **Data Explorer** — Collapsible panel showing raw data tables, schema view (all fields + types), quick stats (row counts, date ranges, top values per column).
4. **Dashboard Cards** — Sidebar with 6 pre-built analysis cards (Revenue by Region, Monthly Trend, Top 10 Customers, Product Mix, Segment Breakdown, YoY Growth). Click to load instantly.

**Key React components:**
- `QueryBar` — search input with autocomplete suggestions from query_mappings
- `SmartChart` — auto-selects Recharts chart type based on data shape
- `DataTable` — sortable/filterable table with pagination
- `DashboardCard` — clickable summary card with sparkline preview

**"AI" logic:** Keyword-based fuzzy matching against `query_mappings.json`. Each mapping defines: trigger keywords, data source, group-by fields, aggregation, and chart type. Client-side filtering/aggregation on JSON data.

## outputs/
| File | Description |
|------|-------------|
| `sample_dashboard.json` | Pre-configured dashboard layout with 6 cards |
| `query_log_sample.json` | Sample log of queries run |
