"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Bot, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type TabId } from "@/stores/app-store";

// Mobile bottom nav shows 5 most important tabs
const tabs: { id: TabId; icon: typeof MessageCircle; label: string }[] = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "skills", icon: Sparkles, label: "Skills" },
  { id: "agents", icon: Bot, label: "Agents" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe md:hidden"
      style={{
        background: "rgba(13, 13, 13, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-colors duration-200"
              style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full"
                  style={{ background: "var(--accent-primary)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
