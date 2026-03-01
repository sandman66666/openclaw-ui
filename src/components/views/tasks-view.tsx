"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Loader2, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  source?: string;
}

const inputClasses = cn(
  "w-full px-3 py-2.5 rounded-xl text-sm",
  "bg-gray-50 dark:bg-gray-800",
  "border border-gray-200 dark:border-gray-700",
  "text-gray-900 dark:text-white placeholder-gray-400",
  "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
);

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50",
        "group transition-all"
      )}
    >
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onToggle(task.id, !isDone);
          setLoading(false);
        }}
        className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
          isDone
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 dark:border-gray-600 hover:border-orange-500"
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isDone ? (
          <Check className="w-3.5 h-3.5" />
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", isDone && "line-through text-gray-400")}>
          {task.title}
          {task.source === "notion" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium ml-1.5">Notion</span>
          )}
        </p>
      </div>

      {task.dueDate && (
        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <Calendar className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
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
      if (data.ok) {
        loadTasks();
      } else {
        toast("error", data.error || "Failed to update task");
      }
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
      } else {
        toast("error", data.error || "Failed to delete");
      }
    } catch {
      toast("error", "Failed to delete task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const todoTasks = tasks.filter((t) => t.status !== "Done" && t.status !== "done" && t.status !== "Complete");
  const doneTasks = tasks.filter((t) => t.status === "Done" || t.status === "done" || t.status === "Complete");

  return (
    <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? "Loading..." : `${todoTasks.length} to do, ${doneTasks.length} done`}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); loadTasks(); }}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Add task form */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <input
              className={cn(inputClasses, "flex-1")}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task..."
            />
            <input
              type="date"
              className={cn(inputClasses, "w-36 shrink-0")}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="gap-1.5 shrink-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 pl-1 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/20 w-3.5 h-3.5" />
          Save to Notion
        </label>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {todoTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>

      {/* Done section */}
      {doneTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Completed</h3>
          <AnimatePresence mode="popLayout">
            {doneTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No tasks yet</p>
          <p className="text-sm">Add your first task above</p>
        </div>
      )}
    </div>
  );
}
