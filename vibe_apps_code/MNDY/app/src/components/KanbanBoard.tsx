"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Task, TeamMember, TaskStatus } from "../lib/types";
import { generateProject } from "../lib/generator";
import { formatShortDate } from "../lib/scheduler";

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onProjectGenerated: (tasks: Task[], templateName: string) => void;
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#C4C4C4" },
  { id: "in_progress", label: "In Progress", color: "#579BFC" },
  { id: "review", label: "Review", color: "#FDAB3D" },
  { id: "done", label: "Done", color: "#00CA72" },
];

const priorityColors: Record<string, string> = {
  high: "var(--mndy-high)",
  medium: "var(--mndy-medium)",
  low: "var(--mndy-low)",
};

export default function KanbanBoard({
  tasks,
  teamMembers,
  onTaskStatusChange,
  onProjectGenerated,
}: KanbanBoardProps) {
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));

  const handleGenerate = () => {
    if (!description.trim()) return;
    setGenerating(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const { tasks: newTasks, templateName } = generateProject(
        description,
        teamMembers
      );
      setGenerating(false);
      setDescription("");

      // Animate cards in
      const taskIds = new Set(newTasks.map((t) => t.id));
      setAnimatingTasks(taskIds);
      onProjectGenerated(newTasks, templateName);

      setTimeout(() => {
        setAnimatingTasks(new Set());
      }, 1000);
    }, 1200);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
    // Make the drag image slightly transparent
    const el = e.currentTarget;
    setTimeout(() => {
      el.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, column: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, column: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskStatusChange(draggedTask, column);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Generate Project Bar */}
      <div
        className="flex items-center gap-3 p-3 rounded-lg shadow-sm border"
        style={{
          background: "var(--mndy-card)",
          borderColor: "var(--mndy-border)",
        }}
      >
        <Sparkles size={18} style={{ color: "var(--mndy-accent)" }} />
        <input
          ref={inputRef}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Describe your project... (e.g. 'Launch a new mobile app' or 'Website redesign for Q2')"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
          style={{ color: "var(--mndy-text-primary)" }}
          disabled={generating}
        />
        <button
          onClick={handleGenerate}
          disabled={!description.trim() || generating}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--mndy-accent)" }}
        >
          {generating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Project
            </>
          )}
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-2 mndy-scrollbar">
        {columns.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={col.id}
              className={`flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-lg border transition-colors ${
                dragOverColumn === col.id ? "drag-over" : ""
              }`}
              style={{
                background:
                  dragOverColumn === col.id
                    ? "rgba(108, 46, 185, 0.03)"
                    : "#F0F1F5",
                borderColor:
                  dragOverColumn === col.id
                    ? "var(--mndy-accent)"
                    : "transparent",
              }}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: col.color }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--mndy-text-primary)" }}
                >
                  {col.label}
                </span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.08)",
                    color: "var(--mndy-text-secondary)",
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 flex flex-col gap-2 px-2 pb-2 overflow-y-auto mndy-scrollbar max-h-[calc(100vh-250px)]">
                {colTasks.map((task, idx) => {
                  const member = memberMap.get(task.assignee_id);
                  const isExpanded = expandedTask === task.id;
                  const isAnimating = animatingTasks.has(task.id);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                        isAnimating ? "animate-slide-in" : ""
                      }`}
                      style={{
                        background: "var(--mndy-card)",
                        borderColor:
                          draggedTask === task.id
                            ? "var(--mndy-accent)"
                            : "var(--mndy-border)",
                        animationDelay: isAnimating ? `${idx * 80}ms` : "0ms",
                        opacity: isAnimating ? 0 : 1,
                      }}
                      onClick={() =>
                        setExpandedTask(isExpanded ? null : task.id)
                      }
                    >
                      <div className="p-3">
                        {/* Priority and Hours */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  priorityColors[task.priority] || "#C4C4C4",
                              }}
                            />
                            <span
                              className="text-[10px] uppercase font-semibold tracking-wider"
                              style={{
                                color:
                                  priorityColors[task.priority] || "#C4C4C4",
                              }}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--mndy-text-secondary)" }}
                          >
                            <Clock size={11} />
                            {task.estimated_hours}h
                          </div>
                        </div>

                        {/* Title */}
                        <p
                          className="text-sm font-medium mb-2 leading-snug"
                          style={{ color: "var(--mndy-text-primary)" }}
                        >
                          {task.title}
                        </p>

                        {/* Assignee */}
                        <div className="flex items-center justify-between">
                          {member && (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                style={{ background: member.avatar_color }}
                              >
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <span
                                className="text-xs"
                                style={{
                                  color: "var(--mndy-text-secondary)",
                                }}
                              >
                                {member.name.split(" ")[0]}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTask(isExpanded ? null : task.id);
                            }}
                            className="p-0.5 rounded hover:bg-gray-100"
                          >
                            {isExpanded ? (
                              <ChevronUp
                                size={14}
                                style={{
                                  color: "var(--mndy-text-secondary)",
                                }}
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                style={{
                                  color: "var(--mndy-text-secondary)",
                                }}
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div
                          className="border-t px-3 py-2.5 text-xs space-y-2"
                          style={{ borderColor: "var(--mndy-border)" }}
                        >
                          <p style={{ color: "var(--mndy-text-secondary)" }}>
                            {task.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <span
                              style={{ color: "var(--mndy-text-secondary)" }}
                            >
                              {formatShortDate(task.start_date)}
                            </span>
                            <ArrowRight
                              size={12}
                              style={{ color: "var(--mndy-text-secondary)" }}
                            />
                            <span
                              style={{ color: "var(--mndy-text-secondary)" }}
                            >
                              {formatShortDate(task.end_date)}
                            </span>
                          </div>
                          {task.dependencies.length > 0 && (
                            <p style={{ color: "var(--mndy-text-secondary)" }}>
                              <span className="font-medium">Depends on:</span>{" "}
                              {task.dependencies
                                .map((depId) => {
                                  const dep = tasks.find(
                                    (t) => t.id === depId
                                  );
                                  return dep ? dep.title : depId;
                                })
                                .join(", ")}
                            </p>
                          )}
                          {task.actual_hours !== null && (
                            <p style={{ color: "var(--mndy-text-secondary)" }}>
                              <span className="font-medium">
                                Actual hours:
                              </span>{" "}
                              {task.actual_hours}h / {task.estimated_hours}h
                              estimated
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
