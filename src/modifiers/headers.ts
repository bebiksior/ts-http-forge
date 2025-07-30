import type { HTTPRequestLines } from "../types";

export function addHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Header name cannot be empty");

  return modifyAdd(lines, name, value);
}

export function setHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Header name cannot be empty");

  return modifySet(lines, name, value);
}

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

    // If we're past the headers section (hit empty line), just copy remaining lines
    if (i > 0 && line.trim() === "") {
      newLines.push(...lines.slice(i));
      break;
    }

    // For header lines, check if this is the header we want to remove
    if (i > 0) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const headerName = line.substring(0, colonIndex).trim().toLowerCase();
        if (headerName === lowerName) {
          foundAny = true;
          continue; // Skip this line (remove it)
        }
      }
    }

    newLines.push(line);
  }

  return foundAny ? newLines : lines;
}

function findHeaderIndex(lines: HTTPRequestLines, name: string): number {
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

function findHeaderInsertIndex(lines: HTTPRequestLines): number {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      return i;
    }
  }

  return lines.length;
}
