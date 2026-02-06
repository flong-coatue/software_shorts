"use client";

import React, { useMemo, useState } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Task, TeamMember } from "../lib/types";
import { computeWorkload } from "../lib/scheduler";

interface WorkloadViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
}

const statusColors: Record<string, string> = {
  backlog: "#C4C4C4",
  in_progress: "#579BFC",
  review: "#FDAB3D",
  done: "#00CA72",
};

export default function WorkloadView({ tasks, teamMembers }: WorkloadViewProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const workloadData = useMemo(
    () => computeWorkload(tasks, teamMembers),
    [tasks, teamMembers]
  );

  // All tasks for all members (including done)
  const allMemberTasks = useMemo(() => {
    const map = new Map<string, Task[]>();
    teamMembers.forEach((m) => {
      map.set(
        m.id,
        tasks.filter((t) => t.assignee_id === m.id)
      );
    });
    return map;
  }, [tasks, teamMembers]);

  const getBarColor = (percent: number): string => {
    if (percent > 100) return "var(--mndy-high)";
    if (percent >= 80) return "var(--mndy-medium)";
    return "var(--mndy-success)";
  };

  const getStatusIcon = (percent: number) => {
    if (percent > 100)
      return <AlertTriangle size={14} style={{ color: "var(--mndy-high)" }} />;
    if (percent >= 80) return <Clock size={14} style={{ color: "var(--mndy-medium)" }} />;
    return <CheckCircle size={14} style={{ color: "var(--mndy-success)" }} />;
  };

  const selectedTasks = selectedMember
    ? allMemberTasks.get(selectedMember) || []
    : [];

  return (
    <div className="h-full p-4 flex gap-4 overflow-auto">
      {/* Workload Bars */}
      <div
        className="flex-1 rounded-lg border shadow-sm overflow-auto"
        style={{
          background: "var(--mndy-card)",
          borderColor: "var(--mndy-border)",
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--mndy-border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--mndy-text-primary)" }}
          >
            Team Workload
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--mndy-text-secondary)" }}
          >
            Active task hours vs. available capacity
          </p>
        </div>

        <div className="p-4 space-y-4">
          {workloadData.map((entry) => {
            const barWidth = Math.min(entry.utilizationPercent, 120);
            const isSelected = selectedMember === entry.member.id;

            return (
              <div
                key={entry.member.id}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? "border-[var(--mndy-accent)] shadow-sm"
                    : "border-transparent hover:bg-gray-50"
                }`}
                onClick={() =>
                  setSelectedMember(
                    isSelected ? null : entry.member.id
                  )
                }
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: entry.member.avatar_color }}
                    >
                      {entry.member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--mndy-text-primary)" }}
                      >
                        {entry.member.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--mndy-text-secondary)" }}
                      >
                        {entry.member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    {getStatusIcon(entry.utilizationPercent)}
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: getBarColor(entry.utilizationPercent) }}
                      >
                        {entry.utilizationPercent}%
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--mndy-text-secondary)" }}
                      >
                        {entry.totalAssignedHours}h / {entry.capacityHours}h
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(barWidth, 100)}%`,
                      background: getBarColor(entry.utilizationPercent),
                      opacity: 0.8,
                    }}
                  />
                  {/* Task segments visualization */}
                  {entry.tasks.length > 0 && (
                    <div className="absolute top-0 left-0 h-full flex">
                      {entry.tasks.map((task) => {
                        const segWidth =
                          entry.capacityHours > 0
                            ? (task.estimated_hours / entry.capacityHours) * 100
                            : 0;
                        return (
                          <div
                            key={task.id}
                            className="h-full border-r border-white/30"
                            style={{
                              width: `${segWidth}%`,
                              background: statusColors[task.status] || "#C4C4C4",
                              opacity: 0.7,
                            }}
                            title={`${task.title}: ${task.estimated_hours}h`}
                          />
                        );
                      })}
                    </div>
                  )}
                  {/* 100% marker */}
                  <div
                    className="absolute top-0 h-full w-px bg-gray-400"
                    style={{ left: "100%" }}
                  />
                </div>

                {/* Task count */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--mndy-text-secondary)" }}
                  >
                    {entry.tasks.length} active task
                    {entry.tasks.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--mndy-text-secondary)" }}
                  >
                    {entry.member.capacity_hours_per_week}h/week capacity
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Member Task List */}
      <div
        className="w-[340px] rounded-lg border shadow-sm flex flex-col"
        style={{
          background: "var(--mndy-card)",
          borderColor: "var(--mndy-border)",
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--mndy-border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--mndy-text-primary)" }}
          >
            {selectedMember
              ? `${teamMembers.find((m) => m.id === selectedMember)?.name}'s Tasks`
              : "Select a team member"}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2 mndy-scrollbar">
          {!selectedMember && (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Click a team member to see their tasks
            </div>
          )}
          {selectedMember &&
            selectedTasks.map((task) => (
              <div
                key={task.id}
                className="p-2.5 rounded-lg border"
                style={{ borderColor: "var(--mndy-border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: statusColors[task.status] || "#C4C4C4",
                      }}
                    />
                    <span
                      className="text-[10px] uppercase font-semibold tracking-wider"
                      style={{ color: "var(--mndy-text-secondary)" }}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--mndy-text-secondary)" }}
                  >
                    {task.estimated_hours}h
                  </span>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--mndy-text-primary)" }}
                >
                  {task.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--mndy-text-secondary)" }}
                >
                  {new Date(task.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  &mdash;{" "}
                  {new Date(task.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          {selectedMember && selectedTasks.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              No tasks assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
