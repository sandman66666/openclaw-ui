"use client";

import { motion } from "framer-motion";
import { Clock, Play, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        isOk && "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
        isError && "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
        !isOk && !isError && "bg-gray-100 dark:bg-gray-700 text-gray-500"
      )}
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
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50",
        "shadow-sm"
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                job.enabled
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              )}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {job.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatSchedule(job.schedule)}
                {job.schedule.tz && ` (${job.schedule.tz})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isRunning && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
            <Switch checked={job.enabled} onCheckedChange={() => {}} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-400">Last run: </span>
            <span className="text-gray-700 dark:text-gray-300">{formatTime(job.state.lastRunAtMs)}</span>
          </div>
          <StatusBadge status={job.state.lastStatus} />
          <div>
            <span className="text-gray-400">Duration: </span>
            <span className="text-gray-700 dark:text-gray-300">{formatDuration(job.state.lastDurationMs)}</span>
          </div>
        </div>

        {/* Next run */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-400">Next run: </span>
            <span className="text-gray-700 dark:text-gray-300">{formatTime(job.state.nextRunAtMs)}</span>
          </div>
          {job.state.consecutiveErrors > 0 && (
            <span className="text-red-500 text-xs">
              {job.state.consecutiveErrors} consecutive errors
            </span>
          )}
        </div>

        {/* Message preview */}
        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
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
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Cron Jobs
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
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
