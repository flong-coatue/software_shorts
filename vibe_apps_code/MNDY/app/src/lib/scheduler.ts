import { Task, TeamMember, WorkloadEntry, CriticalPathResult } from "./types";

/**
 * Calculate the critical path through a task dependency graph.
 * Uses forward pass (earliest start/finish) and backward pass (latest start/finish).
 * Tasks with zero slack are on the critical path.
 */
export function calculateCriticalPath(tasks: Task[]): CriticalPathResult {
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  // Build adjacency: who depends on whom
  const dependents = new Map<string, string[]>(); // task -> tasks that depend on it
  tasks.forEach((t) => {
    t.dependencies.forEach((depId) => {
      if (!dependents.has(depId)) dependents.set(depId, []);
      dependents.get(depId)!.push(t.id);
    });
  });

  // Use days from project start as the unit
  const projectStart = Math.min(
    ...tasks.map((t) => new Date(t.start_date).getTime())
  );

  function dayOffset(dateStr: string): number {
    return Math.round(
      (new Date(dateStr).getTime() - projectStart) / (1000 * 60 * 60 * 24)
    );
  }

  function durationDays(task: Task): number {
    return Math.max(
      1,
      Math.round(
        (new Date(task.end_date).getTime() -
          new Date(task.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  // Forward pass: earliest start and earliest finish
  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  // Topological sort
  const inDegree = new Map<string, number>();
  tasks.forEach((t) => inDegree.set(t.id, t.dependencies.length));

  const queue: string[] = [];
  tasks.forEach((t) => {
    if (t.dependencies.length === 0) queue.push(t.id);
  });

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    topoOrder.push(current);
    const deps = dependents.get(current) || [];
    deps.forEach((depId) => {
      inDegree.set(depId, (inDegree.get(depId) || 1) - 1);
      if (inDegree.get(depId) === 0) queue.push(depId);
    });
  }

  // Handle any tasks not reached (cycles or disconnected) - add them
  tasks.forEach((t) => {
    if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
  });

  // Forward pass
  topoOrder.forEach((id) => {
    const task = taskMap.get(id)!;
    const dur = durationDays(task);
    let earliest = dayOffset(task.start_date);

    // Earliest start = max of all predecessor earliest finishes
    task.dependencies.forEach((depId) => {
      const depEf = ef.get(depId);
      if (depEf !== undefined && depEf > earliest) {
        earliest = depEf;
      }
    });

    es.set(id, earliest);
    ef.set(id, earliest + dur);
  });

  // Project finish = max of all earliest finishes
  let projectFinish = 0;
  tasks.forEach((t) => {
    const finish = ef.get(t.id) || 0;
    if (finish > projectFinish) projectFinish = finish;
  });

  // Backward pass
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  // Start from the end
  const reverseOrder = [...topoOrder].reverse();
  reverseOrder.forEach((id) => {
    const task = taskMap.get(id)!;
    const dur = durationDays(task);
    const deps = dependents.get(id) || [];

    let latest = projectFinish;
    deps.forEach((depId) => {
      const depLs = ls.get(depId);
      if (depLs !== undefined && depLs < latest) {
        latest = depLs;
      }
    });

    lf.set(id, latest);
    ls.set(id, latest - dur);
  });

  // Calculate slack and identify critical path
  const schedule = new Map<
    string,
    {
      earliestStart: number;
      earliestFinish: number;
      latestStart: number;
      latestFinish: number;
      slack: number;
    }
  >();
  const criticalPath: string[] = [];

  tasks.forEach((t) => {
    const slack = (ls.get(t.id) || 0) - (es.get(t.id) || 0);
    schedule.set(t.id, {
      earliestStart: es.get(t.id) || 0,
      earliestFinish: ef.get(t.id) || 0,
      latestStart: ls.get(t.id) || 0,
      latestFinish: lf.get(t.id) || 0,
      slack,
    });
    if (slack <= 0) criticalPath.push(t.id);
  });

  return { criticalPath, taskSchedule: schedule };
}

/**
 * Assign dates to template tasks based on a start date, respecting dependencies.
 */
export function assignDatesFromStart(
  templateTasks: Array<{
    title: string;
    duration_days: number;
    dependencies: number[];
  }>,
  startDate: Date
): Array<{ start_date: string; end_date: string }> {
  const results: Array<{ start_date: string; end_date: string }> = [];

  // For each task, find the latest end date among its dependencies
  for (let i = 0; i < templateTasks.length; i++) {
    const task = templateTasks[i];
    let taskStart = new Date(startDate);

    if (task.dependencies.length > 0) {
      // Start after all dependencies finish
      task.dependencies.forEach((depIdx) => {
        if (depIdx < results.length) {
          const depEnd = new Date(results[depIdx].end_date);
          // Start next business day after dependency ends
          const nextDay = new Date(depEnd);
          nextDay.setDate(nextDay.getDate() + 1);
          if (nextDay > taskStart) taskStart = nextDay;
        }
      });
    }

    // Skip weekends for start
    while (taskStart.getDay() === 0 || taskStart.getDay() === 6) {
      taskStart.setDate(taskStart.getDate() + 1);
    }

    // Calculate end date (business days)
    const taskEnd = new Date(taskStart);
    let daysAdded = 0;
    while (daysAdded < task.duration_days - 1) {
      taskEnd.setDate(taskEnd.getDate() + 1);
      if (taskEnd.getDay() !== 0 && taskEnd.getDay() !== 6) {
        daysAdded++;
      }
    }

    results.push({
      start_date: taskStart.toISOString().split("T")[0],
      end_date: taskEnd.toISOString().split("T")[0],
    });
  }

  return results;
}

/**
 * Compute workload per team member from their assigned tasks.
 * Only counts non-done tasks for active workload.
 */
export function computeWorkload(
  tasks: Task[],
  members: TeamMember[]
): WorkloadEntry[] {
  return members.map((member) => {
    const memberTasks = tasks.filter(
      (t) => t.assignee_id === member.id && t.status !== "done"
    );
    const totalHours = memberTasks.reduce(
      (sum, t) => sum + t.estimated_hours,
      0
    );

    // Estimate weeks of work based on project span
    const activeTasks = memberTasks.filter((t) => t.start_date && t.end_date);
    let weeksSpan = 1;
    if (activeTasks.length > 0) {
      const earliest = Math.min(
        ...activeTasks.map((t) => new Date(t.start_date).getTime())
      );
      const latest = Math.max(
        ...activeTasks.map((t) => new Date(t.end_date).getTime())
      );
      weeksSpan = Math.max(
        1,
        (latest - earliest) / (1000 * 60 * 60 * 24 * 7)
      );
    }

    const capacityHours = member.capacity_hours_per_week * weeksSpan;
    const utilizationPercent =
      capacityHours > 0 ? Math.round((totalHours / capacityHours) * 100) : 0;

    return {
      member,
      totalAssignedHours: totalHours,
      capacityHours: Math.round(capacityHours),
      utilizationPercent,
      tasks: memberTasks,
    };
  });
}

/**
 * Format a date string as "Mon DD" (e.g., "Jan 12")
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Get the number of business days between two dates
 */
export function businessDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const current = new Date(s);
  while (current <= e) {
    if (current.getDay() !== 0 && current.getDay() !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
