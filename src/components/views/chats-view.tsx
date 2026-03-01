"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, Bot, Plus, MessageSquare, X, Loader2, Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { useAppStore, type Message, type ChatThread } from "@/stores/app-store";
import { Modal, ModalTrigger, ModalContent } from "@/components/ui/modal";

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className="text-[10px] mt-1"
          style={{ color: isUser ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="px-4 py-3 rounded-lg" style={{ background: "var(--bg-elevated)", borderBottomLeftRadius: "4px" }}>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--text-muted)" }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface MerlinAgent {
  name?: string;
  key?: string;
  role?: string;
  id?: string;
}

function NewChatModal({ onClose }: { onClose: () => void }) {
  const { agents, skills, addThread } = useAppStore();
  const [agentId, setAgentId] = useState("main");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [merlinAgents, setMerlinAgents] = useState<MerlinAgent[]>([]);
  const [merlinLoading, setMerlinLoading] = useState(true);

  const agentList = agents.length > 0
    ? agents
    : [{ id: "main", model: "default", workspace: "", heartbeat: {} }];

  useEffect(() => {
    fetch(apiUrl("/api/merlin-agents"))
      .then((r) => r.json())
      .then((d) => setMerlinAgents(d.agents || []))
      .catch(() => {})
      .finally(() => setMerlinLoading(false));
  }, []);

  const handleCreate = () => {
    const agent = agentList.find((a) => a.id === agentId) || agentList[0];
    const thread: ChatThread = {
      id: Date.now().toString(),
      agentId: agent.id,
      agentModel: agent.model || "default",
      name: agent.id === "main" ? "Main Agent" : agent.id,
      messages: [],
      skills: selectedSkills,
      systemPrompt: systemPrompt || undefined,
      isTyping: false,
      input: "",
    };
    addThread(thread);
    onClose();
  };

  const toggleSkill = (name: string) => {
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Agent</label>
        <select
          className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
          style={{
            background: "var(--bg-input)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
            "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
          } as React.CSSProperties}
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        >
          {agentList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id === "main" ? "Main Agent" : a.id} ({a.model || "default"})
            </option>
          ))}
        </select>
      </div>

      {skills.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Skills</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {skills.filter((s) => s.eligible).map((skill) => (
              <label
                key={skill.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors border"
                style={{
                  background: selectedSkills.includes(skill.name) ? "rgba(232, 69, 60, 0.06)" : "var(--bg-input)",
                  borderColor: selectedSkills.includes(skill.name) ? "rgba(232, 69, 60, 0.3)" : "var(--border-default)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill.name)}
                  onChange={() => toggleSkill(skill.name)}
                  className="rounded"
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span className="truncate" style={{ color: "var(--text-primary)" }}>{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Merlin Cloud Agents */}
      {merlinAgents.length > 0 && (
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            <Cloud className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            Merlin Cloud
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {merlinAgents.map((ma) => {
              const maId = ma.key || ma.id || ma.name || "";
              const maName = ma.name || ma.key || maId;
              return (
                <button
                  key={maId}
                  onClick={() => setAgentId(maId)}
                  className="px-3 py-2 rounded-lg text-sm text-left transition-colors border"
                  style={{
                    background: agentId === maId ? "rgba(232, 69, 60, 0.06)" : "var(--bg-input)",
                    borderColor: agentId === maId ? "rgba(232, 69, 60, 0.3)" : "var(--border-default)",
                  }}
                >
                  <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{maName}</p>
                  {ma.role && <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{ma.role}</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {merlinLoading && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading Merlin agents...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          System Prompt <span style={{ color: "var(--text-muted)" }}>(optional)</span>
        </label>
        <textarea
          className="w-full px-3 py-2.5 rounded-lg text-sm h-20 resize-none border focus:outline-none focus:ring-2"
          style={{
            background: "var(--bg-input)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
            "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
          } as React.CSSProperties}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Custom instructions for this chat..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}

export function ChatsView() {
  const {
    threads, activeThreadId, setActiveThread, updateThread, removeThread,
  } = useAppStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, activeThread?.isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeThreadId]);

  const handleSend = async () => {
    if (!activeThread) return;
    const input = activeThread.input.trim();
    if (!input) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    updateThread(activeThread.id, {
      messages: [...activeThread.messages, userMessage],
      input: "",
      isTyping: true,
    });

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: activeThread.agentId, message: input }),
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "No response",
        timestamp: new Date(),
      };

      const current = useAppStore.getState().threads.find((t) => t.id === activeThread.id);
      if (current) {
        updateThread(activeThread.id, {
          messages: [...current.messages, assistantMessage],
          isTyping: false,
        });
      }
    } catch (e: any) {
      const current = useAppStore.getState().threads.find((t) => t.id === activeThread.id);
      if (current) {
        updateThread(activeThread.id, {
          messages: [
            ...current.messages,
            { id: (Date.now() + 1).toString(), role: "assistant", content: `Error: ${e.message}`, timestamp: new Date() },
          ],
          isTyping: false,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Thread list sidebar
  const sidebar = (
    <div className="flex flex-col h-full border-r" style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Chats</h2>
        <Modal open={newChatOpen} onOpenChange={setNewChatOpen}>
          <ModalTrigger asChild>
            <button className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--accent-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </ModalTrigger>
          <ModalContent title="New Chat" description="Choose an agent and optional skills">
            <NewChatModal onClose={() => setNewChatOpen(false)} />
          </ModalContent>
        </Modal>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No chats yet. Tap + to start one.
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => { setActiveThread(thread.id); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200"
              style={{
                background: activeThreadId === thread.id ? "rgba(232, 69, 60, 0.06)" : "transparent",
                ...(activeThreadId === thread.id ? { boxShadow: "inset 0 0 0 1px rgba(232, 69, 60, 0.2)" } : {}),
              }}
              onMouseEnter={(e) => { if (activeThreadId !== thread.id) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={(e) => { if (activeThreadId !== thread.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: activeThreadId === thread.id ? "var(--accent-primary)" : "var(--bg-elevated)",
                }}
              >
                <Bot className="w-4 h-4" style={{ color: activeThreadId === thread.id ? "var(--text-on-accent)" : "var(--text-muted)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: activeThreadId === thread.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {thread.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{thread.agentModel}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeThread(thread.id); }}
                className="p-1 rounded transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // Conversation panel
  const conversationPanel = activeThread ? (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-surface)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
          <MessageSquare className="w-5 h-5" />
        </button>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-primary)" }}
        >
          <Bot className="w-4 h-4" style={{ color: "var(--text-on-accent)" }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{activeThread.name}</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{activeThread.agentModel}{activeThread.skills.length > 0 && ` + ${activeThread.skills.length} skills`}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {activeThread.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center shadow-xl mb-5"
              style={{ background: "var(--accent-primary)" }}
            >
              <Bot className="w-8 h-8" style={{ color: "var(--text-on-accent)" }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{activeThread.name}</h2>
            <p className="max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>Start a conversation. Messages are routed to this agent.</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {activeThread.messages.map((m) => <MessageBubble key={m.id} message={m} />)}
              {activeThread.isTyping && <TypingIndicator />}
            </AnimatePresence>
            {activeThread.messages.length > 0 && !activeThread.isTyping && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => updateThread(activeThread.id, { messages: [] })}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
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

      {/* Input */}
      <div className="px-4 pb-4 pb-safe md:pb-4">
        <div
          className="flex items-end gap-2 p-2 rounded-lg border transition-all duration-200"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-default)",
          }}
        >
          <textarea
            ref={inputRef}
            value={activeThread.input}
            onChange={(e) => updateThread(activeThread.id, { input: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeThread.name}...`}
            rows={1}
            className="flex-1 bg-transparent resize-none focus:outline-none max-h-32 px-2"
            style={{ color: "var(--text-primary)", minHeight: "24px", height: "auto" }}
          />
          {activeThread.input.trim() && (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={activeThread.isTyping}
              className="p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center px-8" style={{ background: "var(--bg-surface)" }}>
      <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden absolute top-4 left-4 p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
        <MessageSquare className="w-5 h-5" />
      </button>
      <div
        className="w-20 h-20 rounded-lg flex items-center justify-center shadow-xl mb-5"
        style={{ background: "var(--accent-primary)" }}
      >
        <Bot className="w-10 h-10" style={{ color: "var(--text-on-accent)" }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>OpenClaw Chat</h2>
      <p className="max-w-sm text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Create a new chat to start talking with an agent.
      </p>
      <Modal open={newChatOpen} onOpenChange={setNewChatOpen}>
        <ModalTrigger asChild>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </ModalTrigger>
        <ModalContent title="New Chat" description="Choose an agent and optional skills">
          <NewChatModal onClose={() => setNewChatOpen(false)} />
        </ModalContent>
      </Modal>
    </div>
  );

  return (
    <div className="flex h-full relative">
      <div className="hidden md:block w-64 shrink-0">{sidebar}</div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0, 0, 0, 0.6)" }}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">{conversationPanel}</div>
    </div>
  );
}
