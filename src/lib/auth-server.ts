/**
 * Server-side auth — password stored as HMAC hash in ~/.openclaw/ui-auth.json.
 * Only imported from API routes and proxy.ts (never from client components).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const AUTH_FILE_NAME = "ui-auth.json";
const SALT = "openclaw_ui_v1";
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function authFilePath(): string {
  return path.join(os.homedir(), ".openclaw", AUTH_FILE_NAME);
}

function ensureDir(): void {
  fs.mkdirSync(path.join(os.homedir(), ".openclaw"), { recursive: true });
}

function hashPassword(pw: string): string {
  return crypto.createHmac("sha256", SALT).update(pw).digest("hex");
}

// ── Password storage ──────────────────────────────────────────────────────

export function loadPasswordHash(): string | null {
  try {
    const raw = fs.readFileSync(authFilePath(), "utf8");
    const data = JSON.parse(raw);
    return typeof data.hash === "string" ? data.hash : null;
  } catch {
    return null;
  }
}

export function isPasswordConfigured(): boolean {
  return loadPasswordHash() !== null;
}

export function savePassword(password: string): void {
  ensureDir();
  const data = { hash: hashPassword(password), updatedAt: Date.now() };
  fs.writeFileSync(authFilePath(), JSON.stringify(data, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function checkPassword(password: string): boolean {
  const stored = loadPasswordHash();
  if (!stored) return false;
  const provided = hashPassword(password);
  const a = Buffer.from(stored, "hex");
  const b = Buffer.from(provided, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── Token generation / verification ──────────────────────────────────────

function buildTokenSecret(): string {
  const hash = loadPasswordHash() ?? "none";
  return `${SALT}_token_${hash}`;
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
