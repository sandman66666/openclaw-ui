import { NextResponse } from "next/server";
import { getCronJobs } from "@/lib/openclaw-api";

export async function GET() {
  const jobs = getCronJobs();
  return NextResponse.json({ jobs });
}
