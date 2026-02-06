"use client";

import React, { useMemo, useState, useRef } from "react";
import { Task, TeamMember } from "../lib/types";
import { calculateCriticalPath } from "../lib/scheduler";

interface GanttChartProps {
  tasks: Task[];
  teamMembers: TeamMember[];
}

interface TooltipData {
  task: Task;
  member: TeamMember | undefined;
  x: number;
  y: number;
}

export default function GanttChart({ tasks, teamMembers }: GanttChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const memberMap = useMemo(
    () => new Map(teamMembers.map((m) => [m.id, m])),
    [teamMembers]
  );

  // Sort tasks by start date
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ),
    [tasks]
  );

  // Critical path
  const { criticalPath } = useMemo(
    () => calculateCriticalPath(tasks),
    [tasks]
  );
  const criticalSet = useMemo(() => new Set(criticalPath), [criticalPath]);

  // Compute date range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (sortedTasks.length === 0)
      return { minDate: new Date(), maxDate: new Date(), totalDays: 30 };

    const starts = sortedTasks.map((t) => new Date(t.start_date).getTime());
    const ends = sortedTasks.map((t) => new Date(t.end_date).getTime());
    const min = new Date(Math.min(...starts));
    const max = new Date(Math.max(...ends));

    // Add padding
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 3);

    const days = Math.ceil(
      (max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { minDate: min, maxDate: max, totalDays: days };
  }, [sortedTasks]);

  // Layout constants
  const leftLabelWidth = 220;
  const rowHeight = 36;
  const headerHeight = 50;
  const barHeight = 20;
  const chartPadding = 16;
  const rightPadding = 40;
  const svgWidth = Math.max(900, leftLabelWidth + totalDays * 18 + rightPadding);
  const svgHeight = headerHeight + sortedTasks.length * rowHeight + chartPadding * 2;
  const chartWidth = svgWidth - leftLabelWidth - rightPadding;

  // Date to X position
  const dateToX = (dateStr: string): number => {
    const d = new Date(dateStr);
    const dayOffset =
      (d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    return leftLabelWidth + (dayOffset / totalDays) * chartWidth;
  };

  // Generate week markers
  const weekMarkers = useMemo(() => {
    const markers: { date: Date; x: number; label: string }[] = [];
    const current = new Date(minDate);
    // Find next Monday
    while (current.getDay() !== 1) current.setDate(current.getDate() + 1);

    while (current <= maxDate) {
      const x =
        leftLabelWidth +
        ((current.getTime() - minDate.getTime()) /
          (1000 * 60 * 60 * 24) /
          totalDays) *
          chartWidth;
      markers.push({
        date: new Date(current),
        x,
        label: current.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
      current.setDate(current.getDate() + 7);
    }
    return markers;
  }, [minDate, maxDate, totalDays, chartWidth]);

  // Today marker
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const todayX = dateToX(todayStr);
  const showToday = todayX >= leftLabelWidth && todayX <= svgWidth - rightPadding;

  // Build dependency map for arrows
  const taskIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    sortedTasks.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [sortedTasks]);

  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement>,
    task: Task
  ) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ task, member: memberMap.get(task.assignee_id), x, y });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="h-full p-4 overflow-auto mndy-scrollbar">
      <div
        className="rounded-lg border shadow-sm overflow-auto"
        style={{
          background: "var(--mndy-card)",
          borderColor: "var(--mndy-border)",
        }}
      >
        <div className="relative">
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="select-none"
          >
            {/* Header background */}
            <rect
              x={0}
              y={0}
              width={svgWidth}
              height={headerHeight}
              fill="#F8F9FC"
            />

            {/* Week markers */}
            {weekMarkers.map((wm, i) => (
              <g key={i}>
                <line
                  x1={wm.x}
                  y1={headerHeight}
                  x2={wm.x}
                  y2={svgHeight}
                  stroke="#E6E9EF"
                  strokeWidth={1}
                />
                <text
                  x={wm.x}
                  y={headerHeight - 10}
                  fontSize={11}
                  fill="#676879"
                  textAnchor="middle"
                  fontFamily="system-ui"
                >
                  {wm.label}
                </text>
              </g>
            ))}

            {/* Separator line */}
            <line
              x1={leftLabelWidth}
              y1={0}
              x2={leftLabelWidth}
              y2={svgHeight}
              stroke="#E6E9EF"
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={headerHeight}
              x2={svgWidth}
              y2={headerHeight}
              stroke="#E6E9EF"
              strokeWidth={1}
            />

            {/* Alternating row backgrounds */}
            {sortedTasks.map((_, i) => (
              <rect
                key={`row-bg-${i}`}
                x={0}
                y={headerHeight + i * rowHeight}
                width={svgWidth}
                height={rowHeight}
                fill={i % 2 === 0 ? "#FFFFFF" : "#FAFBFD"}
              />
            ))}

            {/* Dependency arrows */}
            {sortedTasks.map((task) =>
              task.dependencies.map((depId) => {
                const depIdx = taskIndexMap.get(depId);
                const taskIdx = taskIndexMap.get(task.id);
                if (depIdx === undefined || taskIdx === undefined) return null;

                const depTask = sortedTasks[depIdx];
                const fromX = dateToX(depTask.end_date) + 2;
                const fromY =
                  headerHeight + depIdx * rowHeight + rowHeight / 2;
                const toX = dateToX(task.start_date) - 2;
                const toY =
                  headerHeight + taskIdx * rowHeight + rowHeight / 2;

                // Draw path with a small step
                const midX = (fromX + toX) / 2;

                return (
                  <g key={`dep-${depId}-${task.id}`}>
                    <path
                      d={`M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`}
                      fill="none"
                      stroke="#C4C4C8"
                      strokeWidth={1.2}
                      strokeDasharray="4 2"
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${toX},${toY} ${toX - 5},${toY - 3} ${toX - 5},${toY + 3}`}
                      fill="#C4C4C8"
                    />
                  </g>
                );
              })
            )}

            {/* Task labels (left side) */}
            {sortedTasks.map((task, i) => {
              const member = memberMap.get(task.assignee_id);
              return (
                <g key={`label-${task.id}`}>
                  {/* Assignee avatar circle */}
                  {member && (
                    <>
                      <circle
                        cx={14}
                        cy={headerHeight + i * rowHeight + rowHeight / 2}
                        r={9}
                        fill={member.avatar_color}
                      />
                      <text
                        x={14}
                        y={headerHeight + i * rowHeight + rowHeight / 2 + 3.5}
                        fontSize={8}
                        fill="white"
                        textAnchor="middle"
                        fontWeight="bold"
                        fontFamily="system-ui"
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </text>
                    </>
                  )}
                  {/* Task title */}
                  <text
                    x={30}
                    y={headerHeight + i * rowHeight + rowHeight / 2 + 4}
                    fontSize={12}
                    fill="#323338"
                    fontFamily="system-ui"
                  >
                    {task.title.length > 26
                      ? task.title.slice(0, 25) + "..."
                      : task.title}
                  </text>
                </g>
              );
            })}

            {/* Task bars */}
            {sortedTasks.map((task, i) => {
              const member = memberMap.get(task.assignee_id);
              const x1 = dateToX(task.start_date);
              const x2 = dateToX(task.end_date);
              const y =
                headerHeight + i * rowHeight + (rowHeight - barHeight) / 2;
              const width = Math.max(x2 - x1, 8);
              const isCritical = criticalSet.has(task.id);

              return (
                <g key={`bar-${task.id}`}>
                  <rect
                    x={x1}
                    y={y}
                    width={width}
                    height={barHeight}
                    rx={4}
                    ry={4}
                    fill={member?.avatar_color || "#C4C4C4"}
                    opacity={task.status === "done" ? 0.5 : 0.85}
                    stroke={isCritical ? "var(--mndy-high)" : "none"}
                    strokeWidth={isCritical ? 2 : 0}
                    className="cursor-pointer"
                    onMouseEnter={(e) => handleMouseEnter(e, task)}
                    onMouseLeave={handleMouseLeave}
                  />
                  {/* Progress fill for done tasks */}
                  {task.status === "done" && (
                    <rect
                      x={x1}
                      y={y}
                      width={width}
                      height={barHeight}
                      rx={4}
                      ry={4}
                      fill={member?.avatar_color || "#C4C4C4"}
                      opacity={0.9}
                      className="pointer-events-none"
                    />
                  )}
                  {/* Checkmark overlay for done */}
                  {task.status === "done" && (
                    <text
                      x={x1 + width / 2}
                      y={y + barHeight / 2 + 4}
                      fontSize={11}
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      &#10003;
                    </text>
                  )}
                </g>
              );
            })}

            {/* Today marker */}
            {showToday && (
              <g>
                <line
                  x1={todayX}
                  y1={headerHeight}
                  x2={todayX}
                  y2={svgHeight}
                  stroke="var(--mndy-high)"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                />
                <text
                  x={todayX}
                  y={headerHeight - 2}
                  fontSize={9}
                  fill="var(--mndy-high)"
                  textAnchor="middle"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  TODAY
                </text>
              </g>
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="gantt-tooltip absolute bg-white rounded-lg shadow-lg border p-3 text-xs"
              style={{
                left: Math.min(tooltip.x + 12, svgWidth - 220),
                top: tooltip.y - 10,
                borderColor: "var(--mndy-border)",
                minWidth: 200,
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{ color: "var(--mndy-text-primary)" }}
              >
                {tooltip.task.title}
              </p>
              <div
                className="space-y-0.5"
                style={{ color: "var(--mndy-text-secondary)" }}
              >
                {tooltip.member && (
                  <p>
                    Assignee:{" "}
                    <span className="font-medium">{tooltip.member.name}</span>
                  </p>
                )}
                <p>
                  {new Date(tooltip.task.start_date).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )}{" "}
                  &mdash;{" "}
                  {new Date(tooltip.task.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  Est. hours:{" "}
                  <span className="font-medium">
                    {tooltip.task.estimated_hours}h
                  </span>
                  {tooltip.task.actual_hours !== null && (
                    <span>
                      {" "}
                      / Actual: {tooltip.task.actual_hours}h
                    </span>
                  )}
                </p>
                <p>
                  Status:{" "}
                  <span className="font-medium capitalize">
                    {tooltip.task.status.replace("_", " ")}
                  </span>
                </p>
                {criticalSet.has(tooltip.task.id) && (
                  <p
                    className="font-semibold mt-1"
                    style={{ color: "var(--mndy-high)" }}
                  >
                    On Critical Path
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 px-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--mndy-text-secondary)" }}>
          <div
            className="w-4 h-2 rounded border-2"
            style={{ borderColor: "var(--mndy-high)", background: "transparent" }}
          />
          Critical Path
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--mndy-text-secondary)" }}>
          <div
            className="w-4 h-0.5"
            style={{ background: "var(--mndy-high)" }}
          />
          Today
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--mndy-text-secondary)" }}>
          <svg width={16} height={8}>
            <line x1={0} y1={4} x2={16} y2={4} stroke="#C4C4C8" strokeWidth={1.2} strokeDasharray="4 2" />
          </svg>
          Dependency
        </div>
        {teamMembers.slice(0, 6).map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--mndy-text-secondary)" }}>
            <div className="w-3 h-3 rounded" style={{ background: m.avatar_color }} />
            {m.name.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  );
}
