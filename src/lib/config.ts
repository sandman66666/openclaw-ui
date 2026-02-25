/**
 * App configuration constants.
 * BASE_PATH must match the basePath in next.config.ts.
 */
export const BASE_PATH = "/ui";

/** Prepend the base path to an API route path. */
export function apiUrl(path: string): string {
  return `${BASE_PATH}${path}`;
}
