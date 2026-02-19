"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight, Shield, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";

const channelColors: Record<string, string> = {
  whatsapp: "from-green-400 to-green-600",
  telegram: "from-blue-400 to-blue-600",
  discord: "from-indigo-400 to-purple-600",
  webchat: "from-orange-400 to-red-500",
};

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60%] text-right">
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
  const color = channelColors[id] || "from-gray-400 to-gray-600";

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50",
        "shadow-sm"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
            `bg-gradient-to-br ${color}`
          )}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            {connected && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                <Check className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
          {config?.dmPolicy && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              DM: {config.dmPolicy}
              {config.groupPolicy && ` · Groups: ${config.groupPolicy}`}
            </p>
          )}
        </div>

        <ChevronRight
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {isExpanded && config && Object.keys(config).length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-gray-100 dark:border-gray-700"
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
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
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
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Channels
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
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
