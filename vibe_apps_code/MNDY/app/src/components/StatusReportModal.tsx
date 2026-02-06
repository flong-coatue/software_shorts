"use client";

import React, { useMemo, useState } from "react";
import { X, Copy, Download, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Task, TeamMember } from "../lib/types";
import { computeWorkload, formatShortDate } from "../lib/scheduler";

interface StatusReportModalProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  projectName: string;
  onClose: () => void;
}

export default function StatusReportModal({
  tasks,
  teamMembers,
  projectName,
  onClose,
}: StatusReportModalProps) {
  const [copied, setCopied] = useState(false);

  const memberMap = useMemo(
    () => new Map(teamMembers.map((m) => [m.id, m])),
    [teamMembers]
  );

  const workload = useMemo(
    () => computeWorkload(tasks, teamMembers),
    [tasks, teamMembers]
  );

  // Calculate stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const reviewTasks = tasks.filter((t) => t.status === "review");
  const backlogTasks = tasks.filter((t) => t.status === "backlog");

  const progressPercent =
    totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // At risk: tasks past their end_date that aren't done
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const atRiskTasks = tasks.filter(
    (t) => t.status !== "done" && new Date(t.end_date) < today
  );

  // Blocked tasks: tasks whose dependencies aren't done
  const doneIds = new Set(doneTasks.map((t) => t.id));
  const blockedTasks = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.dependencies.length > 0 &&
      t.dependencies.some((depId) => !doneIds.has(depId))
  );

  // Overloaded team members
  const overloaded = workload.filter((w) => w.utilizationPercent > 100);

  // Suggested reassignments
  const underloaded = workload
    .filter((w) => w.utilizationPercent < 60)
    .sort((a, b) => a.utilizationPercent - b.utilizationPercent);

  // Generate markdown report
  const generateMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# ${projectName} - Status Report`);
    lines.push(
      `**Date:** ${today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
    );
    lines.push("");

    lines.push("## Overall Progress");
    lines.push(
      `**${progressPercent}% complete** (${doneTasks.length} of ${totalTasks} tasks done)`
    );
    lines.push("");

    if (doneTasks.length > 0) {
      lines.push("## Completed");
      doneTasks.forEach((t) => {
        const m = memberMap.get(t.assignee_id);
        lines.push(
          `- ~~${t.title}~~ (${m?.name || "Unassigned"}, ${t.actual_hours || t.estimated_hours}h)`
        );
      });
      lines.push("");
    }

    if (inProgressTasks.length > 0 || reviewTasks.length > 0) {
      lines.push("## In Progress");
      [...inProgressTasks, ...reviewTasks].forEach((t) => {
        const m = memberMap.get(t.assignee_id);
        const statusLabel =
          t.status === "review" ? " [IN REVIEW]" : "";
        lines.push(
          `- ${t.title}${statusLabel} — ${m?.name || "Unassigned"} (${formatShortDate(t.start_date)} - ${formatShortDate(t.end_date)})`
        );
      });
      lines.push("");
    }

    if (atRiskTasks.length > 0 || blockedTasks.length > 0) {
      lines.push("## Blockers & At Risk");
      if (atRiskTasks.length > 0) {
        lines.push("### Behind Schedule");
        atRiskTasks.forEach((t) => {
          const m = memberMap.get(t.assignee_id);
          const daysLate = Math.ceil(
            (today.getTime() - new Date(t.end_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          lines.push(
            `- **${t.title}** — ${daysLate} day(s) overdue (${m?.name || "Unassigned"})`
          );
        });
      }
      if (blockedTasks.length > 0) {
        lines.push("### Blocked by Dependencies");
        blockedTasks.forEach((t) => {
          const unmetDeps = t.dependencies.filter(
            (depId) => !doneIds.has(depId)
          );
          const depNames = unmetDeps
            .map((depId) => {
              const dep = tasks.find((tt) => tt.id === depId);
              return dep ? dep.title : depId;
            })
            .join(", ");
          lines.push(`- **${t.title}** — waiting on: ${depNames}`);
        });
      }
      lines.push("");
    }

    if (overloaded.length > 0) {
      lines.push("## Workload Alerts");
      overloaded.forEach((w) => {
        lines.push(
          `- **${w.member.name}** (${w.member.role}): ${w.utilizationPercent}% utilized — ${w.totalAssignedHours}h assigned vs ${w.capacityHours}h capacity`
        );
      });
      lines.push("");
    }

    if (overloaded.length > 0 && underloaded.length > 0) {
      lines.push("## Suggested Reassignments");
      overloaded.forEach((over) => {
        const candidate = underloaded.find(
          (u) => u.member.role === over.member.role
        );
        if (candidate) {
          lines.push(
            `- Consider moving tasks from **${over.member.name}** (${over.utilizationPercent}%) to **${candidate.member.name}** (${candidate.utilizationPercent}%)`
          );
        }
      });
      if (
        overloaded.some(
          (o) => !underloaded.find((u) => u.member.role === o.member.role)
        )
      ) {
        lines.push(
          "- Some overloaded roles have no underutilized counterparts — consider cross-role support or timeline adjustment"
        );
      }
      lines.push("");
    }

    lines.push("## Upcoming");
    const upcoming = backlogTasks
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .slice(0, 5);
    upcoming.forEach((t) => {
      const m = memberMap.get(t.assignee_id);
      lines.push(
        `- ${t.title} — ${m?.name || "Unassigned"} (starts ${formatShortDate(t.start_date)})`
      );
    });

    return lines.join("\n");
  };

  const reportMarkdown = useMemo(generateMarkdown, [
    tasks,
    teamMembers,
    projectName,
    memberMap,
    workload,
    doneTasks,
    inProgressTasks,
    reviewTasks,
    backlogTasks,
    atRiskTasks,
    blockedTasks,
    overloaded,
    underloaded,
    progressPercent,
    totalTasks,
    today,
    doneIds,
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}_Status_Report_${today.toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col"
        style={{ background: "var(--mndy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--mndy-border)" }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--mndy-text-primary)" }}
            >
              Status Report
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--mndy-text-secondary)" }}
            >
              {projectName} &mdash;{" "}
              {today.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} style={{ color: "var(--mndy-text-secondary)" }} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 px-6 py-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-2xl font-bold" style={{ color: "var(--mndy-accent)" }}>
              {progressPercent}%
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--mndy-text-secondary)" }}>
              Complete
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-2xl font-bold" style={{ color: "var(--mndy-success)" }}>
              {doneTasks.length}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--mndy-text-secondary)" }}>
              Done
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-2xl font-bold" style={{ color: "#579BFC" }}>
              {inProgressTasks.length + reviewTasks.length}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--mndy-text-secondary)" }}>
              In Progress
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p
              className="text-2xl font-bold"
              style={{
                color: atRiskTasks.length > 0 ? "var(--mndy-high)" : "#C4C4C4",
              }}
            >
              {atRiskTasks.length}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--mndy-text-secondary)" }}>
              At Risk
            </p>
          </div>
        </div>

        {/* Report Content */}
        <div
          className="flex-1 overflow-auto px-6 pb-4 mndy-scrollbar"
        >
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "var(--mndy-text-primary)" }}>
                Overall Progress
              </span>
              <span className="text-xs" style={{ color: "var(--mndy-text-secondary)" }}>
                {doneTasks.length}/{totalTasks} tasks
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--mndy-success)",
                }}
              />
            </div>
          </div>

          {/* Sections */}
          {(inProgressTasks.length > 0 || reviewTasks.length > 0) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--mndy-text-primary)" }}>
                <Clock size={14} style={{ color: "#579BFC" }} />
                In Progress
              </h3>
              <div className="space-y-1.5">
                {[...inProgressTasks, ...reviewTasks].map((t) => {
                  const m = memberMap.get(t.assignee_id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs py-1.5 px-2 rounded"
                      style={{ background: "#F8F9FC" }}
                    >
                      {m && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                          style={{ background: m.avatar_color }}
                        >
                          {m.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                      )}
                      <span className="flex-1" style={{ color: "var(--mndy-text-primary)" }}>
                        {t.title}
                      </span>
                      {t.status === "review" && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "rgba(253, 171, 61, 0.15)",
                            color: "var(--mndy-medium)",
                          }}
                        >
                          REVIEW
                        </span>
                      )}
                      <span style={{ color: "var(--mndy-text-secondary)" }}>
                        {formatShortDate(t.end_date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {atRiskTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--mndy-text-primary)" }}>
                <AlertTriangle size={14} style={{ color: "var(--mndy-high)" }} />
                At Risk
              </h3>
              <div className="space-y-1.5">
                {atRiskTasks.map((t) => {
                  const m = memberMap.get(t.assignee_id);
                  const daysLate = Math.ceil(
                    (today.getTime() - new Date(t.end_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs py-1.5 px-2 rounded"
                      style={{ background: "rgba(228, 66, 88, 0.05)" }}
                    >
                      {m && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                          style={{ background: m.avatar_color }}
                        >
                          {m.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                      )}
                      <span className="flex-1" style={{ color: "var(--mndy-text-primary)" }}>
                        {t.title}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          background: "rgba(228, 66, 88, 0.12)",
                          color: "var(--mndy-high)",
                        }}
                      >
                        {daysLate}d OVERDUE
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {overloaded.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--mndy-text-primary)" }}>
                <AlertTriangle size={14} style={{ color: "var(--mndy-medium)" }} />
                Workload Alerts
              </h3>
              <div className="space-y-1.5">
                {overloaded.map((w) => (
                  <div
                    key={w.member.id}
                    className="flex items-center gap-2 text-xs py-1.5 px-2 rounded"
                    style={{ background: "rgba(253, 171, 61, 0.08)" }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                      style={{ background: w.member.avatar_color }}
                    >
                      {w.member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="flex-1" style={{ color: "var(--mndy-text-primary)" }}>
                      {w.member.name} ({w.member.role})
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--mndy-high)" }}
                    >
                      {w.utilizationPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--mndy-text-primary)" }}>
                <CheckCircle size={14} style={{ color: "var(--mndy-success)" }} />
                Completed ({doneTasks.length})
              </h3>
              <div className="space-y-1">
                {doneTasks.map((t) => {
                  const m = memberMap.get(t.assignee_id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs py-1 px-2"
                      style={{ color: "var(--mndy-text-secondary)" }}
                    >
                      <CheckCircle size={12} style={{ color: "var(--mndy-success)" }} />
                      <span className="flex-1 line-through">{t.title}</span>
                      <span>{m?.name.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-3 border-t"
          style={{ borderColor: "var(--mndy-border)" }}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--mndy-border)", color: "var(--mndy-text-primary)" }}
          >
            {copied ? (
              <>
                <CheckCircle size={14} style={{ color: "var(--mndy-success)" }} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white transition-colors hover:opacity-90"
            style={{ background: "var(--mndy-accent)" }}
          >
            <Download size={14} />
            Download Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
