"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, StopCircle, Trash2, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useAppStore, type Message } from "@/stores/app-store";
import { apiUrl } from "@/lib/config";

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className="max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-lg"
        style={{
          background: isUser ? "var(--accent-primary)" : "var(--bg-elevated)",
          color: isUser ? "var(--text-on-accent)" : "var(--text-primary)",
          borderBottomRightRadius: isUser ? "4px" : undefined,
          borderBottomLeftRadius: !isUser ? "4px" : undefined,
        }}
      >
        <div
          className={cn(
            "text-[15px] leading-relaxed prose prose-sm max-w-none",
            isUser ? "prose-invert" : ""
          )}
          style={{ color: "inherit" }}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: isUser ? "rgba(255,255,255,0.9)" : "var(--accent-primary)" }}
                >
                  {children}
                </a>
              ),
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <pre
                      className="rounded-md p-3 my-2 overflow-x-auto text-[13px]"
                      style={{ background: isUser ? "rgba(0,0,0,0.2)" : "var(--bg-base)" }}
                    >
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code
                    className="px-1 py-0.5 rounded text-[13px]"
                    style={{ background: isUser ? "rgba(0,0,0,0.2)" : "var(--bg-base)" }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-2 pl-3 my-2 italic"
                  style={{ borderColor: isUser ? "rgba(255,255,255,0.4)" : "var(--border-default)" }}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <p
          className="text-[10px] mt-1"
          style={{ color: isUser ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div
        className="px-4 py-3 rounded-lg"
        style={{ background: "var(--bg-elevated)", borderBottomLeftRadius: "4px" }}
      >
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--text-muted)" }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface AgentOption {
  id: string;
  label: string;
}

const DEFAULT_AGENTS: AgentOption[] = [
  { id: "primary", label: "Primary Agent" },
];

export function ChatView() {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<AgentOption[]>(DEFAULT_AGENTS);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFullyLoaded, setHistoryFullyLoaded] = useState(false);
  const [oldestLoaded, setOldestLoaded] = useState<Date | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const {
    messages,
    isTyping,
    activeAgent,
    addMessage,
    setMessages,
    setIsTyping,
    clearMessages,
    setActiveAgent,
    agents,
  } = useAppStore();

  // Build agent list from store + defaults
  useEffect(() => {
    const agentOptions: AgentOption[] = [{ id: "primary", label: "Primary Agent" }];
    const seen = new Set(["primary"]);

    for (const a of agents) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        agentOptions.push({ id: a.id, label: a.id });
      }
    }

    // Also fetch from API for fresh list
    fetch(apiUrl("/api/agents"))
      .then((r) => r.json())
      .then((data) => {
        for (const a of data.agents || []) {
          if (!seen.has(a.id)) {
            seen.add(a.id);
            agentOptions.push({ id: a.id, label: a.name || a.id });
          }
        }
        setAvailableAgents([...agentOptions]);
      })
      .catch(() => {
        setAvailableAgents([...agentOptions]);
      });
  }, [agents]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load history from gateway
  const loadHistory = useCallback(
    async (daysBack: number, before?: Date) => {
      setLoadingHistory(true);
      try {
        const sessionKey = `agent:primary:${activeAgent}`;
        const limit = daysBack === 1 ? 80 : 200;
        const res = await fetch(
          apiUrl(`/api/sessions/history?key=${encodeURIComponent(sessionKey)}&limit=${limit}`)
        );
        const data = await res.json();
        const historyMessages: Message[] = (data.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));

        if (historyMessages.length === 0) {
          setHistoryFullyLoaded(true);
          setLoadingHistory(false);
          return;
        }

        // Filter by time window if paginating
        let filtered = historyMessages;
        if (before) {
          filtered = historyMessages.filter(
            (m) => new Date(m.timestamp) < before
          );
        }

        if (filtered.length === 0) {
          setHistoryFullyLoaded(true);
          setLoadingHistory(false);
          return;
        }

        const oldest = filtered.reduce(
          (min, m) => (new Date(m.timestamp) < min ? new Date(m.timestamp) : min),
          new Date(filtered[0].timestamp)
        );
        setOldestLoaded(oldest);

        if (before) {
          // Prepend older messages
          const currentMessages = useAppStore.getState().messages;
          const existingIds = new Set(currentMessages.map((m) => m.id));
          const newMessages = filtered.filter((m) => !existingIds.has(m.id));
          setMessages([...newMessages, ...currentMessages]);
        } else {
          setMessages(filtered);
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      }
      setLoadingHistory(false);
    },
    [activeAgent, setMessages]
  );

  // Load 24h history on mount and when agent changes
  useEffect(() => {
    initialLoadDone.current = false;
    setHistoryFullyLoaded(false);
    setOldestLoaded(null);
    clearMessages();
    loadHistory(1).then(() => {
      initialLoadDone.current = true;
    });
  }, [activeAgent, loadHistory, clearMessages]);

  // Scroll to bottom on new messages (only after initial load)
  useEffect(() => {
    if (initialLoadDone.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Infinite scroll: load 7 more days when scrolled to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingHistory || historyFullyLoaded) return;

    if (container.scrollTop < 50 && messages.length > 0) {
      const prevHeight = container.scrollHeight;
      loadHistory(7, oldestLoaded || undefined).then(() => {
        // Preserve scroll position after prepending
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight;
        });
      });
    }
  }, [loadingHistory, historyFullyLoaded, messages.length, oldestLoaded, loadHistory]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const prompt = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, agent: activeAgent }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "No response",
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (e: any) {
      console.error("Chat error:", e);
      const errorMsg = e?.message || "Unknown error occurred";
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      });
      setError(errorMsg);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentAgentLabel =
    availableAgents.find((a) => a.id === activeAgent)?.label || activeAgent;

  return (
    <div className="flex flex-col h-full">
      {/* Header with agent selector */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent-primary)" }}
            />
            {currentAgentLabel}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                agentDropdownOpen && "rotate-180"
              )}
              style={{ color: "var(--text-muted)" }}
            />
          </button>

          {agentDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 w-56 rounded-lg border shadow-lg z-50 py-1 overflow-hidden"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-default)",
              }}
            >
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setActiveAgent(agent.id);
                    setAgentDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                  style={{
                    background:
                      activeAgent === agent.id
                        ? "rgba(232, 69, 60, 0.06)"
                        : "transparent",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeAgent !== agent.id)
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeAgent !== agent.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        activeAgent === agent.id
                          ? "var(--accent-primary)"
                          : "var(--text-muted)",
                    }}
                  />
                  {agent.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingHistory && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading history...
          </span>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {loadingHistory && messages.length === 0 && (
          <div className="flex justify-center py-4">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading messages...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {messages.length === 0 && !loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl shadow-xl mb-6"
              style={{ background: "var(--accent-primary)" }}
            >
              🦞
            </div>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome to OpenClaw
            </h2>
            <p
              className="max-w-md"
              style={{ color: "var(--text-secondary)" }}
            >
              Your personal AI assistant. Ask me anything, set reminders,
              manage your calendar, or just have a conversation.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                "What can you do?",
                "Set a reminder",
                "Check my calendar",
                "Send a message",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {historyFullyLoaded && messages.length > 0 && (
              <div className="text-center py-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Beginning of conversation
                </span>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
            {messages.length > 0 && !isTyping && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={clearMessages}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear conversation
                </button>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pb-safe md:pb-4">
        <div
          className="flex items-end gap-2 p-2 rounded-lg border transition-all duration-200"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-default)",
          }}
        >
          <button
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentAgentLabel}...`}
            rows={1}
            className="flex-1 bg-transparent resize-none focus:outline-none max-h-32"
            style={{
              color: "var(--text-primary)",
              minHeight: "24px",
              height: "auto",
            }}
          />

          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={isTyping}
              className="p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{
                background: "var(--accent-primary)",
                color: "var(--text-on-accent)",
              }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className="p-2.5 rounded-lg transition-colors duration-200"
              style={{
                background: isRecording ? "#EF4444" : "transparent",
                color: isRecording ? "white" : "var(--text-muted)",
              }}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
