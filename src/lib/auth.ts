/**
 * Client-side auth helpers — safe to import from "use client" components.
 * Server-side functions live in auth-server.ts (never imported client-side).
 *
 * Auth sources (checked in order):
 * 1. localStorage "oc_auth_token" — set after manual login
 * 2. Cookie "oc-token" — set by bridge auto-auth (?token= in URL)
 */

const STORAGE_KEY = "oc_auth_token";
const COOKIE_KEY = "oc-token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  // Check localStorage first (manual login), then cookie (auto-auth from bridge)
  return window.localStorage.getItem(STORAGE_KEY) || getCookie(COOKIE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  // Also clear cookie
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_KEY}=; Path=/ui; Max-Age=0`;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}
