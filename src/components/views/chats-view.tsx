"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Bot,
} from "lucide-react";
import { useAppStore, type Conversation } from "@/stores/app-store";
import { apiUrl } from "@/lib/config";

// ── New Conversation Modal ───────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (agentId: string, title: string) => void;
}) {
  const { agents } = useAppStore();
  const [selectedAgent, setSelectedAgent] = useState<string>(
    agents.length > 0 ? agents[0].id : "webui"
  );
  const [title, setTitle] = useState("");

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(selectedAgent, title.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border shadow-lg overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              New Conversation
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                className="text-sm font-medium mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="webui">Primary Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {(agent as any).name || agent.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="text-sm font-medium mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                Conversation Title
              </label>
              <input
                type="text"
                placeholder="e.g., Project Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim()) {
                    handleCreate();
                  }
                }}
                className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{
                background: "var(--accent-primary)",
                color: "var(--text-on-accent)",
              }}
            >
              Create Conversation
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Conversation Card ────────────────────────────────────────────────────────

function ConversationCard({
  conversation,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  onSelect: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <motion.div
      layout
      className="rounded-lg border overflow-hidden cursor-pointer group transition-colors"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-default)",
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-card-hover)";
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-card)";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bot className="w-4 h-4 shrink-0" style={{ color: "var(--accent-primary)" }} />
            <h3
              className="font-semibold text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {conversation.title}
            </h3>
          </div>
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {confirming ? (
              <>
                <button
                  onClick={() => onDelete(conversation.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p
          className="text-xs mb-2 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {conversation.lastMessage || "No messages yet"}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ background: "rgba(201, 168, 76, 0.1)", color: "var(--accent-primary)" }}
          >
            {conversation.agentName}
          </span>
          <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-3 h-3" />
            {timeAgo(conversation.lastMessageAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────

export function ChatsView() {
  const { conversations, setActiveTab, setActiveConversation } = useAppStore();
  const [showNewModal, setShowNewModal] = useState(false);

  const handleCreateConversation = async (agentId: string, title: string) => {
    try {
      const res = await fetch(apiUrl("/api/sessions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: `conv_${Date.now()}`,
          agentId,
          title,
        }),
      });
      const data = await res.json();
      if (data.ok || data.conversation) {
        // Add the new conversation to the store
        const conv = data.conversation;
        if (conv) {
          const { setConversations } = useAppStore.getState();
          const current = useAppStore.getState().conversations;
          setConversations([
            {
              id: conv.id,
              agentId: conv.agentId,
              agentName: conv.agentName || conv.agentId,
              title: conv.title,
              lastMessage: conv.lastMessage || "",
              lastMessageAt: new Date(conv.lastMessageAt),
              messageCount: conv.messageCount || 0,
            },
            ...current,
          ]);
        }
        setShowNewModal(false);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setActiveTab("chat");
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/sessions?id=${id}`), { method: "DELETE" });
      // Refresh conversations list (would be done by data loader)
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Conversations
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {conversations.length === 0
              ? "No conversations yet"
              : `${conversations.length} conversation${
                  conversations.length > 1 ? "s" : ""
                }`}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{
            background: "var(--accent-primary)",
            color: "var(--text-on-accent)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-primary)";
          }}
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center shadow-xl mb-5"
            style={{ background: "rgba(201, 168, 76, 0.1)" }}
          >
            <MessageSquare
              className="w-10 h-10"
              style={{ color: "var(--accent-primary)" }}
            />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No Conversations Yet
          </h3>
          <p className="text-sm max-w-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Start a new conversation with an agent. Each conversation maintains its own
            history and 24-hour rolling context.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: "var(--accent-primary)",
              color: "var(--text-on-accent)",
            }}
          >
            <Plus className="w-4 h-4" />
            Create First Conversation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onSelect={() => handleSelectConversation(conversation.id)}
                onDelete={handleDeleteConversation}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showNewModal && (
          <NewConversationModal
            onClose={() => setShowNewModal(false)}
            onCreate={handleCreateConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
