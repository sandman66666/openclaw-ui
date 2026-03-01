"use client";

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
      className="sticky top-0 z-40 border-b md:hidden"
      style={{
        background: "rgba(13, 13, 13, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-md"
            style={{ background: "var(--accent-primary)" }}
          >
            🦞
          </div>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {title}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: connected ? "rgba(52, 211, 153, 0.1)" : "var(--bg-elevated)",
            color: connected ? "var(--accent-green)" : "var(--text-muted)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? "var(--accent-green)" : "var(--text-muted)" }}
          />
          {connected ? "Online" : "Offline"}
        </div>
      </div>
    </header>
  );
}
