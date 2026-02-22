"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Target,
  Bot,
  Clock,
  Plus,
  BookOpen,
  Sun,
  ExternalLink,
  Play,
  Focus,
  Zap,
} from "lucide-react";
import { useBrowserMode, type Mission } from "@/hooks/use-browser-mode";

// ─────────────────────────────────────────────────────────────────────────────
// Active Missions Widget
// ─────────────────────────────────────────────────────────────────────────────

function ActiveMissionsWidget() {
  const { getActiveMissions, focusTab, newMission } = useBrowserMode();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    getActiveMissions().then(setMissions);
    const interval = setInterval(() => {
      getActiveMissions().then(setMissions);
    }, 10000);
    return () => clearInterval(interval);
  }, [getActiveMissions]);

  const handleNewMission = () => {
    if (newGoal.trim()) {
      newMission(newGoal.trim());
      setNewGoal("");
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Active Missions</h3>
        </div>
        <span className="text-xs text-gray-400">{missions.length} active</span>
      </div>

      {missions.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">
          No active missions. Start one to organize your research.
        </p>
      ) : (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {missions.map((mission) => (
            <motion.button
              key={mission.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => focusTab(mission.id)}
              className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white truncate pr-2">
                  {mission.goal}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {mission.tabCount} tabs
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    mission.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : mission.status === "paused"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-600/50 text-gray-400"
                  }`}
                >
                  {mission.status}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Start a new mission..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNewMission()}
          className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
        />
        <button
          onClick={handleNewMission}
          disabled={!newGoal.trim()}
          className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 disabled:opacity-30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OC Live Feed Widget
// ─────────────────────────────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  message: string;
  timestamp: number;
  type: "insight" | "reminder" | "suggestion";
}

function OCLiveFeedWidget() {
  const { onNavigatorEvent } = useBrowserMode();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: "welcome",
      message: "Ross is watching. Every page you visit becomes knowledge.",
      timestamp: Date.now(),
      type: "insight",
    },
  ]);

  useEffect(() => {
    const cleanup = onNavigatorEvent("oc-feed", (data) => {
      const item = data as FeedItem;
      setFeedItems((prev) => [item, ...prev].slice(0, 10));
    });
    return cleanup;
  }, [onNavigatorEvent]);

  const typeColors: Record<string, string> = {
    insight: "text-blue-400",
    reminder: "text-yellow-400",
    suggestion: "text-green-400",
  };

  const typeIcons: Record<string, string> = {
    insight: "💡",
    reminder: "⏰",
    suggestion: "✨",
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Ross Live Feed</h3>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-gray-500">live</span>
        </span>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {feedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-2"
            >
              <span className="text-sm mt-0.5">
                {typeIcons[item.type] || "📌"}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${typeColors[item.type] || "text-gray-300"}`}
                >
                  {item.message}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Tabs Widget
// ─────────────────────────────────────────────────────────────────────────────

interface AgentTabInfo {
  id: string;
  goal: string;
  status: "preparing" | "browsing" | "extracting" | "synthesizing" | "complete";
  progress: number;
  currentURL?: string;
}

function AgentTabsWidget() {
  const { startAgentTab, onNavigatorEvent, focusTab } = useBrowserMode();
  const [agentTabs, setAgentTabs] = useState<AgentTabInfo[]>([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    const cleanup = onNavigatorEvent("agent-tab-update", (data) => {
      const tab = data as AgentTabInfo;
      setAgentTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tab.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = tab;
          return updated;
        }
        return [...prev, tab];
      });
    });
    return cleanup;
  }, [onNavigatorEvent]);

  const handleStartAgent = () => {
    if (newGoal.trim()) {
      startAgentTab(newGoal.trim());
      setNewGoal("");
    }
  };

  const statusColors: Record<string, string> = {
    preparing: "text-gray-400",
    browsing: "text-blue-400",
    extracting: "text-yellow-400",
    synthesizing: "text-purple-400",
    complete: "text-green-400",
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Agent Tabs</h3>
        <span className="ml-auto text-xs text-gray-400">
          {agentTabs.filter((t) => t.status !== "complete").length} working
        </span>
      </div>

      {agentTabs.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">
          No agent tabs yet. Let Ross browse for you.
        </p>
      ) : (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {agentTabs.map((tab) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => focusTab(tab.id)}
              className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white truncate pr-2">
                  🦞 {tab.goal}
                </span>
                <span
                  className={`text-[10px] ${statusColors[tab.status] || "text-gray-400"}`}
                >
                  {tab.status}
                </span>
              </div>
              {tab.status !== "complete" && (
                <div className="w-full bg-gray-600/50 rounded-full h-1 mt-2">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all"
                    style={{ width: `${tab.progress * 100}%` }}
                  />
                </div>
              )}
              {tab.currentURL && (
                <p className="text-[10px] text-gray-500 mt-1 truncate">
                  {tab.currentURL}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Give Ross a task..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStartAgent()}
          className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
        <button
          onClick={handleStartAgent}
          disabled={!newGoal.trim()}
          className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-30 transition-colors"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Actions Bar
// ─────────────────────────────────────────────────────────────────────────────

function QuickActionsBar() {
  const { newMission, startFocusMode, openURL } = useBrowserMode();

  const actions = [
    {
      icon: <Plus className="w-4 h-4" />,
      label: "Mission",
      color: "text-orange-400 hover:bg-orange-500/20",
      onClick: () => {
        const goal = prompt("Mission goal:");
        if (goal) newMission(goal);
      },
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "Brief History",
      color: "text-blue-400 hover:bg-blue-500/20",
      onClick: () => {
        // Trigger history query
      },
    },
    {
      icon: <Sun className="w-4 h-4" />,
      label: "Morning Brief",
      color: "text-yellow-400 hover:bg-yellow-500/20",
      onClick: () => {
        // Trigger morning briefing
      },
    },
    {
      icon: <ExternalLink className="w-4 h-4" />,
      label: "Open Page",
      color: "text-green-400 hover:bg-green-500/20",
      onClick: () => {
        const url = prompt("URL to open and research:");
        if (url) openURL(url, { inNewTab: true });
      },
    },
    {
      icon: <Focus className="w-4 h-4" />,
      label: "Focus Mode",
      color: "text-purple-400 hover:bg-purple-500/20",
      onClick: () => startFocusMode(50),
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm transition-colors ${action.color}`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Stats
// ─────────────────────────────────────────────────────────────────────────────

function SessionStats() {
  const { getActiveMissions } = useBrowserMode();
  const [stats, setStats] = useState({ missions: 0, pages: 0, syntheses: 0 });

  useEffect(() => {
    getActiveMissions().then((m) => {
      setStats({ missions: m.length, pages: 0, syntheses: 0 });
    });
  }, [getActiveMissions]);

  return (
    <div className="flex items-center gap-4 text-xs text-gray-400">
      <span>{stats.missions} missions</span>
      <span className="text-gray-600">·</span>
      <span>{stats.pages} pages indexed</span>
      <span className="text-gray-600">·</span>
      <span>{stats.syntheses} syntheses</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Home View (main export)
// ─────────────────────────────────────────────────────────────────────────────

export function BrowserHomeView() {
  const { isBrowser } = useBrowserMode();

  if (!isBrowser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-400">
            Navigator · Ross active
          </span>
        </div>
        <SessionStats />
      </div>

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActiveMissionsWidget />
        <AgentTabsWidget />
      </div>

      {/* Live Feed (full width) */}
      <OCLiveFeedWidget />
    </motion.div>
  );
}
