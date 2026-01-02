import { parse } from "cookie-es";
import { getHeader } from "./headers";
export function getCookies(lines) {
    const cookieHeader = getHeader(lines, "Cookie");
    if (!cookieHeader)
        return null;
    return parse(cookieHeader);
}
export function getCookie(lines, name) {
    const cookies = getCookies(lines);
    if (!cookies)
        return null;
    return cookies[name] ?? null;
}
