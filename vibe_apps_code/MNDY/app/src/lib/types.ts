export type TaskStatus = "backlog" | "in_progress" | "review" | "done";
export type Priority = "high" | "medium" | "low";
export type TeamRole = "PM" | "Designer" | "Frontend Dev" | "Backend Dev" | "QA" | "Content";

export interface TemplateTask {
  title: string;
  description: string;
  duration_days: number;
  dependencies: number[]; // indices into the template's task array
  default_role: TeamRole;
  priority: Priority;
  estimated_hours: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  tasks: TemplateTask[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  avatar_color: string;
  capacity_hours_per_week: number;
  skills: string[];
  current_workload_percent: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee_id: string;
  status: TaskStatus;
  start_date: string; // ISO date string
  end_date: string;
  dependencies: string[]; // task ids
  priority: Priority;
  estimated_hours: number;
  actual_hours: number | null;
}

export interface StatusHistoryEntry {
  id: string;
  task_id: string;
  old_status: TaskStatus;
  new_status: TaskStatus;
  timestamp: string; // ISO timestamp
  note: string;
}

export interface CriticalPathResult {
  criticalPath: string[]; // task ids on the critical path
  taskSchedule: Map<string, { earliestStart: number; earliestFinish: number; latestStart: number; latestFinish: number; slack: number }>;
}

export interface WorkloadEntry {
  member: TeamMember;
  totalAssignedHours: number;
  capacityHours: number;
  utilizationPercent: number;
  tasks: Task[];
}

export type ActiveTab = "board" | "timeline" | "workload" | "report";
