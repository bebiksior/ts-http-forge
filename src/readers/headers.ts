import type { HTTPRequestLines } from "../types";

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

export function getHeader(lines: HTTPRequestLines, name: string): string | null {
  const headers = getHeaders(lines);
  if (!headers) return null;

  const lowerName = name.toLowerCase();
  const values = headers[lowerName];

  if (!values || values.length === 0) return null;

  return values[0];
}

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

export function findHeaderInsertIndex(lines: HTTPRequestLines): number {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      return i;
    }
  }

  return lines.length;
}
