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
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(232, 69, 60, 0.1)" }}
            >
              <Bot className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {agent.id === "main" ? "Main Agent" : (agent as any).name || agent.id}
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(52, 211, 153, 0.1)", color: "var(--accent-green)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />
                Active
              </span>
            </div>
          </div>
          {agent.id !== "main" && (
            confirming ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(agent.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Cpu className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Model:</span>
            <span className="font-mono text-xs truncate" style={{ color: "var(--text-primary)" }}>
              {agent.model}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FolderOpen className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Workspace:</span>
            <span className="font-mono text-xs truncate" style={{ color: "var(--text-primary)" }}>
              {agent.workspace}
            </span>
          </div>
          {agent.heartbeat && Object.keys(agent.heartbeat).length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Heart className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Heartbeat:</span>
              <span className="text-xs" style={{ color: "var(--text-primary)" }}>
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
      <div className="flex items-center gap-2 text-sm py-4" style={{ color: "var(--text-muted)" }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading skills...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Skills ({selected.length} selected)
        </label>
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs w-48 border focus:outline-none focus:ring-2"
          style={{
            background: "var(--bg-input)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
            "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
          } as React.CSSProperties}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {shown.map((skill) => {
          const isSelected = selected.includes(skill.name);
          return (
            <button
              key={skill.name}
              onClick={() => onToggle(skill.name)}
              className="flex items-start gap-2 p-2.5 rounded-lg text-left transition-all border"
              style={{
                background: isSelected ? "rgba(232, 69, 60, 0.06)" : "var(--bg-elevated)",
                borderColor: isSelected ? "rgba(232, 69, 60, 0.3)" : "var(--border-default)",
              }}
            >
              <span className="text-base shrink-0">{skill.emoji || "🔧"}</span>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: isSelected ? "var(--accent-primary)" : "var(--text-primary)" }}
                >
                  {skill.name}
                </p>
                <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: "var(--text-muted)" }}>
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
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "var(--accent-primary)" }}
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
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "rgba(232, 69, 60, 0.2)" }}
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-primary)" }}
            >
              <Plus className="w-5 h-5" style={{ color: "var(--text-on-accent)" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Create Agent</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Define your AI agent&apos;s identity</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name + ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
              Agent Name
            </label>
            <input
              type="text"
              placeholder="My Assistant"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
              } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
              Agent ID
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border focus:outline-none focus:ring-2"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
            Model
          </label>
          <select
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              System Prompt
            </label>
            <button
              onClick={optimizePrompt}
              disabled={optimizing || !form.systemPrompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{
                background: optimizing ? "rgba(232, 69, 60, 0.1)" : form.systemPrompt.trim() ? "var(--accent-primary)" : "var(--bg-elevated)",
                color: form.systemPrompt.trim() && !optimizing ? "var(--text-on-accent)" : "var(--text-muted)",
              }}
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
            className="w-full px-4 py-3 rounded-lg text-sm leading-relaxed border focus:outline-none focus:ring-2 resize-y font-mono"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {form.systemPrompt.length} characters
            {form.systemPrompt.length > 0 && ` · ~${Math.ceil(form.systemPrompt.length / 4)} tokens`}
          </p>
        </div>

        {/* Skills */}
        <SkillPicker selected={form.skills} onToggle={toggleSkill} />

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={createAgent}
            disabled={saving || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-40"
            style={{
              background: saving || !form.name.trim() ? "var(--bg-elevated)" : "var(--accent-primary)",
              color: saving || !form.name.trim() ? "var(--text-muted)" : "var(--text-on-accent)",
            }}
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
            className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
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
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Agents
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: "var(--accent-primary)",
              color: "var(--text-on-accent)",
            }}
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
