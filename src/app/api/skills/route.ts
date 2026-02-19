import { NextResponse } from "next/server";
import { getSkills } from "@/lib/openclaw-api";

export async function GET() {
  const skills = getSkills();
  return NextResponse.json({ skills });
}
