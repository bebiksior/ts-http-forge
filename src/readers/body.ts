import type { HTTPRequestLines } from "../types.js";

/**
 * Extracts the request body content.
 * @param lines - The parsed HTTP request lines
 * @returns The body as a string or null if no body present
 */
export function getBody(lines: HTTPRequestLines): string | null {
  if (lines.length === 0) return null;

  const bodyStartIndex = findBodyStartIndex(lines);
  
  if (bodyStartIndex >= lines.length) return null;

  const bodyLines = lines.slice(bodyStartIndex);
  
  if (bodyLines.length === 0) return null;
  if (bodyLines.length === 1 && bodyLines[0] === "") return null;

  return bodyLines.join("\n");
}

/**
 * Finds the line index where the body starts (after the empty line separator).
 * @param lines - The parsed HTTP request lines
 * @returns The index of the first body line, or lines.length if no body
 */
export function findBodyStartIndex(lines: HTTPRequestLines): number {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      return i + 1;
    }
  }

  return lines.length;
}
