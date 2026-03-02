"use client";

import { Bot } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function ChatsView() {
  const { setActiveTab } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8" style={{ background: "var(--bg-surface)" }}>
      <div
        className="w-20 h-20 rounded-lg flex items-center justify-center shadow-xl mb-5"
        style={{ background: "var(--accent-primary)" }}
      >
        <Bot className="w-10 h-10" style={{ color: "var(--text-on-accent)" }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        Agent Chat
      </h2>
      <p className="max-w-sm text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Use the agent selector in the Chat tab to switch between agents.
      </p>
      <button
        onClick={() => setActiveTab("chat")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
      >
        Go to Chat
      </button>
    </div>
  );
}
