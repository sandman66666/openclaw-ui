import { NextRequest, NextResponse } from "next/server";
import { getGatewayStatus, getConfig, restartGateway, checkGatewayUpdates } from "@/lib/openclaw-api";

export async function GET() {
  const status = getGatewayStatus();
  const config = getConfig();
  return NextResponse.json({ status, config });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "restart") {
    const result = restartGateway();
    return NextResponse.json(result);
  }

  if (action === "check-updates") {
    const result = checkGatewayUpdates();
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
