import { NextResponse } from "next/server";
import { checkTools } from "@/lib/openclaw-api";

export async function GET() {
  const tools = checkTools();
  return NextResponse.json({ tools });
}
