import { NextRequest, NextResponse } from "next/server";
import { sendToSession } from "@/lib/openclaw-api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionKey, message } = body;
  if (!sessionKey || !message) {
    return NextResponse.json({ error: "Missing sessionKey or message" }, { status: 400 });
  }
  const result = sendToSession(sessionKey, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
