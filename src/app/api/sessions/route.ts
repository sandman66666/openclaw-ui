import { NextRequest, NextResponse } from "next/server";
import { getSessions } from "@/lib/openclaw-api";

// In-memory conversations store (persists across requests in same server process)
const conversations: Map<string, any> = new Map();

export async function GET() {
  const sessions = getSessions();
  const convList = Array.from(conversations.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
  return NextResponse.json({ sessions, conversations: convList });
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, agentId, title } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const id = sessionId || `conv_${Date.now()}`;
    const conversation = {
      id,
      agentId: agentId || "webui",
      agentName: agentId || "Primary Agent",
      title,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
    };

    conversations.set(id, conversation);

    return NextResponse.json({ ok: true, conversation });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    conversations.delete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
