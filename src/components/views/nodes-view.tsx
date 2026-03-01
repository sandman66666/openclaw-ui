"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Monitor, Wifi, WifiOff, Bell, RefreshCw, Loader2, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
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
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: isOnline ? "rgba(52, 211, 153, 0.1)" : "var(--bg-elevated)",
                color: isOnline ? "var(--accent-green)" : "var(--text-muted)",
              }}
            >
              <Monitor className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {nodeName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: isOnline ? "rgba(52, 211, 153, 0.1)" : "var(--bg-elevated)",
                    color: isOnline ? "var(--accent-green)" : "var(--text-muted)",
                  }}
                >
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {node.status || "unknown"}
                </span>
                {node.platform && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{node.platform}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-right shrink-0" style={{ color: "var(--text-muted)" }}>
            <span>Last seen</span>
            <br />
            <span style={{ color: "var(--text-secondary)" }}>{formatLastSeen(node)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            <Bell className="w-3.5 h-3.5" />
            Notify
          </button>
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
              className="flex-1 px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
              } as React.CSSProperties}
            />
            <button
              onClick={handleNotify}
              disabled={!message.trim() || sending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors"
              style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
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
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Nodes
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {loading
              ? "Loading..."
              : nodes.length === 0
                ? "No paired nodes"
                : `${onlineCount} of ${nodes.length} node${nodes.length !== 1 ? "s" : ""} online`}
          </p>
        </div>
        <button
          onClick={loadNodes}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading && nodes.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16">
          <Monitor className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No paired nodes found</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Use openclaw nodes pair to add a node</p>
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
