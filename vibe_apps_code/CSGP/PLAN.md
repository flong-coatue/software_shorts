# CSGP — AI Property Intelligence
**Category:** Real Estate Tech | **Stack:** React / Next.js | **Incumbent:** CoStar Group (CSGP), Zillow (ZG)

## Thesis
CoStar charges $35K/year for what AI + public data can replicate — property search, comparable sales analysis, and market heat maps. Search and matching are AI-ready; CSGP is viewed as Bloomberg for real estate — way too expensive given AI risk.

---

## data/
| File | Description |
|------|-------------|
| `properties.json` | 40 commercial properties in Austin, TX — address, lat/lng (real coordinates), type (office/retail/industrial), sqft, price_per_sqft, cap_rate, year_built, occupancy_rate, listing_status |
| `transactions.json` | 30 recent comparable sales — property ref, sale_price, sale_date, buyer, price_per_sqft, cap_rate |
| `market_analytics.json` | Market stats by submarket (5 Austin submarkets) — avg rent, vacancy rate, absorption, new supply, rent growth YoY |
| `property_summaries.json` | Pre-written AI investment summaries for each property — strengths, risks, comp positioning, recommendation |

## interface/
Main component: `PropertyIntelApp.tsx` (imported by Next.js page route at `/csgp`)

**Features:**
1. **Natural Language Search** — Search bar: "industrial warehouse near downtown under $30/sqft." Keyword parsing filters by type, price threshold, location proximity. Results update on map + list simultaneously.
2. **Interactive Map** — React-Leaflet map centered on Austin. Property markers color-coded by type. Click marker for popup card with key metrics. Heat map overlay toggle (price intensity). Submarket boundary polygons.
3. **Property Detail Panel** — Click a property to open slide-out panel: colored placeholder image, key metrics table, AI investment summary, comparable sales table (3-5 nearest comps), submarket rent trend mini-chart (Recharts).
4. **Market Dashboard** — Toggle to dashboard view: submarket comparison table (sortable), vacancy rate bar chart, rent growth trend lines, absorption chart. All Recharts.

**Key React components:**
- `PropertyMap` — React-Leaflet with marker layer, heat map plugin, submarket polygons
- `SearchBar` — text input with parsed filter chips (type, price, location)
- `PropertyDetailDrawer` — slide-out panel with metrics, summary, comps table, mini chart
- `MarketDashboard` — grid of Recharts charts with submarket selector

**"AI" logic:** Keyword parsing for property type, price thresholds (regex for "$XX/sqft"), location terms (mapped to submarket centroids for distance calc). Heat map via react-leaflet-heatmap-layer. OpenStreetMap tiles (no API key needed).

## outputs/
| File | Description |
|------|-------------|
| `property_report_sample.md` | AI-generated property investment summary |
| `comp_analysis_sample.json` | Comparable sales analysis output |
| `market_snapshot_sample.json` | Submarket analytics export |
