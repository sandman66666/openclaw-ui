"use client";

import { motion } from "framer-motion";
import { Bot, Cpu, FolderOpen, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Agent } from "@/stores/app-store";

function AgentCard({ agent }: { agent: Agent }) {
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
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
            )}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {agent.id === "main" ? "Main Agent" : agent.id}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </span>
          </div>
        </div>

        {/* Config details */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Cpu className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Model:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs truncate">
              {agent.model}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Workspace:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs truncate">
              {agent.workspace}
            </span>
          </div>
          {agent.heartbeat && Object.keys(agent.heartbeat).length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Heart className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 dark:text-gray-400">Heartbeat:</span>
              <span className="text-gray-900 dark:text-white text-xs">
                {agent.heartbeat.intervalMinutes
                  ? `every ${agent.heartbeat.intervalMinutes}m`
                  : "configured"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AgentsView() {
  const { agents, loading } = useAppStore();

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Agents
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {agents.length === 0
            ? loading["agents"]
              ? "Loading..."
              : "No agents found"
            : `${agents.length} agent${agents.length > 1 ? "s" : ""} configured`}
        </p>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
