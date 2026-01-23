import type { HTTPRequestLines } from "../types";
/**
 * Changes the request path (without query string). Spaces are URL-encoded to %20.
 * @param lines - The HTTP request lines array
 * @param path - The new path to set (query string and fragment are preserved)
 * @returns The modified lines array with the updated path
 * @throws If the request is empty or path is null/undefined
 */
export declare function setPath(lines: HTTPRequestLines, path: string): HTTPRequestLines;
