"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const titles: Record<string, { title: string; subtitle: string }> = {
  chat: { title: "Chat", subtitle: "Talk to your assistant" },
  skills: { title: "Skills", subtitle: "Manage capabilities" },
  channels: { title: "Channels", subtitle: "Connect your apps" },
  settings: { title: "Settings", subtitle: "Configure OpenClaw" },
};

export function Header() {
  const { activeTab, connected } = useAppStore();
  const { title, subtitle } = titles[activeTab] || titles.chat;

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "bg-white/80 backdrop-blur-xl border-b border-gray-200/50",
        "dark:bg-gray-900/80 dark:border-gray-700/50",
        "md:hidden"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl shadow-md">
            🦞
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            connected
              ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-green-500" : "bg-gray-400"
            )}
          />
          {connected ? "Online" : "Offline"}
        </div>
      </div>
    </header>
  );
}
