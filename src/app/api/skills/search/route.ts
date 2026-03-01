import { NextRequest, NextResponse } from "next/server";
import { searchSkills } from "@/lib/openclaw-api";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  const skills = searchSkills(query);
  return NextResponse.json({ skills });
}
