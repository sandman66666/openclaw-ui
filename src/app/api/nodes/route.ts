import { NextRequest, NextResponse } from "next/server";
import { getNodes, notifyNode } from "@/lib/openclaw-api";

export async function GET() {
  const nodes = getNodes();
  return NextResponse.json({ nodes });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nodeName, message } = body;
  if (!nodeName || !message) {
    return NextResponse.json({ error: "Missing nodeName or message" }, { status: 400 });
  }
  const result = notifyNode(nodeName, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
