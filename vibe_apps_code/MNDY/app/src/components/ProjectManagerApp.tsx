"use client";

import React, { useState, useCallback } from "react";
import { LayoutGrid, GanttChart as GanttIcon, Users, FileText, Sparkles } from "lucide-react";
import { Task, TeamMember, ActiveTab } from "../lib/types";
import KanbanBoard from "./KanbanBoard";
import GanttChart from "./GanttChart";
import WorkloadView from "./WorkloadView";
import StatusReportModal from "./StatusReportModal";
import tasksData from "../data/tasks.json";
import teamData from "../data/team_members.json";

const initialTasks = tasksData as Task[];
const teamMembers = teamData as TeamMember[];

const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: "board", label: "Board", icon: <LayoutGrid size={16} /> },
  { id: "timeline", label: "Timeline", icon: <GanttIcon size={16} /> },
  { id: "workload", label: "Workload", icon: <Users size={16} /> },
  { id: "report", label: "Report", icon: <FileText size={16} /> },
];

export default function ProjectManagerApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("board");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projectName, setProjectName] = useState("Website Redesign");
  const [showReport, setShowReport] = useState(false);

  const handleTaskStatusChange = useCallback(
    (taskId: string, newStatus: Task["status"]) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    },
    []
  );

  const handleProjectGenerated = useCallback(
    (newTasks: Task[], templateName: string) => {
      setTasks(newTasks);
      setProjectName(templateName);
    },
    []
  );

  // If user clicks "Report" tab, show modal
  const handleTabClick = (tab: ActiveTab) => {
    if (tab === "report") {
      setShowReport(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--mndy-bg)" }}>
      {/* Header */}
      <header
        className="px-6 py-3 flex items-center justify-between shadow-md"
        style={{ background: "var(--mndy-header)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-purple-300" />
            <h1 className="text-white text-lg font-bold tracking-tight">
              AI Project Manager
            </h1>
          </div>
          <span className="text-purple-300 text-sm">|</span>
          <span className="text-purple-200 text-sm font-medium">
            {projectName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {teamMembers.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold -ml-1 first:ml-0 border-2 border-white/20"
              style={{ background: m.avatar_color }}
              title={m.name}
            >
              {m.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          ))}
          {teamMembers.length > 5 && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold -ml-1 border-2 border-white/20 bg-purple-700">
              +{teamMembers.length - 5}
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        className="px-6 flex items-center gap-1 border-b"
        style={{
          background: "var(--mndy-card)",
          borderColor: "var(--mndy-border)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id && tab.id !== "report"
                ? "text-[var(--mndy-accent)]"
                : "text-[var(--mndy-text-secondary)] hover:text-[var(--mndy-text-primary)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && tab.id !== "report" && (
              <div
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t"
                style={{ background: "var(--mndy-accent)" }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "board" && (
          <KanbanBoard
            tasks={tasks}
            teamMembers={teamMembers}
            onTaskStatusChange={handleTaskStatusChange}
            onProjectGenerated={handleProjectGenerated}
          />
        )}
        {activeTab === "timeline" && (
          <GanttChart tasks={tasks} teamMembers={teamMembers} />
        )}
        {activeTab === "workload" && (
          <WorkloadView tasks={tasks} teamMembers={teamMembers} />
        )}
      </main>

      {/* Status Report Modal */}
      {showReport && (
        <StatusReportModal
          tasks={tasks}
          teamMembers={teamMembers}
          projectName={projectName}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
