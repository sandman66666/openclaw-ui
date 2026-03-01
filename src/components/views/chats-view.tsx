"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, Bot, Plus, MessageSquare, X, Loader2, Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Message, type ChatThread } from "@/stores/app-store";
import { Modal, ModalTrigger, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-md"
            : "bg-gray-800 text-white rounded-bl-md"
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className={cn("text-[10px] mt-1", isUser ? "text-orange-200" : "text-gray-400")}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400"
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
    fetch("/api/merlin-agents")
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

  const inputClasses = cn(
    "w-full px-3 py-2.5 rounded-xl text-sm",
    "bg-gray-50 dark:bg-gray-800",
    "border border-gray-200 dark:border-gray-700",
    "text-gray-900 dark:text-white",
    "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent</label>
        <select className={inputClasses} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
          {agentList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id === "main" ? "Main Agent" : a.id} ({a.model || "default"})
            </option>
          ))}
        </select>
      </div>

      {skills.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {skills.filter((s) => s.eligible).map((skill) => (
              <label
                key={skill.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                  selectedSkills.includes(skill.name)
                    ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30"
                    : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill.name)}
                  onChange={() => toggleSkill(skill.name)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-900 dark:text-white truncate">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Merlin Cloud Agents */}
      {merlinAgents.length > 0 && (
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Cloud className="w-4 h-4 text-purple-500" />
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
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    agentId === maId
                      ? "bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30"
                      : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  )}
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{maName}</p>
                  {ma.role && <p className="text-[11px] text-gray-500 truncate">{ma.role}</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {merlinLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading Merlin agents...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          System Prompt <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          className={cn(inputClasses, "h-20 resize-none")}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Custom instructions for this chat..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          Start Chat
        </Button>
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
      const res = await fetch("/api/chat", {
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

      // Re-fetch thread state to avoid stale closure
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
    <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Chats</h2>
        <Modal open={newChatOpen} onOpenChange={setNewChatOpen}>
          <ModalTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-gray-800 text-orange-500">
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
          <div className="px-3 py-8 text-center text-gray-500 text-sm">
            No chats yet. Tap + to start one.
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => { setActiveThread(thread.id); setMobileSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                activeThreadId === thread.id
                  ? "bg-gray-800 ring-1 ring-orange-500/40"
                  : "hover:bg-gray-800/60"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                activeThreadId === thread.id
                  ? "bg-gradient-to-br from-orange-500 to-red-500"
                  : "bg-gray-700"
              )}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", activeThreadId === thread.id ? "text-white" : "text-gray-300")}>
                  {thread.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{thread.agentModel}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeThread(thread.id); }}
                className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
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
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
          <MessageSquare className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{activeThread.name}</p>
          <p className="text-[11px] text-gray-500">{activeThread.agentModel}{activeThread.skills.length > 0 && ` + ${activeThread.skills.length} skills`}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {activeThread.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl mb-5">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{activeThread.name}</h2>
            <p className="text-gray-500 max-w-sm text-sm">Start a conversation. Messages are routed to this agent.</p>
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
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
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
        <div className={cn(
          "flex items-end gap-2 p-2 rounded-2xl",
          "bg-gray-900 border border-gray-700",
          "focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20",
          "transition-all duration-200"
        )}>
          <textarea
            ref={inputRef}
            value={activeThread.input}
            onChange={(e) => updateThread(activeThread.id, { input: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeThread.name}...`}
            rows={1}
            className="flex-1 bg-transparent resize-none text-white placeholder-gray-500 focus:outline-none max-h-32 px-2"
            style={{ minHeight: "24px", height: "auto" }}
          />
          {activeThread.input.trim() && (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={activeThread.isTyping}
              className={cn(
                "p-2.5 rounded-xl",
                "bg-gradient-to-br from-orange-500 to-red-500 text-white",
                "hover:from-orange-600 hover:to-red-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-center px-8">
      <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden absolute top-4 left-4 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
        <MessageSquare className="w-5 h-5" />
      </button>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl mb-5">
        <Bot className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">OpenClaw Chat</h2>
      <p className="text-gray-500 max-w-sm text-sm mb-6">
        Create a new chat to start talking with an agent.
      </p>
      <Modal open={newChatOpen} onOpenChange={setNewChatOpen}>
        <ModalTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
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
              className="md:hidden fixed inset-0 bg-black/60 z-40"
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
