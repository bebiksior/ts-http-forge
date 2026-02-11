import type { HTTPRequestLines } from "../types.js";

/**
 * Extracts the request path from the request line, excluding query string and fragment.
 * @param lines - The parsed HTTP request lines
 * @returns The path portion of the URL or null if not found
 */
export function getPath(lines: HTTPRequestLines): string | null {
  if (lines.length === 0) return null;

  const requestLine = lines[0];

  let methodEnd = 0;
  while (methodEnd < requestLine.length && requestLine[methodEnd] !== " ") {
    methodEnd++;
  }

  if (methodEnd === requestLine.length) return null;

  let pathStart = methodEnd;
  while (pathStart < requestLine.length && requestLine[pathStart] === " ") {
    pathStart++;
  }

  if (pathStart === requestLine.length) return null;

  let pathEnd = pathStart;
  while (pathEnd < requestLine.length && requestLine[pathEnd] !== " ") {
    pathEnd++;
  }

  const pathAndQuery = requestLine.substring(pathStart, pathEnd);

  const questionMarkIndex = pathAndQuery.indexOf("?");
  const hashIndex = pathAndQuery.indexOf("#");

  if (questionMarkIndex !== -1 && hashIndex !== -1) {
    return pathAndQuery.substring(0, Math.min(questionMarkIndex, hashIndex));
  } else if (questionMarkIndex !== -1) {
    return pathAndQuery.substring(0, questionMarkIndex);
  } else if (hashIndex !== -1) {
    return pathAndQuery.substring(0, hashIndex);
  }

  return pathAndQuery;
}
