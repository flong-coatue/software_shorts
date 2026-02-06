# GTLB — AI DevOps Command Center
**Category:** DevOps / CI-CD | **Stack:** React / Next.js | **Incumbent:** GitLab (GTLB)

## Thesis
AI diagnoses build failures by pattern-matching logs and suggests fixes — replacing the Jenkins/GitLab monitoring UI with an intelligent agent that handles the "is it broken and why?" loop.

---

## data/
| File | Description |
|------|-------------|
| `pipeline_runs.json` | 50 pipeline runs — stages (build, test, lint, security-scan, deploy), status per stage, duration, timestamps, commit info |
| `build_logs.json` | Mock log output for 10 failed builds — recognizable error patterns (dependency conflict, test failure, timeout, OOM, permission denied) |
| `failure_patterns.json` | Knowledge base — 15 error signatures mapped to root causes, suggested fixes, and confidence scores |
| `deploy_history.json` | Deployment log — environment, version, timestamp, deployer, rollback flag (30 deploys) |

## interface/
Main component: `DevOpsApp.tsx` (imported by Next.js page route at `/gtlb`)

**Features:**
1. **Pipeline Visualization** — Animated horizontal flow: stages as connected nodes with CSS transitions. Color-coded status (green/yellow/red/gray). Click a stage to expand details. Auto-cycles through recent runs.
2. **Failure Diagnosis Panel** — Select a failed run: shows log excerpt in monospace with error line highlighted. Matched pattern from knowledge base. Suggested fix with confidence badge. "Apply Fix" mock button.
3. **Deployment Timeline** — Vertical timeline of recent deploys. Version tags, environment badges (prod/staging/dev), rollback indicators. Expandable diff showing what changed.
4. **DORA Metrics Banner** — Top bar with 4 gauges: build success rate (7-day), mean time to recovery, deploy frequency, change failure rate. Animated on load.

**Key React components:**
- `PipelineFlow` — horizontal SVG/CSS pipeline with animated connections
- `LogViewer` — monospace log display with line highlighting and error detection
- `DeployTimeline` — vertical timeline with expandable entries
- `DORAGauge` — circular gauge component for each DORA metric

**"AI" logic:** Error line → regex match against `failure_patterns.json` → root cause + suggested fix. CSS animations + `setInterval` simulate live monitoring feel. Dark theme throughout.

## outputs/
| File | Description |
|------|-------------|
| `incident_report_sample.md` | Auto-generated incident summary |
| `pipeline_health_sample.json` | DORA metrics snapshot |
