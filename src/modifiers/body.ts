import type { HTTPRequestLines } from "../types.js";
import { findBodyStartIndex } from "../readers/body.js";

/**
 * Sets the raw request body, replacing any existing body content.
 * @param lines - The HTTP request lines array
 * @param body - The new body content
 * @returns The modified lines array with the updated body
 * @throws If the request is empty or body is null/undefined
 */
export function setBody(
  lines: HTTPRequestLines,
  body: string
): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (body === undefined || body === null)
    throw new Error("Body cannot be null or undefined");

  return modify(lines, body);
}

function modify(lines: HTTPRequestLines, body: string): HTTPRequestLines {
  const bodyStartIndex = findBodyStartIndex(lines);
  const newLines = [...lines.slice(0, bodyStartIndex)];

  if (!body.trim()) {
    const hadSeparator =
      bodyStartIndex > 0 && lines[bodyStartIndex - 1].trim() === "";
    if (hadSeparator) {
      newLines.push("");
    } else {
      newLines.push("", "");
    }
    return newLines;
  }

  const bodyLines = body.split(/\r?\n/);
  newLines.push(...bodyLines);

  return newLines;
}
