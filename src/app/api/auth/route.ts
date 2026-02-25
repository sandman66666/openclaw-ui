import { NextRequest, NextResponse } from "next/server";
import {
  isPasswordConfigured,
  checkPassword,
  savePassword,
  generateToken,
} from "@/lib/auth-server";

// ---------------------------------------------------------------------------
// Rate limiter: 5 attempts per IP per 60 s
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function cors(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ---------------------------------------------------------------------------
// OPTIONS — CORS preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

// ---------------------------------------------------------------------------
// GET /api/auth — returns { configured: boolean }
// The UI calls this on mount to decide: show "set password" or "login".
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(
    { configured: isPasswordConfigured() },
    { headers: cors() }
  );
}

// ---------------------------------------------------------------------------
// POST /api/auth — { password: string }
//   • If no password set yet → saves it (first-time setup) and returns token
//   • If password set → validates and returns token
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute." },
      { status: 429, headers: cors() }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: cors() }
    );
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400, headers: cors() }
    );
  }

  const password = body.password;

  // ── First-time setup: no password configured yet ──
  if (!isPasswordConfigured()) {
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400, headers: cors() }
      );
    }
    savePassword(password);
    const token = generateToken();
    return NextResponse.json(
      { ok: true, token, setup: true },
      { headers: cors() }
    );
  }

  // ── Normal login: validate against stored password ──
  if (!checkPassword(password)) {
    return NextResponse.json(
      { error: "Wrong password" },
      { status: 401, headers: cors() }
    );
  }

  const token = generateToken();
  return NextResponse.json({ ok: true, token }, { headers: cors() });
}

// ---------------------------------------------------------------------------
// DELETE /api/auth — logout (server is stateless, client clears token)
// ---------------------------------------------------------------------------

export async function DELETE() {
  return NextResponse.json({ ok: true }, { headers: cors() });
}
