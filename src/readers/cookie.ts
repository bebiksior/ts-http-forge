import { parse } from "cookie-es";
import type { HTTPRequestLines } from "../types.js";
import { getHeader } from "./headers.js";

/**
 * Extracts all cookies from the Cookie header.
 * @param lines - The parsed HTTP request lines
 * @returns An object of cookie name-value pairs or null if no Cookie header
 */
export function getCookies(lines: HTTPRequestLines): Record<string, string> | null {
  const cookieHeader = getHeader(lines, "Cookie");
  if (!cookieHeader) return null;

  return parse(cookieHeader);
}

/**
 * Gets a specific cookie value by name.
 * @param lines - The parsed HTTP request lines
 * @param name - The cookie name to look up
 * @returns The cookie value or null if not found
 */
export function getCookie(lines: HTTPRequestLines, name: string): string | null {
  const cookies = getCookies(lines);
  if (!cookies) return null;

  return cookies[name] ?? null;
}
