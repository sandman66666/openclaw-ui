import { NextRequest, NextResponse } from "next/server";
import { isPasswordConfigured, verifyToken } from "@/lib/auth-server";

/**
 * Protect /api/* routes (except /api/auth) with Bearer token auth.
 * Page routes are public — the SPA shows a login gate client-side.
 *
 * If no password has been set yet, all API routes pass through
 * (the UI will prompt the user to create a password first).
 */
export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Auth endpoint is always open
  if (pathname === "/api/auth") {
    return NextResponse.next();
  }

  // Only guard /api/* routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // If no password configured yet, let everything through
  // (the user hasn't done first-time setup)
  if (!isPasswordConfigured()) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
  }

  const result = verifyToken(token);
  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
