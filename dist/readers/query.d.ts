import type { HTTPRequestLines } from "../types.js";
/**
 * Extracts the raw query string from the request line.
 * @param lines - The parsed HTTP request lines
 * @returns The query string (without leading ?) or null if no query present
 */
export declare function getQuery(lines: HTTPRequestLines): string | null;
/**
 * Parses the query string into key-value pairs.
 * @param lines - The parsed HTTP request lines
 * @returns An object of decoded query parameters or null if no query present
 */
export declare function getQueryParams(lines: HTTPRequestLines): Record<string, string> | null;
