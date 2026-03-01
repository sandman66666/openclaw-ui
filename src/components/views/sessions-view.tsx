"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, ChevronDown, ChevronRight, Send, RefreshCw,
  Loader2, Clock, User, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { useToast } from "@/components/ui/toast";

interface Session {
  key?: string;
  sessionKey?: string;
  kind?: string;
  lastMessage?: string;
  age?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

interface HistoryMessage {
  role?: string;
  content?: string;
  text?: string;
  timestamp?: string;
  [k: string]: any;
}

function formatAge(session: Session): string {
  if (session.age) return session.age;
  if (session.createdAt) {
    const diff = Date.now() - new Date(session.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
  return "—";
}

function SessionCard({
  session,
  isExpanded,
  onToggle,
}: {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { toast } = useToast();
  const sessionKey = session.key || session.sessionKey || "";
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!sessionKey) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(apiUrl(`/api/sessions/history?key=${encodeURIComponent(sessionKey)}`));
      const data = await res.json();
      setHistory(data.history ?? []);
    } catch {
      toast("error", "Failed to load history");
    }
    setLoadingHistory(false);
  }, [sessionKey, toast]);

  useEffect(() => {
    if (isExpanded) loadHistory();
  }, [isExpanded, loadHistory]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/sessions/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionKey, message: message.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", "Message sent");
        setMessage("");
        await loadHistory();
      } else {
        toast("error", data.error || "Failed to send");
      }
    } catch {
      toast("error", "Failed to send message");
    }
    setSending(false);
  };

  return (
    <motion.div
      layout
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(232, 69, 60, 0.1)" }}
        >
          <MessageSquare className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate text-sm" style={{ color: "var(--text-primary)" }}>
            {sessionKey || "Unknown Session"}
          </h3>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {session.kind && <span className="mr-2">{session.kind}</span>}
            {session.lastMessage?.slice(0, 80) || "No messages"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-3 h-3" />
            {formatAge(session)}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              {/* History */}
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No messages in this session</p>
                ) : (
                  history.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2 text-sm",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role !== "user" && (
                        <Bot className="w-4 h-4 mt-1 shrink-0" style={{ color: "var(--accent-primary)" }} />
                      )}
                      <div
                        className="rounded-lg px-3 py-2 max-w-[80%]"
                        style={{
                          background: msg.role === "user" ? "var(--accent-primary)" : "var(--bg-elevated)",
                          color: msg.role === "user" ? "var(--text-on-accent)" : "var(--text-primary)",
                        }}
                      >
                        {msg.content || msg.text || JSON.stringify(msg)}
                      </div>
                      {msg.role === "user" && (
                        <User className="w-4 h-4 mt-1 shrink-0" style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Send message */}
              <div className="mt-3 flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Send a message..."
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                    "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
                  } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors"
                  style={{
                    background: "var(--accent-primary)",
                    color: "var(--text-on-accent)",
                  }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SessionsView() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/sessions"));
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      toast("error", "Failed to load sessions");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Sessions
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {loading ? "Loading..." : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={loadSessions}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No active sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, idx) => {
            const key = session.key || session.sessionKey || `session-${idx}`;
            return (
              <SessionCard
                key={key}
                session={session}
                isExpanded={expandedKey === key}
                onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
