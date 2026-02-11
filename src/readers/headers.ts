import type { HTTPRequestLines } from "../types.js";

/**
 * Extracts all headers from the request as a map of lowercase names to value arrays.
 * @param lines - The parsed HTTP request lines
 * @returns An object mapping header names to arrays of values, or null if no lines
 */
export function getHeaders(lines: HTTPRequestLines): Record<string, string[]> | null {
  if (lines.length === 0) return null;

  const headers: Record<string, string[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      break;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const headerName = line.substring(0, colonIndex).trim();
    const headerValue = line.substring(colonIndex + 1).trim();

    const lowerName = headerName.toLowerCase();
    if (!headers[lowerName]) {
      headers[lowerName] = [];
    }
    headers[lowerName].push(headerValue);
  }

  return headers;
}

/**
 * Gets the first value of a specific header (case-insensitive).
 * @param lines - The parsed HTTP request lines
 * @param name - The header name to look up
 * @returns The first header value or null if not found
 */
export function getHeader(lines: HTTPRequestLines, name: string): string | null {
  const headers = getHeaders(lines);
  if (!headers) return null;

  const lowerName = name.toLowerCase();
  const values = headers[lowerName];

  if (!values || values.length === 0) return null;

  return values[0];
}

/**
 * Finds the line index of a header by name (case-insensitive).
 * @param lines - The parsed HTTP request lines
 * @param name - The header name to find
 * @returns The index of the header line or -1 if not found
 */
export function findHeaderIndex(lines: HTTPRequestLines, name: string): number {
  const lowerName = name.toLowerCase();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      break;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const headerName = line.substring(0, colonIndex).trim().toLowerCase();
    if (headerName === lowerName) {
      return i;
    }
  }

  return -1;
}

/**
 * Finds the index where a new header should be inserted (before the empty line separating headers from body).
 * @param lines - The parsed HTTP request lines
 * @returns The index for inserting a new header
 */
export function findHeaderInsertIndex(lines: HTTPRequestLines): number {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      return i;
    }
  }

  return lines.length;
}
