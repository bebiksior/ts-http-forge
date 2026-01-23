import { parse, serialize } from "cookie-es";
import { findHeaderIndex, findHeaderInsertIndex } from "../readers/headers";
function enc(data) {
    if (data.slice(-1) === ";") {
        data = data.slice(0, -1);
    }
    return data.replaceAll(";", "%3b");
}
/**
 * Adds a cookie to the Cookie header, creating the header if needed.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name
 * @param value - The cookie value
 * @returns The modified lines array with the added cookie
 * @throws If the request is empty or cookie name is empty
 */
export function addCookie(lines, name, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Cookie name cannot be empty");
    return modifyAdd(lines, name, value);
}
/**
 * Sets a cookie value, updating existing or adding if not present.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name
 * @param value - The cookie value
 * @returns The modified lines array with the set cookie
 * @throws If the request is empty or cookie name is empty
 */
export function setCookie(lines, name, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Cookie name cannot be empty");
    return modifySet(lines, name, value);
}
/**
 * Removes a cookie from the Cookie header. Removes the header if no cookies remain.
 * @param lines - The HTTP request lines array
 * @param name - The cookie name to remove
 * @returns The modified lines array with the cookie removed
 * @throws If the request is empty or cookie name is empty
 */
export function removeCookie(lines, name) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Cookie name cannot be empty");
    return modifyRemove(lines, name);
}
function modifyAdd(lines, name, value) {
    const cookieHeaderIndex = findHeaderIndex(lines, "Cookie");
    if (cookieHeaderIndex === -1) {
        const newCookieValue = serialize(name, value, { encode: enc });
        const insertIndex = findHeaderInsertIndex(lines);
        const newLines = [...lines];
        newLines.splice(insertIndex, 0, `Cookie: ${newCookieValue}`);
        return newLines;
    }
    const existingCookieLine = lines[cookieHeaderIndex];
    const colonIndex = existingCookieLine.indexOf(":");
    const existingCookieValue = existingCookieLine.substring(colonIndex + 1).trim();
    const cookies = parse(existingCookieValue);
    cookies[name] = value;
    const newCookieValue = Object.entries(cookies)
        .map(([k, v]) => serialize(k, v, { encode: enc }))
        .join("; ");
    const newLines = [...lines];
    newLines[cookieHeaderIndex] = `Cookie: ${newCookieValue}`;
    return newLines;
}
function modifySet(lines, name, value) {
    return modifyAdd(lines, name, value);
}
function modifyRemove(lines, name) {
    const cookieHeaderIndex = findHeaderIndex(lines, "Cookie");
    if (cookieHeaderIndex === -1) {
        return lines;
    }
    const existingCookieLine = lines[cookieHeaderIndex];
    const colonIndex = existingCookieLine.indexOf(":");
    const existingCookieValue = existingCookieLine.substring(colonIndex + 1).trim();
    const cookies = parse(existingCookieValue);
    if (!(name in cookies)) {
        return lines;
    }
    delete cookies[name];
    const remainingCookies = Object.entries(cookies);
    const newLines = [...lines];
    if (remainingCookies.length === 0) {
        newLines.splice(cookieHeaderIndex, 1);
    }
    else {
        const newCookieValue = remainingCookies
            .map(([k, v]) => serialize(k, v, { encode: enc }))
            .join("; ");
        newLines[cookieHeaderIndex] = `Cookie: ${newCookieValue}`;
    }
    return newLines;
}
