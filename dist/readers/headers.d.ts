import type { HTTPRequestLines } from "../types";
export declare function getHeaders(lines: HTTPRequestLines): Record<string, string[]> | null;
export declare function getHeader(lines: HTTPRequestLines, name: string): string | null;
export declare function findHeaderIndex(lines: HTTPRequestLines, name: string): number;
export declare function findHeaderInsertIndex(lines: HTTPRequestLines): number;
