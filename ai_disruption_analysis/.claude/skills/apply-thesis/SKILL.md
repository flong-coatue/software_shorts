<apply-thesis>
Apply a thesis framework to any target. Use when you want to classify names against a framework, critique external analysis through your lens, or batch-process targets through a consistent analytical approach.

---

## Core Workflow

Two things matter:
1. **What is the thesis?**
2. **What are we pointing it at?**

Everything else flows from there.

### Step 1: Align on the Thesis

The user needs to provide (or we need to create) a thesis as a markdown document.

**If they have one:**
- Confirm we're using the right file
- Read it and understand the framework: buckets, criteria, decision logic

**If they don't:**
- Help them articulate it—what's the framework? What are the buckets? What determines classification?
- Get it into markdown before proceeding

This step is critical—we need to be crystal clear on what lens we're applying.

### Step 2: Identify the Target

Targets are typically a subset of the investable universe—whatever slice the user wants to examine through the thesis lens.

Use MCP tools to pull lists when helpful:
- `get_portfolio_context` → current longs/shorts
- `get_farmteam_names` → names under active consideration
- Sector screens, watchlists, or any other filter

Could also be documents, folders, or URLs. Just figure out what they're pointing at and ask if unclear.

### Step 3: Apply the Thesis

**Gather research as needed:**
- Check `agent-retrieved-documents/` first for existing coverage
- Fetch from Mosaic if gaps exist (check with user for 5+ documents)
- Download before analyzing—don't stream from remote

**Then apply the framework.** Output format depends on what makes sense for the target and scope.

**Output:** Always write to markdown file unless user specifies otherwise.
- Single company: `[ticker]-thesis-analysis.md`
- Multiple companies: `thesis-analysis-[date].md`
- Document critique: `critique-[source]-[ticker].md`

---

## Output Format

See `templates/output-format.md` for:
- Conventions (bucket notation, evidence tables, source naming)
- Output format for single companies, multiple companies, and document critiques
- Conviction and length guidelines

The format adapts to context — no need to choose between templates.

---

## Key Principles

1. **Evidence over opinion** — Every classification tied to specific quotes
2. **Acknowledge uncertainty** — Flag gaps, conflicts, low conviction
3. **Thesis-agnostic** — Works with any framework that has classification buckets

</apply-thesis>
