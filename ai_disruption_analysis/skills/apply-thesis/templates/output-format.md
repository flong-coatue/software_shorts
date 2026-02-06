# Output Format

This document contains all formatting conventions and output templates for applying a thesis framework.

---

## Conventions

### Bucket Notation

Always include both the bucket number and label for readability:

```
Bucket X: Label
```

**Examples:**
- Bucket 1: [Label] → LONG
- Bucket 2: [Label] → AVOID
- Bucket 3: [Label] → SHORT

### Placeholders

Use brackets for template placeholders:
- `[TICKER]` — Stock symbol
- `[Company Name]` — Full company name
- `[Bucket X: Label]` — Classification with label

### Evidence Tables

Standard format for all citations:

| Source | Date | Quote |
|--------|------|-------|
| Q4'25 Earnings Call | 2026-01-30 | CFO: "[quote]" |
| Morgan Stanley (p. 4) | 2026-01-15 | "[quote]" |

### Source Naming

| Source Type | Format | Example |
|-------------|--------|---------|
| Earnings call | Q[#]'[YY] Earnings Call | Q4'25 Earnings Call |
| SEC filing | [Filing Type] [Period] | 10-K FY2025, 10-Q Q3'25 |
| Sell-side | Broker name (page if specific) | Goldman Sachs (p. 12) |
| Internal | Coatue: [Note Type] | Coatue: Earnings Reaction |
| Expert call | Coatue Expert Call | Coatue Expert Call |

### Speaker Attribution

For earnings calls and meetings, identify the speaker:

```
CEO: "[quote]"
CFO: "[quote]"
```

---

## Output Format

The output adapts to what you're analyzing.

### Single Company

```markdown
## [TICKER]: [Company Name]

**Thesis Applies?** [Yes / Partial / No — if partial/no, explain]
**Classification:** [Bucket X: Label]
**Action:** [LONG/SHORT/AVOID/MONITOR]
**Conviction:** [High/Medium/Low]
**Current Position:** [None / Long X bps / Short X bps]

### Decision Path
[Walk through thesis criteria. Why this bucket? Show the logic.]

### Supporting Evidence
| Source | Date | Quote |
|--------|------|-------|
| ... | ... | ... |

### Counter-Evidence & Risks
- [What could invalidate this view?]

### Gaps
- [What data would change conviction?]
```

### Multiple Companies (3+)

Start with a summary table:

| Ticker | Company | Thesis Fit | Classification | Position | Conviction | One-Line Rationale |
|--------|---------|------------|----------------|----------|------------|-------------------|
| [TICKER] | [Company] | Yes | Bucket X: Label | Long 50 bps | High | [Rationale] |
| [TICKER] | [Company] | Partial | Bucket X: Label | None | Medium | [Rationale] |

Then include per-company sections (same format as single company) for names needing detail.

### Document Critique

When critiquing external analysis:

```markdown
## Critique: [Document Title]

**Source:** [Broker/Author]
**Date:** YYYY-MM-DD
**Company:** [TICKER]: [Company Name]

### Their View
**Rating:** [Buy/Hold/Sell]
**Key Thesis:** [1-2 sentences]
**Main Arguments:**
- [Argument 1]
- [Argument 2]

### Mapped to Our Framework

| Dimension | Their View | Our View | Aligned? |
|-----------|-----------|----------|----------|
| [Factor 1] | ... | ... | ✓/✗ |

**Their Implied Bucket:** [Bucket X: Label]
**Our Bucket:** [Bucket X: Label]

### Key Quotes
| Source | Date | Quote |
|--------|------|-------|
| MS (p. 4) | 2026-01-15 | "[quote from their report]" |

### What They're Missing
- [Gap 1]
- [Gap 2]

### Implications
[What does this mean for our view?]
```

---

## Conviction Levels

| Level | Meaning | Evidence Bar |
|-------|---------|--------------|
| High | Strong directional view | Multiple sources, consistent, recent |
| Medium | Reasonable confidence | Some support, minor gaps |
| Low | Educated guess | Limited/stale/conflicting data |

---

## Length Guidelines

| Context | Length |
|---------|--------|
| Summary table row | ~15 words rationale |
| Single company (low conviction) | 200-300 words |
| Single company (high conviction) | 400-500 words |
| Document critique | 400-600 words |
