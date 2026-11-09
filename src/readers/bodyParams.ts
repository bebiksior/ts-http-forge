import type { HTTPRequestLines } from "../types.js";
import { getBody } from "./body.js";
import { getHeader } from "./headers.js";
import { decodeComponent } from "../encoding.js";

/** The detected body content type. */
export type BodyType = "json" | "urlencoded" | "unknown";

/**
 * Determines the body type from Content-Type header or by inference.
 * @param lines - The parsed HTTP request lines
 * @returns The body type or null if no body present
 */
export function getBodyType(lines: HTTPRequestLines): BodyType | null {
  if (lines.length === 0) return null;

  const contentType = getHeader(lines, "content-type");

  if (contentType) {
    const lowerContentType = contentType.toLowerCase();
    if (lowerContentType.includes("application/json")) return "json";
    if (lowerContentType.includes("application/x-www-form-urlencoded"))
      return "urlencoded";
  }

  const body = getBody(lines);
  if (!body || !body.trim()) return null;

  return inferBodyType(body);
}

/**
 * Infers the body type from the body content by examining its structure.
 * @param body - The raw body string
 * @returns The inferred body type (json, urlencoded, or unknown)
 */
export function inferBodyType(body: string): BodyType {
  const trimmed = body.trim();

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON
    }
  }

  if (looksLikeUrlEncoded(trimmed)) {
    return "urlencoded";
  }

  return "unknown";
}

function looksLikeUrlEncoded(body: string): boolean {
  if (body.includes("\n") || body.includes("\r")) return false;
  if (!body.includes("=")) return false;

  const pairs = body.split("&");
  for (const pair of pairs) {
    if (!pair.includes("=")) return false;
  }

  return true;
}

/**
 * Parses body parameters from JSON or URL-encoded bodies.
 * @param lines - The parsed HTTP request lines
 * @returns An object of parameter name-value pairs or null if body cannot be parsed
 */
export function getBodyParams(
  lines: HTTPRequestLines
): Record<string, string> | null {
  if (lines.length === 0) return null;

  const body = getBody(lines);
  if (!body || !body.trim()) return null;

  const bodyType = getBodyType(lines);
  if (!bodyType || bodyType === "unknown") return null;

  if (bodyType === "json") {
    return parseJsonParams(body);
  }

  if (bodyType === "urlencoded") {
    return parseUrlencodedParams(body);
  }

  return null;
}

/**
 * Gets a specific body parameter value by name.
 * @param lines - The parsed HTTP request lines
 * @param name - The parameter name to look up
 * @returns The parameter value or null if not found
 */
export function getBodyParam(
  lines: HTTPRequestLines,
  name: string
): string | null {
  const params = getBodyParams(lines);
  if (!params) return null;

  return params[name] ?? null;
}

function parseJsonParams(body: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(body.trim());
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return null;

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        result[key] = value;
      } else if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        result[key] = String(value);
      } else {
        result[key] = JSON.stringify(value);
      }
    }
    return result;
  } catch {
    return null;
  }
}

function parseUrlencodedParams(body: string): Record<string, string> | null {
  const result: Record<string, string> = {};
  const pairs = body.trim().split("&");

  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;

    const key = decodeComponent(pair.substring(0, eqIndex));
    const value = decodeComponent(pair.substring(eqIndex + 1));
    result[key] = value;
  }

  return Object.keys(result).length > 0 ? result : null;
}
