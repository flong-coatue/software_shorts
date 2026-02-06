# SHOP — AI Storefront Builder
**Category:** E-commerce Platforms | **Stack:** React / Next.js | **Incumbent:** Shopify (SHOP)

## Thesis
Describe your store in one sentence → full e-commerce storefront in 30 seconds. If the interface shifts from eyeballs to AI agents, merchants just need API hooks — why build websites? Shopify's UI layer is trivially replicable.

---

## data/
| File | Description |
|------|-------------|
| `store_configs.json` | 3 pre-built store personas (artisanal coffee, fitness gear, kids toys) — name, tagline, color scheme, layout |
| `product_catalog.json` | 15 products across 3 stores — name, description, price, category, inventory_count, rating, image color/initials for SVG placeholder |
| `customer_orders.json` | 20 mock orders — items, totals, status (pending/shipped/delivered), shipping info |
| `store_themes.json` | 3 theme configs (minimal, bold, playful) — colors, fonts, spacing, border-radius, shadow definitions |

## interface/
Main component: `StorefrontApp.tsx` (imported by Next.js page route at `/shop`)

**Features:**
1. **Store Generator** — Hero input with "Generate Store" button. Type a store concept (e.g., "artisanal coffee subscription"). Keyword match selects config + theme. Page transforms into a styled storefront with smooth CSS transition.
2. **Product Grid** — Responsive CSS Grid of product cards. SVG placeholder images (gradient backgrounds with product initials). Price, star rating, "Add to Cart" button. Category filter tabs.
3. **Shopping Cart + Checkout** — Slide-out cart drawer (Headless UI or custom). Add/remove items, quantity stepper, running total. Mock checkout form with success animation on "Place Order."
4. **Merchant Dashboard** — Toggle switches storefront view to merchant admin: orders table, revenue chart (Recharts bar), inventory status badges (in stock/low/out). Split-screen feel.

**Key React components:**
- `StoreGenerator` — prompt input with theme transformation logic
- `ProductCard` — card with SVG placeholder, price, rating stars, add-to-cart
- `CartDrawer` — slide-out panel with cart items and checkout form
- `MerchantDashboard` — orders table + Recharts revenue chart + inventory grid

**"AI" logic:** Keyword match → store config + theme. CSS custom properties (via React state) enable instant theme switching. SVG placeholder images generated from product metadata.

## outputs/
| File | Description |
|------|-------------|
| `generated_store_config.json` | Sample generated store configuration |
| `sample_storefront_screenshot.md` | Description of what the generated store looks like |
