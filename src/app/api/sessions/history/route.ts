import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = "http://localhost:18789";
const GATEWAY_PASSWORD = "Ponmje=5040";

function extractText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n")
      .trim();
  }
  return "";
}

function isSystemMessage(msg: any): boolean {
  const text = extractText(msg.content);
  return text.startsWith("[System Message]") || text.startsWith("System:");
}

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("key") || "agent:main:main";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "80");

  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GATEWAY_PASSWORD}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "sessions_history",
        args: { sessionKey, limit },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ messages: [], error: `Gateway ${res.status}` });
    }

    const data = await res.json();
    const raw = data?.result?.content?.[0]?.text;
    if (!raw) return NextResponse.json({ messages: [] });

    let history: any;
    try {
      history = JSON.parse(raw);
    } catch {
      return NextResponse.json({ messages: [] });
    }

    const rawMessages: any[] = history.messages || [];

    const messages = rawMessages
      .filter((m: any) => !isSystemMessage(m))
      .map((m: any, i: number) => ({
        id: m.id || `msg-${i}`,
        role: m.role as "user" | "assistant",
        content: extractText(m.content),
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }))
      .filter((m: any) => m.content.length > 0);

    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ messages: [], error: e.message });
  }
}
