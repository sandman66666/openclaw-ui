"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  toast: (type: "success" | "error", message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-xl shadow-lg overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
              }}
            >
              {/* Left color stripe */}
              <div
                className="w-1 self-stretch shrink-0"
                style={{
                  background: t.type === "success" ? "var(--accent-green)" : "#EF4444",
                }}
              />
              <div className="flex items-center gap-3 py-3 pr-3 flex-1">
                {t.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "var(--accent-green)" }} />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0" style={{ color: "#EF4444" }} />
                )}
                <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                  {t.message}
                </span>
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
