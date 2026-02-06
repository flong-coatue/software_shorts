# SaaS AI Displacement Analysis

A structured framework for analyzing which SaaS application categories are most vulnerable to AI replacement, incorporating Coatue's proprietary research and investment theses.

## Overview

This analysis organizes by **application category** (not individual company), examining each through a consistent framework that considers:

1. What data the software sits on
2. What it does with that data
3. How easily an AI-native interface could replace it
4. What realistic barriers protect incumbents

## Files

| File | Description |
|------|-------------|
| `saas-ai-displacement.csv` | Main analysis table with 26 categories |
| `category-notes/` | Optional deep-dives per category |

---

## Key Findings (Informed by Coatue Research)

### Highest Conviction Shorts (High replaceability, weak barriers)

#### 1. Travel Booking / OTA (BKNG, EXPE, ABNB) - Active Short Thesis
- **Core thesis**: OTAs were "toll booths" in the search world; AI agents collapse the funnel
- **Take rate compression**: From ~13% today to 3-6% as discovery moves to LLMs
- **Disintermediation**: Hotels integrating directly with LLMs via Model Context Protocol (MCP)
- **Revenue at risk**: Sponsored listing revenue (~10% of rev) disappears as searches move to AI
- **Valuation**: Trading at 18x earnings - expensive given structural risk
- **Conviction**: "Obvious short" - economics worse in 5 years, possibly 1 year at current pace
- **Best case**: Become "pipes" at 3-7% take rates. **Worst case**: Business goes to zero

#### 2. IT Services / Consulting (ACN, INFY, EPAM) - Active Short Thesis
- **Core thesis**: Labor arbitrage model is broken when AI can code 24/7/365
- **Price deflation**: AI agent startups offering 85% discounts vs. ACN contracts
- **Proof point**: Legion Security (Coatue portco) won $1M ACN contract for $150K
- **Industry math**: For AI Cloud + SaaS to reach $2T by 2030, IT Services must CAGR at -2%
- **Hiring collapse**: ACN job postings down 66% YoY
- **Customer behavior**: Demanding 40% discounts at renewals; AT&T CIO: "AI is not good for these external agencies"
- **At-risk revenue**: 15-20% of app maintenance, 20-30% of code/documentation
- **INFY specific**: Worst positioned - lacks strategy consulting credibility, exposed to low-value labor

#### 3. Information Services - Bifurcated Risk
**HIGH RISK (TRI, FDS):**
- Market data is commoditized, essentially UI layers
- Claude Code can find "pretty frickin' good" alternatives to FactSet data
- FDS already seeing longer sales cycles, pricing pressure, margin compression
- AI native entrants emerging

**LOW RISK (SPGI):**
- Ratings business is duopoly, legally required, mission-critical
- Only ~5% of revenue from CapIQ (vulnerable piece)
- Proprietary data moat + AI drives margin expansion
- MI segment has ~5k+ employees doing manual data collection - can be automated 30%+
- Verisk similarly defensible (insurance data pooled into nonprofit)

### Other High-Risk Categories

| Category | Key Risk | Example |
|----------|----------|---------|
| Sales Engagement | Email/call commoditizing | CLARI, GONG |
| Marketing Automation | Content generation AI-native | HUBS |
| Video Conferencing | Infrastructure commodity | ZM |
| Low-Code / App Dev | AI coding overlap | PTC |
| Design Tools | Generative AI direct threat | ADBE, FGMR |

### Enterprise Software AI Losers Theme
- Seat growth and per-seat pricing stalling as AI agents commoditize UI layer
- Valuations still rich: NOW ~14x rev / 100x GAAP EPS; TEAM ~40x fwd EPS
- Structural rerating to 12-15x GAAP EPS likely
- High SBC will look unmanageable as multiples compress
- MNDY cited SEO algorithm changes hurting top-of-funnel - canary in coal mine

### Most Defensible (Low replaceability, strong barriers)

| Category | Why Defensible |
|----------|----------------|
| **Payments / Fintech** | Heavily regulated, trust paramount, network effects |
| **Security** | Mission-critical, rapidly evolving threats, breach risk existential |
| **Healthcare IT** | HIPAA/FDA, patient safety, liability concerns |
| **HCM / HR Software** | Payroll tax compliance, benefits complexity, audit requirements |
| **ERP** | Operational backbone, SOX compliance, mission-critical |

### Nuanced Cases

**E-commerce (SHOP)**
- Risk: If interface shifts from eyeballs to agents, merchants just need API hooks
- OpenAI's Agent Commerce Protocol (ACP) is bearish indicator to track
- Counter: SHOP integrating AI to supercharge merchants; dirty ops/logistics provide moat
- Key question: Does SHOP do enough "dirty operations" to be defensible?

**CRM (CRM, HUBS)**
- Data is portable but multi-user workflows create stickiness
- AI augments reps but doesn't replace system of record
- Ecosystem of 3rd party apps creates lock-in

---

## Framework

### Column Definitions

| Column | Question It Answers |
|--------|---------------------|
| `category` | What type of application is this? |
| `example_tickers` | Which public companies compete here? |
| `underlying_data` | What data does this software sit on? |
| `core_function` | What transformation/value-add happens on top of the data? |
| `interface_replaceability` | How easily could an AI agent perform the same function? |
| `realistic_barriers` | What non-technical factors protect incumbents? |

### Underlying Data Assessment

For each category, consider whether the data is:

- **Portable**: Easy to export and use elsewhere (e.g., contact lists)
- **Proprietary**: Created in the app, hard to recreate (e.g., workflow history)
- **Commodity**: Available from multiple sources (e.g., market data)

### Core Function Types

- **Workflow automation**: Sequencing tasks across users/systems
- **Analytics/insights**: Transforming raw data into decisions
- **Compliance/record-keeping**: Maintaining audit trails, meeting regulations
- **Network/marketplace**: Value from multi-party participation

### Interface Replaceability Scale

| Rating | Meaning |
|--------|---------|
| **High** | AI agents could largely replace the UI/workflow; core value is commoditizing |
| **Medium** | AI augments significantly but system of record / integrations have moat |
| **Low** | Regulatory, safety, or infrastructure requirements make replacement unlikely |

### Realistic Barriers

Non-technical factors that protect incumbents:

- **Regulatory/compliance**: SOX, HIPAA, GDPR, industry-specific rules
- **Network effects**: Value increases with more users (internal or external)
- **Ecosystem lock-in**: 3rd party apps, integrations, trained users
- **Switching costs**: Data migration, retraining, process disruption
- **Trust/liability**: Handling money, patient data, legal matters

---

## Coatue Research Sources

This analysis incorporates insights from:

| Topic | Source | Key Insight |
|-------|--------|-------------|
| OTA disruption | Investment thesis (Feb 2026) | Take rates compress 13% → 3-6%, hotels integrate directly with LLMs |
| IT Services | Investment memo (Jul 2025) | Labor arbitrage broken, 85% AI discounts, peak headcount already hit |
| SPGI defensibility | Expert calls (Jan 2026) | Ratings moat intact, MI margin expansion via AI automation |
| FDS weakness | Idea generation (Sep 2025) | Data commoditized, AI natives emerging, pricing pressure |
| Software multiples | Zoom recap (Aug 2025) | Seat growth stalling, structural rerating to 12-15x likely |
| SHOP risk | Zoom recap (Feb 2026) | Agent Commerce Protocol risk, but ops/logistics moat |

---

## Usage

1. Open `saas-ai-displacement.csv` in Excel or view in Cursor
2. Filter/sort by any column to identify patterns
3. Use category-notes/ for deeper analysis on specific categories
4. Cross-reference with portfolio positions and coverage universe

## Key Principles from Research

1. **Don't need negative earnings for compression** - just decelerating growth and terminal concerns
2. **Industry executives over 40 will say "it's not a problem"** - talk to disruptors (OpenAI, Anthropic) not incumbents
3. **Track real fundamental changes** - OTA thesis can point to real changes vs. hypothetical disruption
4. **Proprietary data vs. UI layer** - central question is whether AI disintermediates the UI layer while data stays valuable

## Methodology Notes

- Categories based on Coatue coverage universe and typical SaaS landscape
- Assessments are point-in-time (Feb 2026) - AI capabilities evolving rapidly
- Risk emerges from analyzing columns together, no pre-baked score
- Framework designed for discussion and iteration, not definitive rankings
