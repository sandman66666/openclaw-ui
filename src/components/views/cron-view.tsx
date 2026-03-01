"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useAppStore, type CronJob } from "@/stores/app-store";

function formatSchedule(schedule: CronJob["schedule"]): string {
  if (schedule.kind === "cron") return `cron: ${schedule.expr}`;
  if (schedule.kind === "every") {
    const ms = schedule.everyMs || 0;
    if (ms >= 3600000) return `every ${Math.round(ms / 3600000)}h`;
    if (ms >= 60000) return `every ${Math.round(ms / 60000)}m`;
    return `every ${Math.round(ms / 1000)}s`;
  }
  return schedule.kind;
}

function formatTime(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === "ok";
  const isError = status === "error";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: isOk ? "rgba(52, 211, 153, 0.1)" : isError ? "rgba(239, 68, 68, 0.1)" : "var(--bg-elevated)",
        color: isOk ? "var(--accent-green)" : isError ? "#EF4444" : "var(--text-muted)",
      }}
    >
      {isOk ? <CheckCircle className="w-3 h-3" /> : isError ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {status || "unknown"}
    </span>
  );
}

function CronJobCard({ job }: { job: CronJob }) {
  const isRunning = !!job.state.runningAtMs && job.state.runningAtMs > (job.state.lastRunAtMs || 0);

  return (
    <motion.div
      layout
      className="rounded-lg overflow-hidden border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
    >
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: job.enabled ? "rgba(232, 69, 60, 0.1)" : "var(--bg-elevated)",
                color: job.enabled ? "var(--accent-primary)" : "var(--text-muted)",
              }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {job.name}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {formatSchedule(job.schedule)}
                {job.schedule.tz && ` (${job.schedule.tz})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isRunning && (
              <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "var(--accent-primary)" }} />
            )}
            <Switch checked={job.enabled} onCheckedChange={() => {}} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span style={{ color: "var(--text-muted)" }}>Last run: </span>
            <span style={{ color: "var(--text-primary)" }}>{formatTime(job.state.lastRunAtMs)}</span>
          </div>
          <StatusBadge status={job.state.lastStatus} />
          <div>
            <span style={{ color: "var(--text-muted)" }}>Duration: </span>
            <span style={{ color: "var(--text-primary)" }}>{formatDuration(job.state.lastDurationMs)}</span>
          </div>
        </div>

        {/* Next run */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span style={{ color: "var(--text-muted)" }}>Next run: </span>
            <span style={{ color: "var(--text-primary)" }}>{formatTime(job.state.nextRunAtMs)}</span>
          </div>
          {job.state.consecutiveErrors > 0 && (
            <span className="text-xs" style={{ color: "#EF4444" }}>
              {job.state.consecutiveErrors} consecutive errors
            </span>
          )}
        </div>

        {/* Message preview */}
        <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {(job.payload.message || "").slice(0, 120)}…
        </div>
      </div>
    </motion.div>
  );
}

export function CronView() {
  const { cronJobs, loading } = useAppStore();
  const enabledCount = cronJobs.filter((j) => j.enabled).length;

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Cron Jobs
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {cronJobs.length === 0
            ? loading["cron"]
              ? "Loading..."
              : "No cron jobs configured"
            : `${enabledCount} of ${cronJobs.length} jobs active`}
        </p>
      </div>

      <div className="space-y-3">
        {cronJobs.map((job) => (
          <CronJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
