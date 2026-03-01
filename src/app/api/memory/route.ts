import { NextRequest, NextResponse } from "next/server";
import {
  getMainMemory,
  writeMainMemory,
  getMemoryFiles,
  readMemoryFile,
  writeMemoryFile,
} from "@/lib/openclaw-api";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("file");

  // Single daily file request
  if (filePath) {
    const content = readMemoryFile(filePath);
    return NextResponse.json({ content });
  }

  // Full memory load: main MEMORY.md + daily file list
  const main = getMainMemory();
  const { files } = getMemoryFiles();
  const dailyFiles = files.map((f: string) => ({ name: f, path: f }));

  return NextResponse.json({ main, dailyFiles });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { filePath, content, isMain } = body;
  if (content === undefined) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  // Save main MEMORY.md or a daily file
  const result = isMain
    ? writeMainMemory(content)
    : writeMemoryFile(filePath, content);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
