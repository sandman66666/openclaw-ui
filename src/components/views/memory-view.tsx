"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain, FileText, Save, RefreshCw, Loader2, ChevronRight, Edit3, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface DailyFile {
  name: string;
  path: string;
}

export function MemoryView() {
  const { toast } = useToast();
  const [mainContent, setMainContent] = useState("");
  const [mainEditing, setMainEditing] = useState(false);
  const [mainDraft, setMainDraft] = useState("");
  const [dailyFiles, setDailyFiles] = useState<DailyFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DailyFile | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileEditing, setFileEditing] = useState(false);
  const [fileDraft, setFileDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainPath, setMainPath] = useState("");

  const loadMemory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memory");
      const data = await res.json();
      setMainContent(data.main || "");
      setMainDraft(data.main || "");
      setDailyFiles(data.dailyFiles || []);
      // Store the main path for saving
      const home = "~/.openclaw/workspace/MEMORY.md";
      setMainPath(home);
    } catch {
      toast("error", "Failed to load memory");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const loadFile = async (file: DailyFile) => {
    setSelectedFile(file);
    setFileEditing(false);
    try {
      const res = await fetch(`/api/memory?file=${encodeURIComponent(file.path)}`);
      const data = await res.json();
      setFileContent(data.content || "");
      setFileDraft(data.content || "");
    } catch {
      toast("error", "Failed to load file");
    }
  };

  const saveFile = async (filePath: string, content: string, isMain: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, content }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", "Saved successfully");
        if (isMain) {
          setMainContent(content);
          setMainEditing(false);
        } else {
          setFileContent(content);
          setFileEditing(false);
        }
      } else {
        toast("error", data.error || "Failed to save");
      }
    } catch {
      toast("error", "Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Memory
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Agent memory and daily logs
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadMemory} className="gap-1.5">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Main MEMORY.md */}
      <motion.div
        layout
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-white dark:bg-gray-800/50",
          "border border-gray-200/50 dark:border-gray-700/50",
          "shadow-sm"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">MEMORY.md</h3>
                <p className="text-xs text-gray-500">Main agent memory file</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mainEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setMainEditing(false); setMainDraft(mainContent); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={saving}
                    onClick={() => saveFile(mainPath, mainDraft, true)}
                    className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMainEditing(true)}
                  className="gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {mainEditing ? (
            <textarea
              value={mainDraft}
              onChange={(e) => setMainDraft(e.target.value)}
              className={cn(
                "w-full h-64 px-3 py-2.5 rounded-xl text-sm font-mono",
                "bg-gray-50 dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-700",
                "text-gray-900 dark:text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                "resize-y"
              )}
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {mainContent || "Empty — no memory content yet"}
              </pre>
            </div>
          )}
        </div>
      </motion.div>

      {/* Daily Files */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Daily Memory Files
        </h3>
        {dailyFiles.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No daily memory files found</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {dailyFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => loadFile(file)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                  selectedFile?.path === file.path
                    ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30"
                    : "bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <FileText className={cn(
                  "w-4 h-4",
                  selectedFile?.path === file.path ? "text-orange-500" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium flex-1",
                  selectedFile?.path === file.path ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                )}>
                  {file.name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected File Content */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl overflow-hidden",
            "bg-white dark:bg-gray-800/50",
            "border border-gray-200/50 dark:border-gray-700/50",
            "shadow-sm"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{selectedFile.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                {fileEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setFileEditing(false); setFileDraft(fileContent); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={saving}
                      onClick={() => saveFile(selectedFile.path, fileDraft, false)}
                      className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setFileEditing(true)} className="gap-1.5">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {fileEditing ? (
              <textarea
                value={fileDraft}
                onChange={(e) => setFileDraft(e.target.value)}
                className={cn(
                  "w-full h-48 px-3 py-2.5 rounded-xl text-sm font-mono",
                  "bg-gray-50 dark:bg-gray-900",
                  "border border-gray-200 dark:border-gray-700",
                  "text-gray-900 dark:text-white placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                  "resize-y"
                )}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {fileContent || "Empty file"}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
