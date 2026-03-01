"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Cpu, FolderOpen, Heart, Plus, X, Wand2, Sparkles,
  ChevronDown, ChevronUp, Trash2, Check, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Agent } from "@/stores/app-store";
import { apiUrl } from "@/lib/config";

// ── Types ────────────────────────────────────────────────────────────────────

interface SkillInfo {
  name: string;
  description: string;
  emoji: string;
  eligible: boolean;
}

interface CreateAgentForm {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  skills: string[];
}

const MODELS = [
  { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { value: "anthropic/claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
];

// ── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, onDelete }: { agent: Agent; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);

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
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
              )}
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {agent.id === "main" ? "Main Agent" : (agent as any).name || agent.id}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </div>
          {agent.id !== "main" && (
            confirming ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(agent.id)}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Cpu className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Model:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs truncate">
              {agent.model}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Workspace:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs truncate">
              {agent.workspace}
            </span>
          </div>
          {agent.heartbeat && Object.keys(agent.heartbeat).length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Heart className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 dark:text-gray-400">Heartbeat:</span>
              <span className="text-gray-900 dark:text-white text-xs">
                {agent.heartbeat.intervalMinutes
                  ? `every ${agent.heartbeat.intervalMinutes}m`
                  : agent.heartbeat.every || "configured"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Skill Picker ─────────────────────────────────────────────────────────────

function SkillPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/skills"))
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const eligible = skills.filter((s) => s.eligible);
  const filtered = search
    ? eligible.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
      )
    : eligible;
  const shown = expanded ? filtered : filtered.slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading skills...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Skills ({selected.length} selected)
        </label>
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs w-48",
            "bg-gray-100 dark:bg-gray-700/50",
            "border border-gray-200 dark:border-gray-600",
            "text-gray-900 dark:text-white",
            "placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {shown.map((skill) => {
          const isSelected = selected.includes(skill.name);
          return (
            <button
              key={skill.name}
              onClick={() => onToggle(skill.name)}
              className={cn(
                "flex items-start gap-2 p-2.5 rounded-xl text-left transition-all",
                "border",
                isSelected
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <span className="text-base shrink-0">{skill.emoji || "🔧"}</span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    isSelected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  )}
                >
                  {skill.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {skill.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show all ${filtered.length} skills`}
        </button>
      )}
    </div>
  );
}

// ── Create Agent Panel ───────────────────────────────────────────────────────

function CreateAgentPanel({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<CreateAgentForm>({
    id: "",
    name: "",
    model: "anthropic/claude-haiku-4-5-20251001",
    systemPrompt: "",
    skills: [],
  });
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");

  const autoId = useCallback((name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  }, []);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, id: autoId(name) }));
  };

  const toggleSkill = (name: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(name)
        ? f.skills.filter((s) => s !== name)
        : [...f.skills, name],
    }));
  };

  const optimizePrompt = async () => {
    if (!form.systemPrompt.trim()) return;
    setOptimizing(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/agents/optimize-prompt"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: form.systemPrompt,
          agentName: form.name,
          selectedSkills: form.skills,
        }),
      });
      const data = await res.json();
      if (data.optimized) {
        setForm((f) => ({ ...f, systemPrompt: data.optimized }));
      } else {
        setError(data.error || "Failed to optimize prompt");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOptimizing(false);
    }
  };

  const createAgent = async () => {
    if (!form.name.trim()) {
      setError("Agent name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/agents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        onCreated();
      } else {
        setError(data.error || "Failed to create agent");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-800/80",
        "border border-blue-200/50 dark:border-blue-500/20",
        "shadow-lg shadow-blue-500/5"
      )}
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Create Agent</h3>
              <p className="text-xs text-gray-500">Define your AI agent&apos;s identity</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name + ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Agent Name
            </label>
            <input
              type="text"
              placeholder="My Assistant"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl text-sm",
                "bg-gray-50 dark:bg-gray-700/50",
                "border border-gray-200 dark:border-gray-600",
                "text-gray-900 dark:text-white",
                "placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              )}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Agent ID
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl text-sm font-mono",
                "bg-gray-50 dark:bg-gray-700/50",
                "border border-gray-200 dark:border-gray-600",
                "text-gray-900 dark:text-white",
                "placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              )}
            />
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Model
          </label>
          <select
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            className={cn(
              "w-full px-3 py-2.5 rounded-xl text-sm",
              "bg-gray-50 dark:bg-gray-700/50",
              "border border-gray-200 dark:border-gray-600",
              "text-gray-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            )}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </label>
            <button
              onClick={optimizePrompt}
              disabled={optimizing || !form.systemPrompt.trim()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                optimizing
                  ? "bg-purple-100 dark:bg-purple-500/20 text-purple-500 cursor-wait"
                  : form.systemPrompt.trim()
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {optimizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              {optimizing ? "Optimizing..." : "AI Optimize"}
            </button>
          </div>
          <textarea
            placeholder={"You are a helpful assistant that specializes in...\n\nDescribe your agent's role, personality, and what it should do. Click 'AI Optimize' to enhance your prompt."}
            value={form.systemPrompt}
            onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
            rows={8}
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm leading-relaxed",
              "bg-gray-50 dark:bg-gray-700/50",
              "border border-gray-200 dark:border-gray-600",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
              "resize-y font-mono"
            )}
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.systemPrompt.length} characters
            {form.systemPrompt.length > 0 && ` · ~${Math.ceil(form.systemPrompt.length / 4)} tokens`}
          </p>
        </div>

        {/* Skills */}
        <SkillPicker selected={form.skills} onToggle={toggleSkill} />

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={createAgent}
            disabled={saving || !form.name.trim()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all",
              saving || !form.name.trim()
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md shadow-blue-500/20"
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {saving ? "Creating..." : "Create Agent"}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────

export function AgentsView() {
  const { agents, loading, setAgents } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);

  const refreshAgents = async () => {
    try {
      const res = await fetch(apiUrl("/api/agents"));
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    } catch {}
  };

  const deleteAgent = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/agents?id=${id}`), { method: "DELETE" });
      const data = await res.json();
      if (data.ok) refreshAgents();
    } catch {}
  };

  return (
    <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Agents
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {agents.length === 0
              ? loading["agents"]
                ? "Loading..."
                : "No agents found"
              : `${agents.length} agent${agents.length > 1 ? "s" : ""} configured`}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
              "hover:from-blue-600 hover:to-purple-600",
              "shadow-md shadow-blue-500/20"
            )}
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateAgentPanel
            onCreated={() => {
              setShowCreate(false);
              refreshAgents();
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onDelete={deleteAgent} />
        ))}
      </div>
    </div>
  );
}
