import { NextResponse } from "next/server";

const MERLIN_TOKEN = "ccw_live_zJSXOAa4p4xPI3ZRKyUo8rG2pDpiCOP0";

export async function GET() {
  const endpoints = [
    "https://api.merlin.build/v1/behaviors",
    "https://api.merlin.build/v1/skills",
    "https://api.merlin.build/v1/workflows",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${MERLIN_TOKEN}` },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : data.behaviors ?? data.skills ?? data.workflows ?? data.items ?? [];
        if (items.length > 0) {
          return NextResponse.json({ skills: items, source: url });
        }
      }
    } catch {}
  }

  return NextResponse.json({ skills: [], source: null });
}
