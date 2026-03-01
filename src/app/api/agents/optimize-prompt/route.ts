import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const { prompt, agentName, selectedSkills } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const skillsList = selectedSkills?.length
      ? `\nThe agent has these skills enabled: ${selectedSkills.join(", ")}.`
      : "";

    const metaPrompt = `You are an expert AI system prompt engineer. The user is creating an OpenClaw agent called "${agentName || "unnamed"}".${skillsList}

Their draft system prompt is:
---
${prompt}
---

Optimize this system prompt. Make it:
1. Clear about the agent's role and personality
2. Specific about what the agent should and shouldn't do
3. Well-structured with sections if needed
4. Aware of the agent's available skills/tools
5. Concise but comprehensive

Return ONLY the optimized system prompt text, nothing else. No explanations, no markdown code fences.`;

    const escaped = metaPrompt.replace(/'/g, "'\\''");
    const result = execSync(
      `openclaw agent --agent webui --message '${escaped}' --json 2>&1`,
      {
        encoding: "utf-8",
        timeout: 60000,
        cwd: process.env.HOME || "/tmp",
        env: {
          ...process.env,
          PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`,
        },
      }
    ).trim();

    return NextResponse.json({ optimized: result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message, optimized: null },
      { status: 500 }
    );
  }
}
