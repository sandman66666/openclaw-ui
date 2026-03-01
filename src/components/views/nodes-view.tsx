"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Monitor, Wifi, WifiOff, Bell, RefreshCw, Loader2, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Node {
  name?: string;
  id?: string;
  status?: string;
  platform?: string;
  lastSeen?: string;
  lastSeenAt?: string;
  [k: string]: any;
}

function formatLastSeen(node: Node): string {
  const raw = node.lastSeen || node.lastSeenAt;
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return raw;
  }
}

function NodeCard({ node }: { node: Node }) {
  const { toast } = useToast();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const nodeName = node.name || node.id || "Unknown";
  const isOnline = node.status === "online" || node.status === "connected";

  const handleNotify = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/nodes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeName, message: message.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", `Notification sent to ${nodeName}`);
        setMessage("");
        setNotifyOpen(false);
      } else {
        toast("error", data.error || "Failed to send notification");
      }
    } catch {
      toast("error", "Failed to send notification");
    }
    setSending(false);
  };

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
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isOnline
                ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            )}>
              <Monitor className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {nodeName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  isOnline
                    ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                )}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {node.status || "unknown"}
                </span>
                {node.platform && (
                  <span className="text-xs text-gray-400">{node.platform}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-right shrink-0">
            <span>Last seen</span>
            <br />
            <span className="text-gray-600 dark:text-gray-300">{formatLastSeen(node)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNotifyOpen(!notifyOpen)}
            className="gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            Notify
          </Button>
        </div>

        {notifyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="flex gap-2 pt-1"
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNotify()}
              placeholder="Notification message..."
              className={cn(
                "flex-1 px-3 py-2.5 rounded-xl text-sm",
                "bg-gray-50 dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "text-gray-900 dark:text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              )}
            />
            <Button
              size="sm"
              onClick={handleNotify}
              disabled={!message.trim() || sending}
              className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function NodesView() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/nodes"));
      const data = await res.json();
      setNodes(data.nodes ?? []);
    } catch {
      toast("error", "Failed to load nodes");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const onlineCount = nodes.filter((n) => n.status === "online" || n.status === "connected").length;

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Nodes
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading
              ? "Loading..."
              : nodes.length === 0
                ? "No paired nodes"
                : `${onlineCount} of ${nodes.length} node${nodes.length !== 1 ? "s" : ""} online`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadNodes}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading && nodes.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16">
          <Monitor className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No paired nodes found</p>
          <p className="text-xs text-gray-400 mt-1">Use openclaw nodes pair to add a node</p>
        </div>
      ) : (
        <div className="space-y-3">
          {nodes.map((node, idx) => (
            <NodeCard key={node.name || node.id || idx} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
