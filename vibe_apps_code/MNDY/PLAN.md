# MNDY — AI Project Manager
**Category:** Project Management | **Stack:** React / Next.js | **Incumbent:** monday.com (MNDY), Atlassian (TEAM)

## Thesis
Describe your project in one sentence → full task breakdown, Gantt chart, and team assignments. monday.com's task management UI is low moat — seat growth and per-seat pricing stall as AI agents commoditize the UI layer.

---

## data/
| File | Description |
|------|-------------|
| `project_templates.json` | 3 project templates (product launch, website redesign, Q1 planning) — pre-defined task structures, durations, dependencies, team assignments |
| `team_members.json` | 8 team members — name, role, avatar color, capacity (hours/week), skills, current workload % |
| `tasks.json` | 25 tasks for a sample project — title, description, assignee, status, start/end date, dependencies, priority, estimated hours |
| `status_history.json` | Mock task status change log — task_id, old/new status, timestamp, note (~60 entries) |

## interface/
Main component: `ProjectManagerApp.tsx` (imported by Next.js page route at `/mndy`)

**Features:**
1. **Project Generator** — Text input: "Describe your project." Selects closest template, generates full task breakdown displayed as Kanban board (Backlog / In Progress / Review / Done). Cards animate in on generate.
2. **Interactive Gantt Chart** — Horizontal SVG timeline: task bars colored by assignee, dependency arrows, critical path highlighted in red. Hover for task details tooltip. Drag bars to reschedule (updates dependent tasks).
3. **Team Workload View** — Horizontal stacked bar per team member showing allocation %. Color thresholds: green (<80%), yellow (80-100%), red (>100%). Click person to filter their tasks.
4. **Status Report Generator** — Button generates markdown status update in modal: % complete, tasks done this week, blockers, at-risk items, suggested reassignments for overloaded members. Copy/download buttons.

**Key React components:**
- `KanbanBoard` — column layout with drag-and-drop cards (react-dnd or native drag)
- `GanttChart` — SVG-based timeline with draggable bars and dependency arrows
- `WorkloadBar` — horizontal progress bar with color thresholds
- `StatusReportModal` — markdown-rendered report with export options

**"AI" logic:** Template selection + date assignment based on durations/dependencies. Critical path = longest path through dependency graph (forward pass). Workload = sum of estimated hours per assignee vs. capacity.

## outputs/
| File | Description |
|------|-------------|
| `status_report_sample.md` | Generated weekly status update |
| `project_plan_sample.json` | Exported project plan structure |
