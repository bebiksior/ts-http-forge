import type { HTTPRequestLines } from "../types.js";
/**
 * Extracts all headers from the request as a map of lowercase names to value arrays.
 * @param lines - The parsed HTTP request lines
 * @returns An object mapping header names to arrays of values, or null if no lines
 */
export declare function getHeaders(lines: HTTPRequestLines): Record<string, string[]> | null;
/**
 * Gets the first value of a specific header (case-insensitive).
 * @param lines - The parsed HTTP request lines
 * @param name - The header name to look up
 * @returns The first header value or null if not found
 */
export declare function getHeader(lines: HTTPRequestLines, name: string): string | null;
/**
 * Finds the line index of a header by name (case-insensitive).
 * @param lines - The parsed HTTP request lines
 * @param name - The header name to find
 * @returns The index of the header line or -1 if not found
 */
export declare function findHeaderIndex(lines: HTTPRequestLines, name: string): number;
/**
 * Finds the index where a new header should be inserted (before the empty line separating headers from body).
 * @param lines - The parsed HTTP request lines
 * @returns The index for inserting a new header
 */
export declare function findHeaderInsertIndex(lines: HTTPRequestLines): number;
