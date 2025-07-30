import type { HTTPRequestLines } from "../types";
export declare function setQuery(lines: HTTPRequestLines, query: string): HTTPRequestLines;
export declare function addQueryParam(lines: HTTPRequestLines, key: string, value: string): HTTPRequestLines;
export declare function removeQueryParam(lines: HTTPRequestLines, key: string): HTTPRequestLines;
export declare function upsertQueryParam(lines: HTTPRequestLines, key: string, value: string): HTTPRequestLines;
