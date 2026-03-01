"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, ChevronDown, ChevronRight, Send, RefreshCw,
  Loader2, Clock, User, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      const res = await fetch(`/api/sessions/history?key=${encodeURIComponent(sessionKey)}`);
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
      const res = await fetch("/api/sessions/send", {
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
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50",
        "shadow-sm"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
        )}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
            {sessionKey || "Unknown Session"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session.kind && <span className="mr-2">{session.kind}</span>}
            {session.lastMessage?.slice(0, 80) || "No messages"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatAge(session)}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
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
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50">
              {/* History */}
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No messages in this session</p>
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
                        <Bot className="w-4 h-4 mt-1 text-orange-400 shrink-0" />
                      )}
                      <div
                        className={cn(
                          "rounded-xl px-3 py-2 max-w-[80%]",
                          msg.role === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        )}
                      >
                        {msg.content || msg.text || JSON.stringify(msg)}
                      </div>
                      {msg.role === "user" && (
                        <User className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
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
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
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
      const res = await fetch("/api/sessions");
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
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Sessions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? "Loading..." : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadSessions}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No active sessions</p>
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
