# ADBE — AI Design Studio
**Category:** Design Tools | **Stack:** React / Next.js | **Incumbent:** Adobe (ADBE), Figma (FGMR)

## Thesis
AI generates polished visual assets from a text prompt — no Photoshop or Figma required. Generative AI is a direct threat to the design tool category.

---

## data/
| File | Description |
|------|-------------|
| `brand_kits.json` | 3 brand kits (corporate, startup, creative) — each with primary/secondary/accent colors, font pairings, logo SVG placeholder |
| `design_templates.json` | 8 template definitions (social post, hero banner, email header, slide, logo, icon set, business card, infographic) — each with SVG layout rules, element positions, sizing |
| `svg_elements.json` | Library of ~30 reusable SVG primitives — shapes, icons, text blocks, decorative elements with default positioning |

## interface/
Main component: `DesignStudioApp.tsx` (imported by Next.js page route at `/adbe`)

**Features:**
1. **Prompt-to-Design Bar** — Text input: describe what you want (e.g., "hero banner for SaaS landing page, dark theme"). Keyword matching selects closest template + brand palette. Smooth generation animation.
2. **Live Canvas** — React-rendered SVG canvas. Click elements to select (selection handles appear). Drag to reposition. Properties panel shows editable color/size/text for selected element. Real-time re-render.
3. **Brand Palette Switcher** — Dropdown to swap brand kits. All elements auto-recolor via CSS custom properties. Visual warning if a manually-picked color deviates from the active kit.
4. **Export Panel** — Buttons: download SVG, download PNG (via canvas API conversion), copy inline CSS. Format selector with dimension presets.

**Key React components:**
- `DesignCanvas` — SVG renderer with selection/drag state management
- `ElementProperties` — sidebar form for editing selected element attributes
- `BrandPalettePicker` — dropdown with color swatch preview per kit
- `ExportToolbar` — export format buttons with download handlers

**"AI" logic:** Template composition — keyword match selects template + brand kit, populates SVG elements with brand colors and placeholder text. Visual polish comes from well-designed SVG templates.

## outputs/
| File | Description |
|------|-------------|
| `sample_hero_banner.svg` | Pre-generated example design |
| `sample_social_post.svg` | Pre-generated example design |
| `export_manifest.json` | Export metadata — dimensions, format, brand palette used |
