import type { HTTPRequestLines } from "../types";
export declare function addCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
export declare function setCookie(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
export declare function removeCookie(lines: HTTPRequestLines, name: string): HTTPRequestLines;
