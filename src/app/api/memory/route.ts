import { NextRequest, NextResponse } from "next/server";
import { getMemoryFiles, readMemoryFile, writeMemoryFile } from "@/lib/openclaw-api";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("file");

  if (filePath) {
    const content = readMemoryFile(filePath);
    return NextResponse.json({ content });
  }

  const data = getMemoryFiles();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { filePath, content } = body;
  if (!filePath || content === undefined) {
    return NextResponse.json({ error: "Missing filePath or content" }, { status: 400 });
  }
  const result = writeMemoryFile(filePath, content);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
