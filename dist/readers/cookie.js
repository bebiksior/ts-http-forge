import { parse } from "cookie-es";
import { getHeader } from "./headers.js";
/**
 * Extracts all cookies from the Cookie header.
 * @param lines - The parsed HTTP request lines
 * @returns An object of cookie name-value pairs or null if no Cookie header
 */
export function getCookies(lines) {
    const cookieHeader = getHeader(lines, "Cookie");
    if (!cookieHeader)
        return null;
    return parse(cookieHeader);
}
/**
 * Gets a specific cookie value by name.
 * @param lines - The parsed HTTP request lines
 * @param name - The cookie name to look up
 * @returns The cookie value or null if not found
 */
export function getCookie(lines, name) {
    const cookies = getCookies(lines);
    if (!cookies)
        return null;
    return cookies[name] ?? null;
}
