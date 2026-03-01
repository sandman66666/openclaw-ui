/**
 * Server-side auth — validates against the bridge token passed via
 * OPENCLAW_BRIDGE_TOKEN env var. This is the same token Navigator uses
 * to connect, so there's one credential for everything.
 *
 * If no bridge token is set (standalone mode), auth is disabled.
 */

import crypto from "node:crypto";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const TOKEN_SECRET_SALT = "openclaw_ui_v1";

function getBridgeToken(): string | null {
  return process.env.OPENCLAW_BRIDGE_TOKEN || null;
}

// ── Auth check ────────────────────────────────────────────────────────────

export function isPasswordConfigured(): boolean {
  return !!getBridgeToken();
}

export function checkPassword(password: string): boolean {
  const bridgeToken = getBridgeToken();
  if (!bridgeToken) return true; // no token = no auth
  // Constant-time comparison
  if (password.length !== bridgeToken.length) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(bridgeToken);
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// savePassword is a no-op — the bridge token IS the password
export function savePassword(_password: string): void {
  // Token is managed by the bridge, not the UI
}

// ── Session token generation / verification ───────────────────────────────
// After validating the bridge token, we issue a short-lived session token
// so the browser doesn't need to send the bridge token on every request.

function buildTokenSecret(): string {
  const bridgeToken = getBridgeToken() ?? "none";
  return `${TOKEN_SECRET_SALT}_token_${bridgeToken}`;
}

export function generateToken(): string {
  const timestamp = Date.now().toString();
  const sig = crypto
    .createHmac("sha256", buildTokenSecret())
    .update(timestamp)
    .digest("hex");
  return Buffer.from(`${timestamp}:${sig}`).toString("base64url");
}

export function verifyToken(token: string): { valid: boolean; reason?: string } {
  // If no bridge token configured, all requests pass
  if (!getBridgeToken()) return { valid: true };

  let raw: string;
  try {
    raw = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return { valid: false, reason: "malformed" };
  }

  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) return { valid: false, reason: "malformed" };

  const timestamp = raw.slice(0, colonIdx);
  const providedSig = raw.slice(colonIdx + 1);

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return { valid: false, reason: "malformed" };
  if (Date.now() - ts > TOKEN_TTL_MS) return { valid: false, reason: "expired" };

  const expectedSig = crypto
    .createHmac("sha256", buildTokenSecret())
    .update(timestamp)
    .digest("hex");

  const a = Buffer.from(providedSig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length) return { valid: false, reason: "invalid" };

  try {
    return crypto.timingSafeEqual(a, b)
      ? { valid: true }
      : { valid: false, reason: "invalid" };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}

// ── Legacy compatibility ──────────────────────────────────────────────────
// These are kept for any code that still imports them

export function loadPasswordHash(): string | null {
  return getBridgeToken();
}
