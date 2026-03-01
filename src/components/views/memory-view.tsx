"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain, FileText, Save, RefreshCw, Loader2, ChevronRight, Edit3, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
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

  const loadMemory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/memory"));
      const data = await res.json();
      setMainContent(data.main || "");
      setMainDraft(data.main || "");
      setDailyFiles(data.dailyFiles || []);
    } catch {
      toast("error", "Failed to load memory");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadMemory(); }, [loadMemory]);

  const loadFile = async (file: DailyFile) => {
    setSelectedFile(file);
    setFileEditing(false);
    try {
      const res = await fetch(apiUrl(`/api/memory?file=${encodeURIComponent(file.path)}`));
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
      const res = await fetch(apiUrl("/api/memory"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, content, isMain }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", "Saved successfully");
        if (isMain) { setMainContent(content); setMainEditing(false); }
        else { setFileContent(content); setFileEditing(false); }
      } else toast("error", data.error || "Failed to save");
    } catch {
      toast("error", "Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Memory</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Agent memory and daily logs</p>
        </div>
        <button
          onClick={loadMemory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main MEMORY.md */}
      <div className="rounded-lg overflow-hidden border" style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(232, 69, 60, 0.1)" }}>
                <Brain className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
              </div>
              <div>
                <h3 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>MEMORY.md</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Main agent memory file</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mainEditing ? (
                <>
                  <button
                    onClick={() => { setMainEditing(false); setMainDraft(mainContent); }}
                    className="px-3 py-1.5 rounded-lg text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >Cancel</button>
                  <button
                    disabled={saving}
                    onClick={() => saveFile("", mainDraft, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMainEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {mainEditing ? (
            <textarea
              value={mainDraft}
              onChange={(e) => setMainDraft(e.target.value)}
              className="w-full h-64 px-3 py-2.5 rounded-lg text-sm font-mono resize-y border focus:outline-none focus:ring-2"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
              } as React.CSSProperties}
            />
          ) : (
            <div className="rounded-lg p-4 max-h-64 overflow-y-auto" style={{ background: "var(--bg-input)" }}>
              <pre className="text-sm whitespace-pre-wrap font-mono" style={{ color: "var(--text-secondary)" }}>
                {mainContent || "Empty - no memory content yet"}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Daily Files */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Daily Memory Files</h3>
        {dailyFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No daily memory files found</p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-default)" }}>
            {dailyFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => loadFile(file)}
                className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                style={{
                  background: selectedFile?.path === file.path ? "rgba(232, 69, 60, 0.06)" : "var(--bg-card)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  if (selectedFile?.path !== file.path) e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedFile?.path === file.path ? "rgba(232, 69, 60, 0.06)" : "var(--bg-card)";
                }}
              >
                <FileText className="w-4 h-4" style={{ color: selectedFile?.path === file.path ? "var(--accent-primary)" : "var(--text-muted)" }} />
                <span className="text-sm font-medium flex-1" style={{ color: selectedFile?.path === file.path ? "var(--accent-primary)" : "var(--text-primary)" }}>
                  {file.name}
                </span>
                <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected File Content */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg overflow-hidden border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
                <h4 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{selectedFile.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                {fileEditing ? (
                  <>
                    <button onClick={() => { setFileEditing(false); setFileDraft(fileContent); }} className="px-3 py-1.5 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
                    <button
                      disabled={saving}
                      onClick={() => saveFile(selectedFile.path, fileDraft, false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                      style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFileEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {fileEditing ? (
              <textarea
                value={fileDraft}
                onChange={(e) => setFileDraft(e.target.value)}
                className="w-full h-48 px-3 py-2.5 rounded-lg text-sm font-mono resize-y border focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
                } as React.CSSProperties}
              />
            ) : (
              <div className="rounded-lg p-4 max-h-64 overflow-y-auto" style={{ background: "var(--bg-input)" }}>
                <pre className="text-sm whitespace-pre-wrap font-mono" style={{ color: "var(--text-secondary)" }}>
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
