import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    const escaped = message.replace(/'/g, "'\\''");
    const raw = execSync(
      `openclaw agent --agent webui --message '${escaped}' --json 2>&1`,
      {
        encoding: "utf-8",
        timeout: 120000,
        cwd: process.env.HOME || "/tmp",
        env: {
          ...process.env,
          PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`,
        },
      }
    ).trim();

    // Parse JSON output and extract text from payloads
    try {
      const data = JSON.parse(raw);
      const payloads = data?.result?.payloads || [];
      const text = payloads.map((p: any) => p.text).filter(Boolean).join("\n\n");
      return NextResponse.json({ response: text || raw });
    } catch {
      // If not valid JSON, return raw output
      return NextResponse.json({ response: raw });
    }
  } catch (e: any) {
    const stdout = e.stdout?.trim() || "";
    // Try to parse error output too
    try {
      const data = JSON.parse(stdout);
      const payloads = data?.result?.payloads || [];
      const text = payloads.map((p: any) => p.text).filter(Boolean).join("\n\n");
      if (text) return NextResponse.json({ response: text });
    } catch {}
    return NextResponse.json(
      { error: e.message, response: stdout || "Failed to get response" },
      { status: 500 }
    );
  }
}
