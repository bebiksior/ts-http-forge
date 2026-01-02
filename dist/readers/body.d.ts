import type { HTTPRequestLines } from "../types";
export declare function getBody(lines: HTTPRequestLines): string | null;
export declare function findBodyStartIndex(lines: HTTPRequestLines): number;
