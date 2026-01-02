import { parse } from "cookie-es";
import type { HTTPRequestLines } from "../types";
import { getHeader } from "./headers";

export function getCookies(lines: HTTPRequestLines): Record<string, string> | null {
  const cookieHeader = getHeader(lines, "Cookie");
  if (!cookieHeader) return null;

  return parse(cookieHeader);
}

export function getCookie(lines: HTTPRequestLines, name: string): string | null {
  const cookies = getCookies(lines);
  if (!cookies) return null;

  return cookies[name] ?? null;
}
