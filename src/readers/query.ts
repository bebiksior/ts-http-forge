import type { HTTPRequestLines } from "../types";

export function getQuery(lines: HTTPRequestLines): string | null {
  if (lines.length === 0) return null;

  const requestLine = lines[0];
  const questionMarkIndex = requestLine.indexOf("?");

  if (questionMarkIndex === -1) return null;

  const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
  const queryEnd = spaceAfterQuery === -1 ? requestLine.length : spaceAfterQuery;

  return requestLine.substring(questionMarkIndex + 1, queryEnd);
}

export function getQueryParams(lines: HTTPRequestLines): Record<string, string> | null {
  const query = getQuery(lines);
  if (query === null) return null;

  const params: Record<string, string> = {};

  if (query === "") return params;

  const pairs = query.split("&");

  for (const pair of pairs) {
    if (!pair) continue;
    const [key, ...rest] = pair.split("=");
    const value = rest.join("=");
    params[key] = value ? decodeURIComponent(value) : "";
  }

  return params;
}
