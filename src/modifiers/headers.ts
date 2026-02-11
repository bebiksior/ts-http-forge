import type { HTTPRequestLines } from "../types.js";
import { findHeaderIndex, findHeaderInsertIndex } from "../readers/headers.js";

/**
 * Adds a header to the request. Does not check for duplicates.
 * @param lines - The HTTP request lines array
 * @param name - The header name
 * @param value - The header value
 * @returns The modified lines array with the added header
 * @throws If the request is empty or header name is empty
 */
export function addHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Header name cannot be empty");

  return modifyAdd(lines, name, value);
}

/**
 * Sets a header value, updating existing or adding if not present.
 * @param lines - The HTTP request lines array
 * @param name - The header name
 * @param value - The header value
 * @returns The modified lines array with the set header
 * @throws If the request is empty or header name is empty
 */
export function setHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Header name cannot be empty");

  return modifySet(lines, name, value);
}

/**
 * Removes all headers with the specified name (case-insensitive).
 * @param lines - The HTTP request lines array
 * @param name - The header name to remove
 * @returns The modified lines array with the header removed
 * @throws If the request is empty or header name is empty
 */
export function removeHeader(lines: HTTPRequestLines, name: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Header name cannot be empty");

  return modifyRemove(lines, name);
}

function modifyAdd(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  const headerLine = `${name}: ${value}`;
  const insertIndex = findHeaderInsertIndex(lines);

  const newLines = [...lines];
  newLines.splice(insertIndex, 0, headerLine);

  return newLines;
}

function modifySet(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  const existingIndex = findHeaderIndex(lines, name);

  if (existingIndex !== -1) {
    const newLines = [...lines];
    newLines[existingIndex] = `${name}: ${value}`;
    return newLines;
  }

  return modifyAdd(lines, name, value);
}

function modifyRemove(lines: HTTPRequestLines, name: string): HTTPRequestLines {
  const lowerName = name.toLowerCase();
  const newLines: string[] = [];
  let foundAny = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i > 0 && line.trim() === "") {
      newLines.push(...lines.slice(i));
      break;
    }

    if (i > 0) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const headerName = line.substring(0, colonIndex).trim().toLowerCase();
        if (headerName === lowerName) {
          foundAny = true;
          continue;
        }
      }
    }

    newLines.push(line);
  }

  return foundAny ? newLines : lines;
}
