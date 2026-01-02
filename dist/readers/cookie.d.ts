import type { HTTPRequestLines } from "../types";
export declare function getCookies(lines: HTTPRequestLines): Record<string, string> | null;
export declare function getCookie(lines: HTTPRequestLines, name: string): string | null;
