import { parse, serialize } from "cookie-es";
import type { HTTPRequestLines } from "../types";

function enc(data: string){
  if (data.slice(-1)===";"){ return data.slice(0, -1).replaceAll(";", "%3b")}
  return data.replaceAll(";","%3b")
}

export function addCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Cookie name cannot be empty");

  return modifyAdd(lines, name, value);
}

export function setCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Cookie name cannot be empty");

  return modifySet(lines, name, value);
}

export function removeCookie(lines: HTTPRequestLines, name: string): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Cookie name cannot be empty");

  return modifyRemove(lines, name);
}

function modifyAdd(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  const cookieHeaderIndex = findCookieHeaderIndex(lines);

  if (cookieHeaderIndex === -1) {
    const newCookieValue = serialize(name, value, {enc});
    const insertIndex = findHeaderInsertIndex(lines);
    const newLines = [...lines];
    newLines.splice(insertIndex, 0, `Cookie: ${newCookieValue}`);
    return newLines;
  }

  const existingCookieLine = lines[cookieHeaderIndex];
  const colonIndex = existingCookieLine.indexOf(":");
  const existingCookieValue = existingCookieLine.substring(colonIndex + 1).trim();

  const cookies = parse(existingCookieValue);
  cookies[name] = value;

  const newCookieValue = Object.entries(cookies)
    .map(([k, v]) => serialize(k, v, {enc}))
    .join("; ");

  const newLines = [...lines];
  newLines[cookieHeaderIndex] = `Cookie: ${newCookieValue}`;

  return newLines;
}

function modifySet(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines {
  return modifyAdd(lines, name, value);
}

function modifyRemove(lines: HTTPRequestLines, name: string): HTTPRequestLines {
  const cookieHeaderIndex = findCookieHeaderIndex(lines);

  if (cookieHeaderIndex === -1) {
    return lines;
  }

  const existingCookieLine = lines[cookieHeaderIndex];
  const colonIndex = existingCookieLine.indexOf(":");
  const existingCookieValue = existingCookieLine.substring(colonIndex + 1).trim();

  const cookies = parse(existingCookieValue);

  if (!(name in cookies)) {
    return lines;
  }

  delete cookies[name];

  const remainingCookies = Object.entries(cookies);

  const newLines = [...lines];

  if (remainingCookies.length === 0) {
    newLines.splice(cookieHeaderIndex, 1);
  } else {
    const newCookieValue = remainingCookies
      .map(([k, v]) => serialize(k, v, {enc}))
      .join("; ");
    newLines[cookieHeaderIndex] = `Cookie: ${newCookieValue}`;
  }

  return newLines;
}

function findCookieHeaderIndex(lines: HTTPRequestLines): number {
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      break;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const headerName = line.substring(0, colonIndex).trim().toLowerCase();
    if (headerName === "cookie") {
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
