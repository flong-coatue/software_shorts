# Takeaways: SaaS AI Displacement Demos

## The Graduation Tax Is Dead

The commercial model for most horizontal SaaS has always relied on the same pattern: a small business starts with a spreadsheet. It works fine at first — tracking deals, logging transactions, managing tasks. Then the spreadsheet breaks. Too many rows, too many tabs, too many people editing at once. The business "graduates" to real software: Salesforce, QuickBooks, monday.com. They start paying per seat, per month, forever.

That graduation moment is what funds the entire SaaS industry. And it's disappearing.

**The core insight from these demos is simple: vibe coding lets small businesses build exactly the software they need — on top of what is essentially still a spreadsheet — without ever graduating to a paid SaaS product.**

Each of these three apps took minutes to generate, not months. They run locally. They cost nothing. And they do 80% of what the incumbent product does for a typical small business:

| Demo | Replaces | What It Actually Is |
|------|----------|---------------------|
| AI Deal Room | Salesforce CRM | A pipeline tracker on top of a contact list |
| AI Bookkeeper | QuickBooks | A categorizer + report generator on top of bank transactions |
| AI Project Manager | monday.com | A Kantt chart + Kanban on top of a task list |

None of these apps call an LLM. The "AI" is keyword matching, rule-based scoring, template interpolation. The point isn't that the AI is sophisticated — it's that the *software itself* is unsophisticated. These products were always thin UI layers on top of structured data. The moat was that building software was hard. It's not anymore.

## What This Means for Incumbents

**Seat growth stalls.** The next 10,000 small businesses that would have signed up for monday.com will vibe code their own project tracker instead. They'll get exactly the columns they want, exactly the views they need, and they'll never pay $12/seat/month.

**Per-seat pricing compresses.** Even businesses that stay on incumbent platforms will demand lower prices when the alternative is "my intern built this in an afternoon." The negotiating leverage shifts permanently.

**The low end is indefensible.** Enterprise contracts with complex integrations, compliance requirements, and multi-team workflows are safe for now. But the long tail of SMB customers — the volume that drives seat count growth — is the most vulnerable. These are the customers who never needed 90% of the features. They needed a table, some charts, and a way to share it.

## The Spreadsheet Never Left

The fundamental data structures behind these products haven't changed:

- **CRM**: Contacts table + deals table + activity log
- **Bookkeeping**: Transaction ledger + chart of accounts + invoice register
- **Project management**: Task list + team roster + dependency map

What changed is that building a usable interface on top of these structures used to require a dev team. Now it requires a sentence. The spreadsheet didn't fail — the UI layer just got democratized.

## What We're Watching

- **Seat growth deceleration** in SMB-focused SaaS (MNDY, HUBS, FROG, ZM)
- **Net retention compression** as small customers churn to DIY solutions
- **Pricing pressure** at renewals — are customers demanding discounts citing AI alternatives?
- **Top-of-funnel decay** — MNDY already flagged SEO algorithm changes hurting lead gen. This is the canary.
- **Enterprise vs. SMB cohort divergence** — if enterprise holds while SMB churns, the multiple needs to reflect the smaller TAM
