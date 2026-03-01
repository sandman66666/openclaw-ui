"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="font-mono text-xs truncate max-w-[60%] text-right" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function ChannelCard({
  id,
  name,
  icon,
  connected,
  config,
}: {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  config?: Record<string, any>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 text-left transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ background: "var(--bg-elevated)" }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {name}
            </h3>
            {connected && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(52, 211, 153, 0.1)", color: "var(--accent-green)" }}
              >
                <Check className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
          {config?.dmPolicy && (
            <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              <Shield className="w-3 h-3" />
              DM: {config.dmPolicy}
              {config.groupPolicy && ` · Groups: ${config.groupPolicy}`}
            </p>
          )}
        </div>

        <ChevronRight
          className={cn("w-5 h-5 transition-transform duration-200", isExpanded && "rotate-90")}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {isExpanded && config && Object.keys(config).length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="p-4 space-y-1">
            {config.dmPolicy && <ConfigRow label="DM Policy" value={config.dmPolicy} />}
            {config.groupPolicy && <ConfigRow label="Group Policy" value={config.groupPolicy} />}
            {config.allowFrom && (
              <ConfigRow
                label="Allowed"
                value={
                  Array.isArray(config.allowFrom)
                    ? config.allowFrom.join(", ")
                    : String(config.allowFrom)
                }
              />
            )}
            {config.selfChatMode !== undefined && (
              <ConfigRow label="Self-chat" value={config.selfChatMode ? "Yes" : "No"} />
            )}
            {config.streamMode && (
              <ConfigRow label="Stream Mode" value={config.streamMode} />
            )}
            {config.groups && config.groups.length > 0 && (
              <div className="flex items-center gap-2 text-sm py-1.5">
                <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <span style={{ color: "var(--text-secondary)" }}>
                  {config.groups.length} group{config.groups.length > 1 ? "s" : ""} configured
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ChannelsView() {
  const { channels, loading } = useAppStore();
  const connectedCount = channels.filter((c) => c.connected).length;

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Channels
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {channels.length === 0
            ? loading["channels"]
              ? "Loading..."
              : "No channels configured"
            : `${connectedCount} channel${connectedCount !== 1 ? "s" : ""} connected`}
        </p>
      </div>

      <div className="space-y-3">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            id={channel.id}
            name={channel.name}
            icon={channel.icon}
            connected={channel.connected}
            config={channel.config}
          />
        ))}
      </div>
    </div>
  );
}
