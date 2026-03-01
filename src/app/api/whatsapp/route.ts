import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getConfig() {
  const configPath = path.join(process.env.HOME || "~", ".openclaw", "openclaw.json");
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const cleaned = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

function writeConfig(config: any) {
  const configPath = path.join(process.env.HOME || "~", ".openclaw", "openclaw.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET() {
  try {
    const config = getConfig();
    const wa = config?.channels?.whatsapp || {};
    return NextResponse.json({
      contacts: wa.allowFrom || [],
      groups: Object.entries(wa.groups || {}).map(([jid, cfg]: [string, any]) => ({
        jid,
        requireMention: cfg?.requireMention ?? true,
        actionMode: cfg?.actionMode || "participate",
        customInstructions: cfg?.customInstructions || "",
      })),
      dmPolicy: wa.dmPolicy || "allowFrom",
      selfChatMode: wa.selfChatMode || false,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getConfig();
    if (!config.channels) config.channels = {};
    if (!config.channels.whatsapp) config.channels.whatsapp = {};

    const wa = config.channels.whatsapp;

    if (body.contacts !== undefined) wa.allowFrom = body.contacts;
    if (body.groups !== undefined) {
      wa.groups = {};
      for (const g of body.groups) {
        wa.groups[g.jid] = {
          requireMention: g.requireMention ?? true,
          actionMode: g.actionMode || "participate",
          customInstructions: g.customInstructions || "",
        };
      }
    }
    if (body.dmPolicy !== undefined) wa.dmPolicy = body.dmPolicy;
    if (body.selfChatMode !== undefined) wa.selfChatMode = body.selfChatMode;

    writeConfig(config);

    // Restart gateway with delay
    try {
      execSync("openclaw gateway restart --delay 1000 2>/dev/null", {
        encoding: "utf-8",
        timeout: 10000,
        env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
      });
    } catch {
      // gateway restart is best-effort
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
