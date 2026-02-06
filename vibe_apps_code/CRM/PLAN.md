# CRM — AI Deal Room
**Category:** CRM | **Stack:** React / Next.js | **Incumbent:** Salesforce (CRM), HubSpot (HUBS)

## Thesis
CRM is a pipeline tracker + email drafter. AI scores deals, surfaces risks, and writes follow-ups automatically — making the human rep a supervisor, not a data entry clerk.

---

## data/
| File | Description |
|------|-------------|
| `contacts.json` | 50 contacts across 20 companies — name, title, company, email, phone, last_contact_date |
| `deals.json` | 30 deals — stage, amount, probability, close_date, assigned_rep, days_in_stage |
| `interactions.json` | Mock email/call log entries tied to deals — timestamp, type, summary, sentiment, next_action (~100 entries) |
| `email_templates.json` | 5 follow-up email templates — intro, follow-up, proposal, negotiation, close |

## interface/
Main component: `DealRoomApp.tsx` (imported by Next.js page route at `/crm`)

**Features:**
1. **Pipeline Dashboard** — Horizontal funnel visualization (Recharts funnel or custom SVG). Summary metric cards: total pipeline value, weighted forecast, deals at risk (stalled >14 days), win rate.
2. **Deal Detail Panel** — Click a deal to open a slide-over panel. AI-generated deal summary, auto-scored win probability (progress ring), risk factors list, recommended next action with rationale.
3. **Interaction Timeline** — Vertical timeline component for selected deal. Each entry shows type icon (email/call/meeting), one-line summary, sentiment badge (positive/neutral/negative), timestamp.
4. **Email Composer** — Select deal + template type. Pre-filled email with deal context (contact name, last interaction, stage). Editable textarea with "copy to clipboard" button.

**Key React components:**
- `PipelineFunnel` — SVG funnel with stage labels and deal counts
- `DealCard` — summary card with probability ring and risk indicators
- `Timeline` — vertical timeline with typed entries
- `EmailComposer` — template selector + editable draft area

**"AI" logic:** Win probability = base rate per stage + days-in-stage penalty + interaction recency bonus. Emails = template string interpolation with deal context.

## outputs/
| File | Description |
|------|-------------|
| `pipeline_forecast_sample.json` | Weighted pipeline forecast by month |
| `deal_summary_sample.md` | AI-generated deal brief |
| `drafted_email_sample.txt` | Sample generated follow-up email |
