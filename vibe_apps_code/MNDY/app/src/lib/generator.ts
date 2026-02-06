import { ProjectTemplate, TeamMember, Task, TeamRole } from "./types";
import { assignDatesFromStart } from "./scheduler";
import templates from "../data/project_templates.json";

/**
 * Pick the best-matching template based on keyword overlap with a description string.
 */
function matchTemplate(description: string): ProjectTemplate {
  const desc = description.toLowerCase();
  const typedTemplates = templates as ProjectTemplate[];

  let bestMatch = typedTemplates[0];
  let bestScore = 0;

  typedTemplates.forEach((template) => {
    let score = 0;
    template.keywords.forEach((keyword) => {
      if (desc.includes(keyword.toLowerCase())) {
        score += 2; // keyword match
      }
    });
    // Also check template name
    if (desc.includes(template.name.toLowerCase())) {
      score += 3;
    }
    // Partial word matching
    const words = desc.split(/\s+/);
    words.forEach((word) => {
      template.keywords.forEach((keyword) => {
        if (
          keyword.toLowerCase().includes(word) ||
          word.includes(keyword.toLowerCase())
        ) {
          score += 1;
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  });

  return bestMatch;
}

/**
 * Find the best team member for a given role.
 * Prefers members with the exact role who have the least workload.
 */
function assignMemberForRole(
  role: TeamRole,
  members: TeamMember[],
  assignmentCounts: Map<string, number>
): string {
  // Filter by exact role match
  const roleMembers = members.filter((m) => m.role === role);

  if (roleMembers.length === 0) {
    // Fallback: pick least loaded member
    const sorted = [...members].sort(
      (a, b) =>
        (assignmentCounts.get(a.id) || 0) - (assignmentCounts.get(b.id) || 0)
    );
    return sorted[0].id;
  }

  // Pick the one with fewest current assignments in this project
  const sorted = [...roleMembers].sort(
    (a, b) =>
      (assignmentCounts.get(a.id) || 0) - (assignmentCounts.get(b.id) || 0)
  );
  return sorted[0].id;
}

/**
 * Generate a project from a description string.
 * Picks the closest template via keyword matching, assigns team members
 * based on role match, and sets dates using the scheduler.
 */
export function generateProject(
  description: string,
  members: TeamMember[],
  startDate?: Date
): { tasks: Task[]; templateName: string } {
  const template = matchTemplate(description);
  const start = startDate || new Date();

  // Calculate dates
  const dates = assignDatesFromStart(template.tasks, start);

  // Track assignment counts for load balancing
  const assignmentCounts = new Map<string, number>();
  members.forEach((m) => assignmentCounts.set(m.id, 0));

  // Generate tasks
  const tasks: Task[] = template.tasks.map((tmplTask, index) => {
    const assigneeId = assignMemberForRole(
      tmplTask.default_role,
      members,
      assignmentCounts
    );
    assignmentCounts.set(
      assigneeId,
      (assignmentCounts.get(assigneeId) || 0) + 1
    );

    // Map template dependency indices to task IDs
    const dependencies = tmplTask.dependencies.map(
      (depIdx) => `gen-task-${depIdx + 1}`
    );

    return {
      id: `gen-task-${index + 1}`,
      title: tmplTask.title,
      description: tmplTask.description,
      assignee_id: assigneeId,
      status: "backlog" as const,
      start_date: dates[index].start_date,
      end_date: dates[index].end_date,
      dependencies,
      priority: tmplTask.priority,
      estimated_hours: tmplTask.estimated_hours,
      actual_hours: null,
    };
  });

  return { tasks, templateName: template.name };
}
