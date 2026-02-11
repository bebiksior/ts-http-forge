import type { HTTPRequestLines, HttpMethod } from "../types.js";
/**
 * Options for setBodyParam function.
 */
export interface SetBodyParamOptions {
    /** Body format to use when creating a new body (default: "json") */
    defaultBodyType?: "json" | "urlencoded";
    /** Method to switch to if current method is GET/HEAD (default: "POST") */
    defaultMethod?: HttpMethod;
}
/**
 * Sets a body parameter, auto-detecting JSON or urlencoded format.
 * Creates body and Content-Type header if needed. Switches GET/HEAD to POST.
 * @param lines - The HTTP request lines array
 * @param name - The parameter name
 * @param value - The parameter value
 * @param options - Optional settings for default body type and method
 * @returns The modified lines array with the set parameter
 * @throws If the request is empty or parameter name is empty
 */
export declare function setBodyParam(lines: HTTPRequestLines, name: string, value: string, options?: SetBodyParamOptions): HTTPRequestLines;
/**
 * Removes a body parameter from JSON or urlencoded body.
 * @param lines - The HTTP request lines array
 * @param name - The parameter name to remove
 * @returns The modified lines array with the parameter removed
 * @throws If the request is empty or parameter name is empty
 */
export declare function removeBodyParam(lines: HTTPRequestLines, name: string): HTTPRequestLines;
