"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, StopCircle, Trash2 } from "lucide-react";
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
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
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

export function ChatView() {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isTyping, addMessage, setIsTyping, clearMessages, connected } =
    useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "No response",
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (e: any) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${e.message}`,
        timestamp: new Date(),
      });
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl shadow-xl mb-6"
              style={{ background: "var(--accent-primary)" }}
            >
              🦞
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Welcome to OpenClaw
            </h2>
            <p className="max-w-md" style={{ color: "var(--text-secondary)" }}>
              Your personal AI assistant. Ask me anything, set reminders, manage
              your calendar, or just have a conversation.
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
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
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
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 bg-transparent resize-none focus:outline-none max-h-32"
            style={{ color: "var(--text-primary)", minHeight: "24px", height: "auto" }}
          />

          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={isTyping}
              className="p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
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
