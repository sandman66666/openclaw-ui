import { NextResponse } from "next/server";
import { getAgents } from "@/lib/openclaw-api";

export async function GET() {
  const agents = getAgents();
  return NextResponse.json({ agents });
}
