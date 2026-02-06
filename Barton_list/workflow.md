# Workflow — How This Was Built

## Process

1. **Captured Slack context** — Copied the Slack conversation between mbarton, gtsai, and flong where Barton described his Notion mapping project and shared a screenshot of the OTAs table
2. **Transcribed the screenshot** — Claude read the OTAs table image and recreated it as a clean markdown table with all four columns (Disrupted / Disruptors / AI Native Startups / Investors)
3. **Organized into working files** — Created this folder with raw context (`slack-context.md`), the debate mapping (`internet-debates.md`), and this workflow doc

## What's Here

| File | Purpose |
|------|---------|
| `slack-context.md` | Verbatim Slack messages — the original ask and context |
| `internet-debates.md` | The debate mapping table, starting with OTAs from Barton's screenshot |
| `workflow.md` | This file — how GT built this and next steps |

## Next Steps

- **Expand categories** — Add more vertical debates beyond OTAs (CRM, e-commerce, ITSM, project mgmt, fintech, etc.)
- **Build dream contact list** — For each category, identify the most tech-forward companies and specific people to speak to (Head of AI, VP Eng, etc.)
- **Pull internal notes** — Use Claude to pull relevant Coatue notes and enrich the mapping:
  - Ramp BoD insights (note 129733)
  - Stripe webinar takeaways (note 129619)
  - CHRW displacement analysis (note 129647)
  - TEAM churn data (note 129676)
  - Jan 12 strategy meeting (note 128973)
- **Iterate with Barton** — Feed enriched tables back into his Notion, identify gaps, add new names
- **Track leading indicators** — Flag the most tech-forward companies (Ramp, DASH, Stripe, SHOP) where early data points on SaaS replacement would be most compelling for the Philippe conversation
