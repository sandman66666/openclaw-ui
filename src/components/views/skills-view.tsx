"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Key, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppStore, type Skill } from "@/stores/app-store";

function SkillCard({
  skill,
  onToggle,
  onApiKeyChange,
}: {
  skill: Skill;
  onToggle: () => void;
  onApiKeyChange: (key: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(skill.apiKey || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveApiKey = () => {
    onApiKeyChange(apiKeyInput);
    setIsEditing(false);
  };

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
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            skill.enabled
              ? "bg-blue-50 dark:bg-blue-500/10"
              : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          {skill.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {skill.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {skill.description}
          </p>
        </div>

        {/* Toggle */}
        <Switch checked={skill.enabled} onCheckedChange={onToggle} />

        {/* Expand button (if has API key) */}
        {skill.requiresApiKey && (
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

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && skill.requiresApiKey && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
              <div className="pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Key className="w-4 h-4" />
                  API Key
                </label>

                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter your API key"
                      className={cn(
                        "flex-1 px-4 py-2 rounded-xl",
                        "bg-gray-100 dark:bg-gray-900",
                        "border border-gray-200 dark:border-gray-700",
                        "text-gray-900 dark:text-white",
                        "placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      )}
                    />
                    <Button size="sm" onClick={handleSaveApiKey}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setApiKeyInput(skill.apiKey || "");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex-1 px-4 py-2 rounded-xl",
                        "bg-gray-100 dark:bg-gray-900",
                        "text-gray-500 dark:text-gray-400",
                        "font-mono text-sm"
                      )}
                    >
                      {skill.apiKey ? "••••••••••••••••" : "Not configured"}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      {skill.apiKey ? "Change" : "Add"}
                    </Button>
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
  const { skills, toggleSkill, setSkillApiKey } = useAppStore();

  const enabledCount = skills.filter((s) => s.enabled).length;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Skills
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {enabledCount} of {skills.length} skills enabled
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(enabledCount / skills.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onToggle={() => toggleSkill(skill.id)}
            onApiKeyChange={(key) => setSkillApiKey(skill.id, key)}
          />
        ))}
      </div>
    </div>
  );
}
