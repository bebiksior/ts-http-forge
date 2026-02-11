import type { HTTPRequestLines } from "../types.js";
/**
 * Sets the raw request body, replacing any existing body content.
 * @param lines - The HTTP request lines array
 * @param body - The new body content
 * @returns The modified lines array with the updated body
 * @throws If the request is empty or body is null/undefined
 */
export declare function setBody(lines: HTTPRequestLines, body: string): HTTPRequestLines;
