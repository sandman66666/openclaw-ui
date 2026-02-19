"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, StopCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Message } from "@/stores/app-store";

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
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isUser ? "text-blue-100" : "text-gray-400"
          )}
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
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400"
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
      const res = await fetch("/api/chat", {
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
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-xl mb-6">
              🦞
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to OpenClaw
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
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
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    "bg-gray-100 hover:bg-gray-200 text-gray-700",
                    "dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300",
                    "transition-colors duration-200"
                  )}
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
            {/* Clear button */}
            {messages.length > 0 && !isTyping && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={clearMessages}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
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
          className={cn(
            "flex items-end gap-2 p-2 rounded-2xl",
            "bg-gray-100 dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
            "transition-all duration-200"
          )}
        >
          <button
            className={cn(
              "p-2 rounded-xl text-gray-400 hover:text-gray-600",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "transition-colors duration-200"
            )}
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
            className={cn(
              "flex-1 bg-transparent resize-none",
              "text-gray-900 dark:text-white placeholder-gray-400",
              "focus:outline-none",
              "max-h-32"
            )}
            style={{ minHeight: "24px", height: "auto" }}
          />

          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={isTyping}
              className={cn(
                "p-2.5 rounded-xl",
                "bg-blue-500 text-white",
                "hover:bg-blue-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200"
              )}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "p-2.5 rounded-xl",
                isRecording
                  ? "bg-red-500 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
                "transition-colors duration-200"
              )}
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
