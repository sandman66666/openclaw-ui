"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, AlertTriangle, Check, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Skill } from "@/stores/app-store";

function SkillCard({ skill }: { skill: Skill }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMissing =
    skill.missing &&
    (skill.missing.bins.length > 0 || skill.missing.env.length > 0 || skill.missing.config.length > 0);

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-xl"
          style={{ background: skill.eligible ? "rgba(232, 69, 60, 0.1)" : "var(--bg-elevated)" }}
        >
          {skill.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {skill.name}
            </h3>
            {!skill.eligible && hasMissing && <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--accent-orange)" }} />}
            {skill.eligible && <Check className="w-4 h-4 shrink-0" style={{ color: "var(--accent-green)" }} />}
          </div>
          <p className="text-[13px] line-clamp-1" style={{ color: "var(--text-secondary)" }}>
            {skill.description}
          </p>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded shrink-0"
          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
        >
          {skill.source === "openclaw-bundled" ? "bundled" : skill.source}
        </span>
        {hasMissing && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-150", isExpanded && "rotate-90")} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasMissing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="pt-3 space-y-2 text-sm" style={{ color: "var(--accent-orange)" }}>
                {skill.missing!.bins.length > 0 && (
                  <div><span className="font-medium">Missing binaries: </span><span className="font-mono text-xs">{skill.missing!.bins.join(", ")}</span></div>
                )}
                {skill.missing!.env.length > 0 && (
                  <div><span className="font-medium">Missing env: </span><span className="font-mono text-xs">{skill.missing!.env.join(", ")}</span></div>
                )}
                {skill.missing!.config.length > 0 && (
                  <div><span className="font-medium">Missing config: </span><span className="font-mono text-xs">{skill.missing!.config.join(", ")}</span></div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SkillsView() {
  const { skills, loading } = useAppStore();
  const [filter, setFilter] = useState<"all" | "eligible" | "missing">("all");
  const [search, setSearch] = useState("");

  const filtered = skills.filter((s) => {
    if (filter === "eligible" && !s.eligible) return false;
    if (filter === "missing" && s.eligible) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const eligibleCount = skills.filter((s) => s.eligible).length;

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Skills</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {skills.length === 0
            ? loading["skills"] ? "Loading skills..." : "No skills found"
            : `${eligibleCount} of ${skills.length} skills eligible`}
        </p>
      </div>

      {/* Progress bar */}
      {skills.length > 0 && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--accent-primary)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(eligibleCount / skills.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          />
        </div>
        <div className="flex p-1 rounded-lg" style={{ background: "var(--bg-card)" }}>
          {(["all", "eligible", "missing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                background: filter === f ? "var(--bg-elevated)" : "transparent",
                color: filter === f ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {f === "all" ? "All" : f === "eligible" ? "Ready" : "Missing"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
        {filtered.length === 0 && skills.length > 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No skills match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
