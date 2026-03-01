import { NextRequest, NextResponse } from "next/server";
import { getAgents, getConfig } from "@/lib/openclaw-api";
import fs from "fs";
import path from "path";

const OC_DIR = path.join(process.env.HOME || "~", ".openclaw");
const CONFIG_PATH = path.join(OC_DIR, "openclaw.json");

export async function GET() {
  const agents = getAgents();
  return NextResponse.json({ agents });
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, model, systemPrompt, skills } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "id and name are required" }, { status: 400 });
    }

    // Sanitize id
    const agentId = id.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40);

    // Read current config
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

    // Check if agent already exists
    const existing = (config.agents?.list || []).find((a: any) => a.id === agentId);
    if (existing) {
      return NextResponse.json({ error: `Agent "${agentId}" already exists` }, { status: 409 });
    }

    // Create agent directory
    const agentDir = path.join(OC_DIR, "agents", agentId, "agent");
    fs.mkdirSync(agentDir, { recursive: true });

    // Write SOUL.md (system prompt)
    if (systemPrompt) {
      fs.writeFileSync(path.join(agentDir, "SOUL.md"), systemPrompt, "utf-8");
    }

    // Create workspace
    const workspace = path.join(OC_DIR, `workspace-${agentId}`);
    fs.mkdirSync(workspace, { recursive: true });

    // Build agent entry
    const agentEntry: any = {
      id: agentId,
      name,
      workspace,
      agentDir,
    };
    if (model) agentEntry.model = model;
    if (skills && skills.length > 0) agentEntry.skills = skills;

    // Add to config
    if (!config.agents) config.agents = { defaults: {}, list: [] };
    if (!config.agents.list) config.agents.list = [];
    config.agents.list.push(agentEntry);

    // Write config back
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");

    return NextResponse.json({ ok: true, agent: agentEntry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || id === "main") {
      return NextResponse.json({ error: "Cannot delete main agent" }, { status: 400 });
    }

    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

    if (!config.agents?.list) {
      return NextResponse.json({ error: "No agents configured" }, { status: 404 });
    }

    const idx = config.agents.list.findIndex((a: any) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: `Agent "${id}" not found` }, { status: 404 });
    }

    config.agents.list.splice(idx, 1);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
