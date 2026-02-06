# AI Hitting Internet - Three-Bucket Classification Framework

## TODO
- [ ] Populate company universe table with specific tickers and bucket assignments
- [ ] Add quantitative thresholds for terminal value risk assessment
- [ ] Document specific revenue/traffic displacement metrics by company
- [ ] Cross-reference with sector-specific AI disruption timelines

---

## Core Thesis

High-multiple internet stocks are re-rating based on terminal value concerns, not near-term fundamentals. The market prices 2028+ terminal value today, which means:

1. Companies cannot "blow out numbers" to fight multiple compression
2. The narrative about AI disruption matters more than current performance
3. Some bear narratives are valid (real disruption), some are invalid (sentiment only)

**Key Insight:** The investable edge is distinguishing valid disruption narratives from invalid ones, and correctly identifying which companies are actually AI winners versus those merely perceived as such.

---

## Three-Bucket Classification Framework

### Bucket 1: AI Winner

**Label:** `ai_winner`

**Definition:** Company is actively benefiting from AI through revenue growth, cost reduction, or competitive moat strengthening.

**Action:** Long

**Criteria:**
- AI directly improves core product/service (e.g., recommendation engines, ad targeting)
- AI reduces cost structure materially (e.g., automation of operations)
- AI creates new revenue streams
- Competitive position strengthening due to AI capabilities
- Network effects or data advantages amplified by AI

**Evidence Required:**
- Demonstrable AI-driven metric improvement (engagement, conversion, efficiency)
- AI capex/investment translating to measurable outcomes
- Market share gains attributable to AI capabilities

---

### Bucket 2: Bear Narrative Invalid

**Label:** `bear_narrative_invalid`

**Definition:** Market believes company is an AI loser, but fundamentals are actually fine. The company faces sentiment/multiple compression risk, not fundamental disruption.

**Action:** Don't Touch (Neither long nor short)

**Criteria:**
- Core business model remains intact despite AI narrative
- AI disruption timeline is 5+ years out or uncertain
- Near-term fundamentals solid but multiple compressed
- Cannot "blow out numbers" to fight re-rating because market prices terminal value
- Sentiment risk without corresponding fundamental risk

**Key Distinction:** These companies might be fundamentally fine but are uninvestable because you cannot win the narrative battle with near-term performance. The market is pricing 2028+ scenarios today.

**Why Not Long:**
- Multiple compression can persist regardless of earnings beats
- You're fighting terminal value narrative with near-term fundamentals
- Time arbitrage doesn't work when market prices distant future

**Why Not Short:**
- Underlying business isn't actually broken
- Risk of narrative shift or AI fear exhaustion
- May actually be an AI winner that market misunderstands

---

### Bucket 3: Bear Narrative Valid

**Label:** `bear_narrative_valid`

**Definition:** Company faces clear, legitimate AI disruption thesis with identifiable mechanisms and timelines.

**Action:** Short

**Criteria:**
- AI directly substitutes core product/service
- Identifiable revenue/traffic displacement mechanism
- Competitive moat eroding due to AI alternatives
- Clear timeline for disruption (not "someday AI will...")
- Evidence of early displacement in metrics

**Evidence Required:**
- User behavior shift toward AI alternatives (measurable)
- Revenue or traffic declines attributable to AI competition
- Cost disadvantage versus AI-native competitors
- Loss of pricing power due to AI alternatives

---

## Valid vs Invalid Narrative Framework

### How to Distinguish Real Disruption from Sentiment

| Factor | Valid Narrative (Short) | Invalid Narrative (Avoid) |
|--------|------------------------|---------------------------|
| **Mechanism** | Clear, specific disruption path | Vague "AI will change everything" |
| **Timeline** | Identifiable milestones | "Someday" / "Eventually" |
| **Evidence** | Early metrics showing displacement | Speculation without data |
| **Substitution** | Direct replacement of core use case | Tangential or complementary AI |
| **User Behavior** | Observable shift to alternatives | Hypothetical user migration |

### Red Flags for Invalid Bear Narratives

1. **No specific mechanism:** "AI is bad for X" without explaining how
2. **Indefinite timeline:** Disruption always 5+ years away
3. **Ignores adaptation:** Assumes company won't integrate AI
4. **Category confusion:** AI competitor in adjacent, not core, use case
5. **Sentiment echo chamber:** Narrative driven by social media, not fundamentals

### Green Flags for Valid Bear Narratives

1. **Measurable substitution:** Users actively switching to AI alternative
2. **Revenue impact:** Early evidence of traffic/revenue displacement
3. **Structural disadvantage:** Company cannot match AI competitor's economics
4. **Timeline triggers:** Specific product launches or capability thresholds approaching
5. **Management acknowledgment:** Company addressing threat in filings/calls

---

## Terminal Value Risk Framework

### Why Near-Term Fundamentals Don't Matter

For high-multiple internet stocks, the stock price embeds assumptions about 2028+ terminal value. This creates a specific dynamic:

**The Math:**
- If market assumes 5% terminal growth and prices accordingly
- And narrative shifts to 2% terminal growth due to AI concerns
- Stock reprices immediately, regardless of Q1 earnings

**Implication:**
- You cannot "beat estimates" your way out of terminal value concerns
- Multiple compression happens independent of near-term execution
- The narrative battle is fought on 5-year outlooks, not next quarter

### When Terminal Value Risk Matters Most

1. **High current multiple:** More terminal value in price, more sensitivity
2. **Growth deceleration:** Market extrapolates deceleration into terminal
3. **AI narrative attached:** Market specifically pricing AI disruption scenario
4. **No visible AI response:** Company not demonstrating AI adaptation

### When Terminal Value Risk is Overstated

1. **AI actually helps business:** Misclassified as loser when winner
2. **Disruption timeline too long:** 10-year disruption priced into 3-year stock
3. **Adaptation underestimated:** Company can integrate AI into existing moat
4. **Multiple already compressed:** Terminal value concern already priced

---

## Decision Tree for Bucket Assignment

```
START: Evaluate company for AI impact
│
├─► Is AI directly improving the company's core business?
│   │
│   ├─► YES: Does the company have unique AI advantages?
│   │   │
│   │   ├─► YES → BUCKET 1: AI Winner (Long)
│   │   │
│   │   └─► NO: Is AI at least neutral to slightly positive?
│   │       │
│   │       ├─► YES → BUCKET 1: AI Winner (Long)
│   │       │
│   │       └─► NO → Continue evaluation
│   │
│   └─► NO: Is there a clear AI disruption mechanism?
│       │
│       ├─► YES: Is disruption timeline < 5 years with evidence?
│       │   │
│       │   ├─► YES → BUCKET 3: Bear Narrative Valid (Short)
│       │   │
│       │   └─► NO → BUCKET 2: Bear Narrative Invalid (Avoid)
│       │
│       └─► NO: Is market pricing AI disruption anyway?
│           │
│           ├─► YES → BUCKET 2: Bear Narrative Invalid (Avoid)
│           │
│           └─► NO → Likely not an AI-impacted name
```

---

## Company Universe

| Company | Ticker | Bucket | AI Impact Thesis | Key Metrics to Monitor |
|---------|--------|--------|------------------|----------------------|
| *[To be populated]* | | | | |

**Note:** Company assignments require individual analysis using the framework above. This table will be populated through stock-by-stock classification.

---

## Classification Output Format

When classifying stocks against this theme, use the following labels:

| Classification | Meaning | Investment Action |
|---------------|---------|-------------------|
| `ai_winner` | Actively benefiting from AI | Long |
| `bear_narrative_invalid` | Market wrong about disruption, but sentiment risk | Avoid |
| `bear_narrative_valid` | Legitimate AI disruption thesis | Short |

**Note:** This three-bucket framework differs from the standard beneficiary/irrelevant/hurt taxonomy used by other themes.

---

## Open Questions

1. **Quantitative thresholds:** What traffic/revenue decline percentage triggers "valid" designation?
2. **Timeline calibration:** Is 3 years or 5 years the right threshold for "actionable" disruption?
3. **Cross-sector application:** Can this framework extend to fintech, industrials with modification?
4. **Narrative indicators:** What signals predict when invalid narratives become valid (or vice versa)?
5. **Position sizing:** How to size around the uncertainty in bucket 2 situations?

---

## Source Documents

- AI hitting internet themes discussion (reference transcript)
- Internet sector meeting notes - `docs/meeting_notes/`

---

*Last updated: February 2026*
