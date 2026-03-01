"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Loader2, Calendar, RefreshCw, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { useToast } from "@/components/ui/toast";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  source?: string;
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isDone = task.status === "Done" || task.status === "done" || task.status === "Complete";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 px-4 py-3 group transition-colors duration-150"
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-subtle)",
        opacity: isDone ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; }}
    >
      {/* Custom checkbox — 18×18, 4px radius, subtle unchecked */}
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onToggle(task.id, !isDone);
          setLoading(false);
        }}
        className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 transition-all duration-150"
        style={{
          border: `2px solid ${isDone ? "var(--accent-green)" : "var(--border-default)"}`,
          background: isDone ? "var(--accent-green)" : "transparent",
          borderRadius: "4px",
        }}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--text-secondary)" }} />
        ) : isDone ? (
          <Check className="w-3 h-3 text-white" />
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn("text-sm font-medium", isDone && "line-through")}
          style={{ color: isDone ? "var(--text-muted)" : "var(--text-primary)" }}
        >
          {task.title}
        </p>
      </div>

      {task.dueDate && (
        <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>
          <Calendar className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      )}

      {/* Trash — visible only on hover */}
      <button
        onClick={() => onDelete(task.id)}
        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function TasksView() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [adding, setAdding] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/tasks"));
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(apiUrl("/api/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), dueDate: newDate || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", "Task added");
        setNewTitle("");
        setNewDate("");
        loadTasks();
      } else {
        toast("error", data.error || "Failed to add task");
      }
    } catch {
      toast("error", "Failed to add task");
    }
    setAdding(false);
  };

  const handleToggle = async (id: string, done: boolean) => {
    try {
      const res = await fetch(apiUrl("/api/tasks"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: done ? "Done" : "Not started" }),
      });
      const data = await res.json();
      if (data.ok) loadTasks();
      else toast("error", data.error || "Failed to update task");
    } catch {
      toast("error", "Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/tasks?id=${id}`), { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast("success", "Task deleted");
      } else toast("error", data.error || "Failed to delete");
    } catch {
      toast("error", "Failed to delete task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  const todoTasks = tasks.filter((t) => t.status !== "Done" && t.status !== "done" && t.status !== "Complete");
  const doneTasks = tasks.filter((t) => t.status === "Done" || t.status === "done" || t.status === "Complete");

  return (
    <div className="flex flex-col h-full max-w-[800px] mx-auto px-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Tasks</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {loading ? "Loading..." : `${todoTasks.length} to do, ${doneTasks.length} done`}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); loadTasks(); }}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Sticky add task bar */}
      <div
        className="sticky top-0 z-10 pb-4"
        style={{ background: "var(--bg-surface, var(--bg-base))" }}
      >
        <div
          className="flex items-center gap-2 p-3 rounded-lg border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
        >
          <input
            className="flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              borderColor: "var(--border-default)",
            }}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
          />
          <input
            type="date"
            className="w-36 shrink-0 px-3 py-2 rounded-lg text-sm border focus:outline-none"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              borderColor: "var(--border-default)",
              colorScheme: "dark",
            }}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 transition-colors disabled:opacity-40"
            style={{
              background: "var(--accent-primary)",
              color: "var(--text-on-accent)",
            }}
            onMouseEnter={(e) => { if (!adding && newTitle.trim()) e.currentTarget.style.background = "var(--accent-primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-primary)"; }}
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </div>

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-6">
        {/* Active tasks */}
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-default)" }}>
          <AnimatePresence mode="popLayout">
            {todoTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
          {todoTasks.length === 0 && !loading && doneTasks.length === 0 && (
            <div className="text-center py-16" style={{ background: "var(--bg-card)" }}>
              <CheckSquare className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>No tasks yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Add your first task above</p>
            </div>
          )}
        </div>

        {/* Completed section */}
        {doneTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider pt-2" style={{ color: "var(--text-muted)" }}>
              Completed
            </h3>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-default)" }}>
              <AnimatePresence mode="popLayout">
                {doneTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
