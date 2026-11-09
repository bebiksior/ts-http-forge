import type { HTTPRequestLines, HttpMethod } from "../types.js";
import { getBody, findBodyStartIndex } from "../readers/body.js";
import { getBodyType, inferBodyType, BodyType } from "../readers/bodyParams.js";
import { getMethod } from "../readers/method.js";
import { findHeaderIndex, findHeaderInsertIndex } from "../readers/headers.js";

/**
 * Options for setBodyParam function.
 */
export interface SetBodyParamOptions {
  /** Body format to use when creating a new body (default: "json") */
  defaultBodyType?: "json" | "urlencoded";
  /** Method to switch to if current method is GET/HEAD (default: "POST") */
  defaultMethod?: HttpMethod;
}

/**
 * Sets a body parameter, auto-detecting JSON or urlencoded format.
 * Creates body and Content-Type header if needed. Switches GET/HEAD to POST.
 * @param lines - The HTTP request lines array
 * @param name - The parameter name
 * @param value - The parameter value
 * @param options - Optional settings for default body type and method
 * @returns The modified lines array with the set parameter
 * @throws If the request is empty or parameter name is empty
 */
export function setBodyParam(
  lines: HTTPRequestLines,
  name: string,
  value: string,
  options: SetBodyParamOptions = {}
): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Parameter name cannot be empty");

  const { defaultBodyType = "json", defaultMethod = "POST" } = options;

  return modifySet(lines, name, value, defaultBodyType, defaultMethod);
}

/**
 * Removes a body parameter from JSON or urlencoded body.
 * @param lines - The HTTP request lines array
 * @param name - The parameter name to remove
 * @returns The modified lines array with the parameter removed
 * @throws If the request is empty or parameter name is empty
 */
export function removeBodyParam(
  lines: HTTPRequestLines,
  name: string
): HTTPRequestLines {
  if (lines.length === 0) throw new Error("Request cannot be empty");
  if (!name.trim()) throw new Error("Parameter name cannot be empty");

  return modifyRemove(lines, name);
}

function modifySet(
  lines: HTTPRequestLines,
  name: string,
  value: string,
  defaultBodyType: "json" | "urlencoded",
  defaultMethod: HttpMethod
): HTTPRequestLines {
  let currentLines = [...lines];

  const method = getMethod(currentLines);
  if (method === "GET" || method === "HEAD") {
    currentLines = changeMethod(currentLines, defaultMethod);
  }

  const body = getBody(currentLines);
  let bodyType = getBodyType(currentLines);

  if (!body || !body.trim()) {
    bodyType = defaultBodyType;
    currentLines = ensureContentTypeHeader(currentLines, bodyType);
    const newBody = createBodyWithParam(bodyType, name, value);
    return replaceBody(currentLines, newBody);
  }

  if (!bodyType || bodyType === "unknown") {
    bodyType = inferBodyType(body);
    if (bodyType === "unknown") {
      bodyType = defaultBodyType;
    }
  }

  currentLines = ensureContentTypeHeader(currentLines, bodyType);

  const newBody = setParamInBody(body, bodyType, name, value);
  return replaceBody(currentLines, newBody);
}

function modifyRemove(lines: HTTPRequestLines, name: string): HTTPRequestLines {
  const body = getBody(lines);
  if (!body || !body.trim()) return lines;

  let bodyType = getBodyType(lines);
  if (!bodyType || bodyType === "unknown") {
    bodyType = inferBodyType(body);
    if (bodyType === "unknown") return lines;
  }

  const newBody = removeParamFromBody(body, bodyType, name);
  if (newBody === body) return lines;

  return replaceBody(lines, newBody);
}

function changeMethod(
  lines: HTTPRequestLines,
  method: HttpMethod
): HTTPRequestLines {
  const requestLine = lines[0];
  let i = 0;
  while (i < requestLine.length && requestLine[i] !== " ") {
    i++;
  }

  if (i === requestLine.length) {
    return [method, ...lines.slice(1)];
  }

  return [method + requestLine.substring(i), ...lines.slice(1)];
}

function ensureContentTypeHeader(
  lines: HTTPRequestLines,
  bodyType: BodyType
): HTTPRequestLines {
  if (bodyType === "unknown") return lines;

  const existingIndex = findHeaderIndex(lines, "content-type");
  if (existingIndex !== -1) return lines;

  const contentTypeValue =
    bodyType === "json"
      ? "application/json"
      : "application/x-www-form-urlencoded";

  const headerLine = `Content-Type: ${contentTypeValue}`;
  const insertIndex = findHeaderInsertIndex(lines);

  const newLines = [...lines];
  newLines.splice(insertIndex, 0, headerLine);

  return newLines;
}

function createBodyWithParam(
  bodyType: BodyType,
  name: string,
  value: string
): string {
  if (bodyType === "json") {
    return JSON.stringify({ [name]: value });
  }
  return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
}

function setParamInBody(
  body: string,
  bodyType: BodyType,
  name: string,
  value: string
): string {
  if (bodyType === "json") {
    return setJsonParam(body, name, value);
  }
  if (bodyType === "urlencoded") {
    return setUrlencodedParam(body, name, value);
  }
  return body;
}

function removeParamFromBody(
  body: string,
  bodyType: BodyType,
  name: string
): string {
  if (bodyType === "json") {
    return removeJsonParam(body, name);
  }
  if (bodyType === "urlencoded") {
    return removeUrlencodedParam(body, name);
  }
  return body;
}

function setJsonParam(body: string, name: string, value: string): string {
  try {
    const parsed = JSON.parse(body.trim());
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return body;

    parsed[name] = value;
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

function removeJsonParam(body: string, name: string): string {
  try {
    const parsed = JSON.parse(body.trim());
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return body;

    if (!(name in parsed)) return body;

    delete parsed[name];
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

function setUrlencodedParam(body: string, name: string, value: string): string {
  const pairs = body.trim().split("&").filter(Boolean);
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const newPair = `${encodedName}=${encodedValue}`;

  let found = false;
  const result: string[] = [];

  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) {
      result.push(pair);
      continue;
    }

    const key = pair.substring(0, eqIndex);
    if (decodeURIComponent(key) === name) {
      if (!found) {
        result.push(newPair);
        found = true;
      }
    } else {
      result.push(pair);
    }
  }

  if (!found) {
    result.push(newPair);
  }

  return result.join("&");
}

function removeUrlencodedParam(body: string, name: string): string {
  const pairs = body.trim().split("&").filter(Boolean);
  const result: string[] = [];

  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) {
      result.push(pair);
      continue;
    }

    const key = pair.substring(0, eqIndex);
    if (decodeURIComponent(key) !== name) {
      result.push(pair);
    }
  }

  return result.join("&");
}

function replaceBody(lines: HTTPRequestLines, body: string): HTTPRequestLines {
  const bodyStartIndex = findBodyStartIndex(lines);
  const newLines = [...lines.slice(0, bodyStartIndex)];

  if (!body.trim()) {
    const hadSeparator =
      bodyStartIndex > 0 && lines[bodyStartIndex - 1]?.trim() === "";
    if (hadSeparator) {
      newLines.push("");
    } else {
      newLines.push("", "");
    }
    return newLines;
  }

  const hasEmptySeparator =
    bodyStartIndex > 0 && lines[bodyStartIndex - 1]?.trim() === "";
  if (!hasEmptySeparator && bodyStartIndex === lines.length) {
    newLines.push("");
  }

  newLines.push(body);

  return newLines;
}
