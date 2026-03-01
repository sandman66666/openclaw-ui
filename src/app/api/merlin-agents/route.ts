import { NextResponse } from "next/server";

const MERLIN_API = "https://api.merlin.build/v1/agents";
const MERLIN_TOKEN = "ccw_live_zJSXOAa4p4xPI3ZRKyUo8rG2pDpiCOP0";

export async function GET() {
  try {
    const res = await fetch(MERLIN_API, {
      headers: { Authorization: `Bearer ${MERLIN_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ agents: [] });
    }

    const data = await res.json();
    const agents = Array.isArray(data) ? data : data.agents || [];
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
