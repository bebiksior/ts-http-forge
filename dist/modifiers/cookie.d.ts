import type { HTTPRequestLines } from "../types.js";
/**
 * Adds a cookie to the Cookie header, creating the header if needed.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name
 * @param value - The cookie value
 * @returns The modified lines array with the added cookie
 * @throws If the request is empty or cookie name is empty
 */
export declare function addCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
/**
 * Sets a cookie value, updating existing or adding if not present.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name
 * @param value - The cookie value
 * @returns The modified lines array with the set cookie
 * @throws If the request is empty or cookie name is empty
 */
export declare function setCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
/**
 * Removes a cookie from the Cookie header. Removes the header if no cookies remain.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name to remove
 * @returns The modified lines array with the cookie removed
 * @throws If the request is empty or cookie name is empty
 */
export declare function removeCookie(lines: HTTPRequestLines, name: string): HTTPRequestLines;
