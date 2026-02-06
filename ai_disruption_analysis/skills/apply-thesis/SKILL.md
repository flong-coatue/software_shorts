<apply-thesis>
Apply a thesis framework to any target. Use when you want to classify names against a framework, critique external analysis through your lens, or batch-process targets through a consistent analytical approach.

---

## Planning Phase

Stay in plan mode until all three are confirmed.

### 1. Confirm the Thesis

The user provides (or we create) a thesis as a markdown document.

**If they have one:**
- Confirm we're using the right file
- Read it and summarize the framework: buckets, criteria, decision logic

**If they don't:**
- Help them articulate it—what's the framework? What are the buckets? What determines classification?
- Get it into markdown before proceeding

### 2. Confirm the Target

Identify what we're pointing the thesis at. Typically a subset of the investable universe.

**Do:**
- List the scope (company names, document counts, folder structure)
- Use MCP tools for lists if helpful (`get_portfolio_context`, `get_farmteam_names`)
- Check `agent-retrieved-documents/` for existing coverage (just counts, not reads)

**Don't:**
- Deep-read documents yet
- Launch Explore agents to analyze content
- Fetch from Mosaic (save for execution)

### 3. Confirm Output Format

Propose what the deliverable looks like:
- Single company vs. multiple companies vs. document critique
- Key sections (classification matrix, evidence tables, gaps)
- File naming convention

### 4. Exit Plan Mode

Once thesis, target, and output are aligned → ExitPlanMode for approval.

---

## Execution Phase

After user approves the plan.

### 5. Gather Research

- Check `agent-retrieved-documents/` first for existing coverage
- Fetch from Mosaic if gaps exist (check with user for 5+ documents)
- Download before analyzing—don't stream from remote

### 6. Apply the Thesis

Launch analysis (Explore agents, deep reads) to:
- Classify each name/document against the framework
- Extract evidence quotes
- Flag gaps, conflicts, low conviction

### 7. Generate Output

Write the deliverable to markdown:
- Single company: `[ticker]-thesis-analysis.md`
- Multiple companies: `thesis-analysis-[date].md`
- Document critique: `critique-[source]-[ticker].md`

---

## Output Format

See `templates/output-format.md` for:
- Conventions (bucket notation, evidence tables, source naming)
- Format for single companies, multiple companies, and document critiques
- Conviction and length guidelines

---

## Key Principles

1. **Evidence over opinion** — Every classification tied to specific quotes
2. **Acknowledge uncertainty** — Flag gaps, conflicts, low conviction
3. **Thesis-agnostic** — Works with any framework that has classification buckets
4. **Planning is lightweight** — Heavy analysis waits for approval

</apply-thesis>
