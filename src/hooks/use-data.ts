"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";

export function useDataLoader() {
  const { setSkills, setChannels, setCronJobs, setAgents, setConnected, setLoading } =
    useAppStore();

  const loadSkills = useCallback(async () => {
    setLoading("skills", true);
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (data.skills) {
        setSkills(
          data.skills.map((s: any) => ({
            id: s.name,
            name: s.name,
            description: s.description || "",
            icon: s.emoji || "🔧",
            enabled: s.eligible && !s.disabled,
            eligible: s.eligible,
            source: s.source || "unknown",
            missing: s.missing,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load skills:", e);
    }
    setLoading("skills", false);
  }, [setSkills, setLoading]);

  const loadChannels = useCallback(async () => {
    setLoading("channels", true);
    try {
      const res = await fetch("/api/channels");
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels);
        setConnected(true);
      }
    } catch (e) {
      console.error("Failed to load channels:", e);
    }
    setLoading("channels", false);
  }, [setChannels, setConnected, setLoading]);

  const loadCronJobs = useCallback(async () => {
    setLoading("cron", true);
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      if (data.jobs) {
        setCronJobs(data.jobs);
      }
    } catch (e) {
      console.error("Failed to load cron jobs:", e);
    }
    setLoading("cron", false);
  }, [setCronJobs, setLoading]);

  const loadAgents = useCallback(async () => {
    setLoading("agents", true);
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents) {
        setAgents(data.agents);
      }
    } catch (e) {
      console.error("Failed to load agents:", e);
    }
    setLoading("agents", false);
  }, [setAgents, setLoading]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadSkills(), loadChannels(), loadCronJobs(), loadAgents()]);
  }, [loadSkills, loadChannels, loadCronJobs, loadAgents]);

  useEffect(() => {
    loadAll();
    // Refresh every 30s
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  return { loadSkills, loadChannels, loadCronJobs, loadAgents, loadAll };
}
