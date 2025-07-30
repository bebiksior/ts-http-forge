import type { HTTPRequestLines } from "../types";
export declare function addHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
export declare function setHeader(lines: HTTPRequestLines, name: string, value: string): HTTPRequestLines;
export declare function removeHeader(lines: HTTPRequestLines, name: string): HTTPRequestLines;
