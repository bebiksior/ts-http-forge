import type { HTTPRequestLines } from "../types";
/**
 * Extracts all cookies from the Cookie header.
 * @param lines - The parsed HTTP request lines
 * @returns An object of cookie name-value pairs or null if no Cookie header
 */
export declare function getCookies(lines: HTTPRequestLines): Record<string, string> | null;
/**
 * Gets a specific cookie value by name.
 * @param lines - The parsed HTTP request lines
 * @param name - The cookie name to look up
 * @returns The cookie value or null if not found
 */
export declare function getCookie(lines: HTTPRequestLines, name: string): string | null;
