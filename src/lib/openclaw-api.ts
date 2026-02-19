import { execSync } from "child_process";

function run(cmd: string): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      timeout: 15000,
      env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
    }).trim();
  } catch (e: any) {
    console.error(`[openclaw-api] command failed: ${cmd}`, e.message);
    return "";
  }
}

function parseJson(raw: string): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getSkills() {
  const raw = run("openclaw skills list --json");
  const data = parseJson(raw);
  return data?.skills ?? [];
}

export function getCronJobs() {
  const raw = run("openclaw cron list --json");
  const data = parseJson(raw);
  return data?.jobs ?? [];
}

export function getConfig() {
  const fs = require("fs");
  const path = require("path");
  const configPath = path.join(
    process.env.HOME || "~",
    ".openclaw",
    "openclaw.json"
  );
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    // openclaw.json might be json5, try stripping comments
    const cleaned = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

export function getAgents() {
  const config = getConfig();
  const agents: any[] = [];
  
  // Main agent is always present
  const mainAgent = {
    id: "main",
    model: config?.agents?.defaults?.model?.primary || "unknown",
    workspace: config?.agents?.defaults?.workspace || "~/.openclaw/workspace",
    heartbeat: config?.agents?.defaults?.heartbeat || {},
  };
  agents.push(mainAgent);

  // Check for additional agents
  if (config?.agents) {
    for (const [key, value] of Object.entries(config.agents)) {
      if (key !== "defaults" && typeof value === "object") {
        agents.push({ id: key, ...(value as any) });
      }
    }
  }

  return agents;
}

export function getChannels() {
  const config = getConfig();
  const channels: any[] = [];

  const channelConfig = config?.channels || {};
  
  if (channelConfig.whatsapp) {
    channels.push({
      id: "whatsapp",
      name: "WhatsApp",
      icon: "📱",
      connected: true, // If config exists, it's set up
      config: {
        dmPolicy: channelConfig.whatsapp.dmPolicy,
        allowFrom: channelConfig.whatsapp.allowFrom,
        groupPolicy: channelConfig.whatsapp.groupPolicy,
        selfChatMode: channelConfig.whatsapp.selfChatMode,
        groups: Object.keys(channelConfig.whatsapp.groups || {}),
      },
    });
  }

  if (channelConfig.telegram) {
    channels.push({
      id: "telegram",
      name: "Telegram",
      icon: "✈️",
      connected: !!channelConfig.telegram.botToken,
      config: {
        dmPolicy: channelConfig.telegram.dmPolicy,
        allowFrom: channelConfig.telegram.allowFrom,
        groupPolicy: channelConfig.telegram.groupPolicy,
        streamMode: channelConfig.telegram.streamMode,
      },
    });
  }

  if (channelConfig.discord) {
    channels.push({
      id: "discord",
      name: "Discord",
      icon: "🎮",
      connected: !!channelConfig.discord.botToken,
      config: {
        dmPolicy: channelConfig.discord.dmPolicy,
      },
    });
  }

  // Add webchat as always available
  channels.push({
    id: "webchat",
    name: "Web Chat",
    icon: "💬",
    connected: true,
    config: {},
  });

  return channels;
}

export function getSessions() {
  const raw = run("openclaw sessions list --json 2>/dev/null || echo '[]'");
  return parseJson(raw) ?? [];
}
