import type { HTTPRequestLines } from "../types.js";
/**
 * Extracts the request path from the request line, excluding query string and fragment.
 * @param lines - The parsed HTTP request lines
 * @returns The path portion of the URL or null if not found
 */
export declare function getPath(lines: HTTPRequestLines): string | null;
