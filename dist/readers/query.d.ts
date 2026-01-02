import type { HTTPRequestLines } from "../types";
export declare function getQuery(lines: HTTPRequestLines): string | null;
export declare function getQueryParams(lines: HTTPRequestLines): Record<string, string> | null;
