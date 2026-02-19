"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, AlertTriangle, Check, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useAppStore, type Skill } from "@/stores/app-store";

function SkillCard({ skill }: { skill: Skill }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMissing =
    skill.missing &&
    (skill.missing.bins.length > 0 ||
      skill.missing.env.length > 0 ||
      skill.missing.config.length > 0);

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
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            skill.eligible
              ? "bg-blue-50 dark:bg-blue-500/10"
              : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          {skill.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {skill.name}
            </h3>
            {!skill.eligible && hasMissing && (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            {skill.eligible && (
              <Check className="w-4 h-4 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {skill.description}
          </p>
        </div>

        {/* Source badge */}
        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full shrink-0">
          {skill.source === "openclaw-bundled" ? "bundled" : skill.source}
        </span>

        {/* Expand */}
        {hasMissing && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-lg text-gray-400 hover:text-gray-600",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "transition-all duration-200"
            )}
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasMissing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
              <div className="pt-3 space-y-2 text-sm">
                {skill.missing!.bins.length > 0 && (
                  <div className="text-amber-600 dark:text-amber-400">
                    <span className="font-medium">Missing binaries: </span>
                    <span className="font-mono text-xs">
                      {skill.missing!.bins.join(", ")}
                    </span>
                  </div>
                )}
                {skill.missing!.env.length > 0 && (
                  <div className="text-amber-600 dark:text-amber-400">
                    <span className="font-medium">Missing env: </span>
                    <span className="font-mono text-xs">
                      {skill.missing!.env.join(", ")}
                    </span>
                  </div>
                )}
                {skill.missing!.config.length > 0 && (
                  <div className="text-amber-600 dark:text-amber-400">
                    <span className="font-medium">Missing config: </span>
                    <span className="font-mono text-xs">
                      {skill.missing!.config.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Skills
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {skills.length === 0
            ? loading["skills"]
              ? "Loading skills..."
              : "No skills found"
            : `${eligibleCount} of ${skills.length} skills eligible`}
        </p>
      </div>

      {/* Progress bar */}
      {skills.length > 0 && (
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(eligibleCount / skills.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl",
              "bg-white dark:bg-gray-800/50",
              "border border-gray-200/50 dark:border-gray-700/50",
              "text-gray-900 dark:text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            )}
          />
        </div>
        <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {(["all", "eligible", "missing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === f
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {f === "all" ? "All" : f === "eligible" ? "Ready" : "Missing"}
            </button>
          ))}
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {filtered.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
        {filtered.length === 0 && skills.length > 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No skills match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
