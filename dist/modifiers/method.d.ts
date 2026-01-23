import type { HTTPRequestLines, HttpMethod } from "../types";
/**
 * Changes the HTTP method in the request line.
 * @param lines - The HTTP request lines array
 * @param method - The new HTTP method to set
 * @returns The modified lines array with the updated method
 * @throws If the request is empty, method is empty, or method contains spaces
 */
export declare function setMethod(lines: HTTPRequestLines, method: HttpMethod): HTTPRequestLines;
