import { execSync } from "child_process";

function run(cmd: string): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      timeout: 15000,
      cwd: process.env.HOME || "/tmp",
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
  const defaults = config?.agents?.defaults || {};
  const defaultModel = defaults?.model?.primary || "unknown";
  const defaultWorkspace = defaults?.workspace || "~/.openclaw/workspace";
  const defaultHeartbeat = defaults?.heartbeat || {};

  // agents.list is the canonical array of agents
  const list: any[] = config?.agents?.list || [];

  return list.map((a: any) => ({
    id: a.id,
    name: a.name || a.id,
    model: a.model || defaultModel,
    workspace: a.workspace || defaultWorkspace,
    heartbeat: a.heartbeat || defaultHeartbeat,
    agentDir: a.agentDir || "",
    skills: a.skills || [],
  }));
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

// ── Memory file helpers ─────────────────────────────────────────────────
// OC stores memory in two places:
//   Main file:   ~/.openclaw/workspace/MEMORY.md
//   Daily files: ~/.openclaw/workspace/memory/ (2026-02-09.md, lessons.md, etc.)

const WORKSPACE_DIR = require("path").join(
  process.env.HOME || "~",
  ".openclaw",
  "workspace"
);
const MAIN_MEMORY_PATH = require("path").join(WORKSPACE_DIR, "MEMORY.md");
const DAILY_MEMORY_DIR = require("path").join(WORKSPACE_DIR, "memory");

export function getMainMemory(): string {
  const fs = require("fs");
  try {
    return fs.readFileSync(MAIN_MEMORY_PATH, "utf-8");
  } catch {
    return "";
  }
}

export function writeMainMemory(content: string): { ok: boolean; error?: string } {
  const fs = require("fs");
  try {
    fs.writeFileSync(MAIN_MEMORY_PATH, content, "utf-8");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export function getMemoryFiles(): { files: string[] } {
  const fs = require("fs");
  try {
    const files = fs.readdirSync(DAILY_MEMORY_DIR).filter((f: string) =>
      f.endsWith(".md") || f.endsWith(".json") || f.endsWith(".txt")
    );
    return { files };
  } catch {
    return { files: [] };
  }
}

export function readMemoryFile(filePath: string): string {
  const fs = require("fs");
  const path = require("path");
  const resolved = path.resolve(DAILY_MEMORY_DIR, filePath);
  // Security: prevent path traversal
  if (!resolved.startsWith(DAILY_MEMORY_DIR)) return "";
  try {
    return fs.readFileSync(resolved, "utf-8");
  } catch {
    return "";
  }
}

export function writeMemoryFile(filePath: string, content: string): { ok: boolean; error?: string } {
  const fs = require("fs");
  const path = require("path");
  const resolved = path.resolve(DAILY_MEMORY_DIR, filePath);
  if (!resolved.startsWith(DAILY_MEMORY_DIR)) return { ok: false, error: "Invalid path" };
  try {
    fs.mkdirSync(DAILY_MEMORY_DIR, { recursive: true });
    fs.writeFileSync(resolved, content, "utf-8");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ── Tools ───────────────────────────────────────────────────────────────

export function checkTools(): any[] {
  const raw = run("openclaw tools list --json 2>/dev/null || echo '[]'");
  return parseJson(raw) ?? [];
}

export function searchSkills(query: string): any[] {
  const raw = run(`openclaw skills search --json "${query}" 2>/dev/null || echo '[]'`);
  return parseJson(raw) ?? [];
}

// ── Nodes ───────────────────────────────────────────────────────────────

export function getNodes(): any[] {
  const raw = run("openclaw nodes list --json 2>/dev/null || echo '[]'");
  return parseJson(raw) ?? [];
}

export function notifyNode(nodeId: string, message: string): { ok: boolean; error?: string } {
  try {
    run(`openclaw nodes notify "${nodeId}" "${message}" 2>/dev/null`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ── Sessions ────────────────────────────────────────────────────────────

export function sendToSession(sessionKey: string, message: string): { ok: boolean; response?: string; error?: string } {
  try {
    const escaped = message.replace(/'/g, "'\\''");
    const raw = run(`openclaw agent --agent webui --message '${escaped}' --json 2>&1`);
    const parsed = parseJson(raw);
    if (parsed?.result?.payloads) {
      const text = parsed.result.payloads.map((p: any) => p.text).filter(Boolean).join("\n\n");
      return { ok: true, response: text || raw };
    }
    return { ok: true, response: raw };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ── Gateway ─────────────────────────────────────────────────────────────

export function getGatewayStatus(): any {
  const raw = run("openclaw gateway status --json 2>/dev/null || echo '{}'");
  return parseJson(raw) ?? {};
}

export function restartGateway(): { ok: boolean } {
  try {
    run("openclaw gateway restart 2>/dev/null");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function checkGatewayUpdates(): { available: boolean; version?: string } {
  try {
    const raw = run("openclaw gateway check-update --json 2>/dev/null || echo '{}'");
    const data = parseJson(raw);
    return { available: !!data?.updateAvailable, version: data?.latestVersion };
  } catch {
    return { available: false };
  }
}

// ── Cron ─────────────────────────────────────────────────────────────────

export function runCronJob(jobId: string): { ok: boolean; output?: string; error?: string } {
  try {
    const raw = run(`openclaw cron run "${jobId}" 2>&1`);
    return { ok: true, output: raw };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
