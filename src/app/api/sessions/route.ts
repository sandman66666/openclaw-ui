import { NextResponse } from "next/server";
import { getSessions } from "@/lib/openclaw-api";

export async function GET() {
  const sessions = getSessions();
  return NextResponse.json({ sessions });
}
