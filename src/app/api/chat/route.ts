import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    // Use openclaw agent command to send a message
    const escaped = message.replace(/'/g, "'\\''");
    const result = execSync(
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

    return NextResponse.json({ response: result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message, response: e.stdout || "Failed to get response" },
      { status: 500 }
    );
  }
}
