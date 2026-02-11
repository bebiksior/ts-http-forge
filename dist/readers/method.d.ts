import type { HTTPRequestLines, HttpMethod } from "../types.js";
/**
 * Extracts the HTTP method from the request line.
 * @param lines - The parsed HTTP request lines
 * @returns The HTTP method (GET, POST, etc.) or null if not found
 */
export declare function getMethod(lines: HTTPRequestLines): HttpMethod | null;
