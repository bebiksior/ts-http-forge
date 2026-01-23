import type { HTTPRequestLines } from "../types";
/**
 * Adds a header to the request. Does not check for duplicates.
 * @param lines - The HTTP request lines array
 * @param name - The header name
 * @param value - The header value
 * @returns The modified lines array with the added header
 * @throws If the request is empty or header name is empty
 */
export declare function addHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
/**
 * Sets a header value, updating existing or adding if not present.
 * @param lines - The HTTP request lines array
 * @param name - The header name
 * @param value - The header value
 * @returns The modified lines array with the set header
 * @throws If the request is empty or header name is empty
 */
export declare function setHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
/**
 * Removes all headers with the specified name (case-insensitive).
 * @param lines - The HTTP request lines array
 * @param name - The header name to remove
 * @returns The modified lines array with the header removed
 * @throws If the request is empty or header name is empty
 */
export declare function removeHeader(lines: HTTPRequestLines, name: string): HTTPRequestLines;
