"use client";

import { motion } from "framer-motion";
import {
  MessageCircle, Sparkles, Radio, Settings, Clock, Bot,
  CheckSquare, History, Phone, Brain, Wand2, Network, MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type TabId } from "@/stores/app-store";

const tabs: { id: TabId; icon: typeof MessageCircle; label: string }[] = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "chats", icon: MessagesSquare, label: "Threads" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "skills", icon: Sparkles, label: "Skills" },
  { id: "agents", icon: Bot, label: "Agents" },
  { id: "merlin", icon: Wand2, label: "Merlin" },
  { id: "channels", icon: Radio, label: "Channels" },
  { id: "whatsapp", icon: Phone, label: "WhatsApp" },
  { id: "sessions", icon: History, label: "Sessions" },
  { id: "memory", icon: Brain, label: "Memory" },
  { id: "nodes", icon: Network, label: "Nodes" },
  { id: "cron", icon: Clock, label: "Cron Jobs" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { activeTab, setActiveTab, connected } = useAppStore();

  return (
    <aside
      className="hidden md:flex flex-col w-56 lg:w-60 h-screen border-r"
      style={{
        background: "var(--bg-base)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
          style={{ background: "var(--accent-primary)" }}
        >
          🦞
        </div>
        <div>
          <h1 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            OpenClaw
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {connected ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-muted)" }} />
                Offline
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "transition-colors duration-150 text-sm"
              )}
              style={{
                color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "rgba(232, 69, 60, 0.08)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className="relative w-[18px] h-[18px]"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="relative font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>OpenClaw v1.0.0</p>
      </div>
    </aside>
  );
}
