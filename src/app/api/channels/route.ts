import { NextResponse } from "next/server";
import { getChannels } from "@/lib/openclaw-api";

export async function GET() {
  const channels = getChannels();
  return NextResponse.json({ channels });
}
