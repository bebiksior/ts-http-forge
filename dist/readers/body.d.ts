import type { HTTPRequestLines } from "../types.js";
/**
 * Extracts the request body content.
 * @param lines - The parsed HTTP request lines
 * @returns The body as a string or null if no body present
 */
export declare function getBody(lines: HTTPRequestLines): string | null;
/**
 * Finds the line index where the body starts (after the empty line separator).
 * @param lines - The parsed HTTP request lines
 * @returns The index of the first body line, or lines.length if no body
 */
export declare function findBodyStartIndex(lines: HTTPRequestLines): number;
