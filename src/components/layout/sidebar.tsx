"use client";

import { motion } from "framer-motion";
import { MessageCircle, CheckSquare, Clock, Smartphone, Radio, Brain, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type TabId } from "@/stores/app-store";
import { useBrowserMode } from "@/hooks/use-browser-mode";

const baseTabs: { id: TabId; icon: typeof MessageCircle; label: string }[] = [
  { id: "chats", icon: MessageCircle, label: "Chats" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "cron", icon: Clock, label: "Schedule" },
  { id: "whatsapp", icon: Smartphone, label: "WhatsApp" },
  { id: "channels", icon: Radio, label: "Channels" },
  { id: "memory", icon: Brain, label: "Memory" },
];

const browserTab = { id: "browser" as TabId, icon: Globe, label: "Navigator" };

export function Sidebar() {
  const { activeTab, setActiveTab, connected } = useAppStore();
  const { isBrowser } = useBrowserMode();

  // When in Navigator browser, add the Browser tab at the top
  const tabs = isBrowser ? [browserTab, ...baseTabs] : baseTabs;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col",
        "w-64 lg:w-72 h-screen",
        "bg-gray-50/80 backdrop-blur-xl",
        "border-r border-gray-200/50",
        "dark:bg-gray-900/80 dark:border-gray-700/50"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
          🦞
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">
            OpenClaw
          </h1>
          <p className="text-xs text-gray-500">
            {connected ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Offline
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                "transition-colors duration-200",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className="relative w-5 h-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="relative font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <p className="text-xs text-gray-400">OpenClaw v1.0.0</p>
      </div>
    </aside>
  );
}
