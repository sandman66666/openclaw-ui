"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Bot, Plus, Loader2, RefreshCw, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface MerlinAgent {
  id?: string;
  name?: string;
  description?: string;
  model?: string;
  [k: string]: any;
}

interface MerlinSkill {
  id?: string;
  name?: string;
  description?: string;
  trigger?: string;
  [k: string]: any;
}

function AgentCard({ agent }: { agent: MerlinAgent }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    setAdding(true);
    try {
      const agentId = `merlin-${(agent.id || agent.name || "agent")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agentId,
          name: agent.name || "Merlin Agent",
          model: agent.model || "anthropic/claude-sonnet-4-6",
          description: agent.description || "",
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || !data.error)) {
        setAdded(true);
        toast("success", `Added "${agent.name || agentId}" to OpenClaw agents`);
      } else {
        toast("error", data.error || "Failed to add agent");
      }
    } catch {
      toast("error", "Failed to add agent");
    }
    setAdding(false);
  };

  const displayName = agent.name || agent.id || "Unknown Agent";
  const displayDesc = agent.description || "Merlin AI Agent";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50"
      )}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-500/10">
        <Bot className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayDesc}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={adding || added}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
          added
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
        )}
      >
        {adding ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : added ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        {added ? "Added" : "Add"}
      </button>
    </motion.div>
  );
}

function SkillCard({ skill }: { skill: MerlinSkill }) {
  const [noted, setNoted] = useState(false);
  const { toast } = useToast();

  const handleNote = () => {
    setNoted(true);
    toast("success", `"${skill.name || "Skill"}" noted — find it in the Skills tab to install`);
  };

  const displayName = skill.name || skill.trigger || skill.id || "Unknown Skill";
  const displayDesc = skill.description || "Merlin capability";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50"
      )}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10">
        <Zap className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayDesc}</p>
      </div>
      <button
        onClick={handleNote}
        disabled={noted}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
          noted
            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            : "bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        )}
      >
        {noted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {noted ? "Noted" : "Add"}
      </button>
    </motion.div>
  );
}

export function MerlinView() {
  const [agents, setAgents] = useState<MerlinAgent[]>([]);
  const [skills, setSkills] = useState<MerlinSkill[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch("/api/merlin-agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {}
    setLoadingAgents(false);
  };

  const loadSkills = async () => {
    setLoadingSkills(true);
    try {
      const res = await fetch("/api/merlin-skills");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch {}
    setLoadingSkills(false);
  };

  useEffect(() => {
    loadAgents();
    loadSkills();
  }, []);

  return (
    <div className="px-4 py-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Merlin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Agents &amp; skills from merlin.build</p>
        </div>
        <a
          href="https://merlin.build"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Agents */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Agents
          </h3>
          <button
            onClick={loadAgents}
            disabled={loadingAgents}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", loadingAgents && "animate-spin")} />
            Refresh
          </button>
        </div>
        {loadingAgents ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No Merlin agents found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agents.map((agent, i) => (
              <AgentCard key={agent.id || i} agent={agent} />
            ))}
          </div>
        )}
      </section>

      {/* Skills */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Skills
          </h3>
          <button
            onClick={loadSkills}
            disabled={loadingSkills}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", loadingSkills && "animate-spin")} />
            Refresh
          </button>
        </div>
        {loadingSkills ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No Merlin skills found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill, i) => (
              <SkillCard key={skill.id || i} skill={skill} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
