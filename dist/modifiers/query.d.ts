import type { HTTPRequestLines } from "../types.js";
/**
 * Sets the entire query string, replacing any existing query.
 * @param lines - The HTTP request lines array
 * @param query - The new query string (without leading '?')
 * @returns The modified lines array with the updated query string
 * @throws If the request is empty or query is null/undefined
 */
export declare function setQuery(lines: HTTPRequestLines, query: string): HTTPRequestLines;
/**
 * Adds a query parameter, appending to existing parameters.
 * @param lines - The HTTP request lines array
 * @param key - The parameter key (whitespace, `#`, `&` and `=` are URL-encoded)
 * @param value - The parameter value (will be URL-encoded)
 * @returns The modified lines array with the added parameter
 * @throws If the request is empty or key is empty
 */
export declare function addQueryParam(lines: HTTPRequestLines, key: string, value: string): HTTPRequestLines;
/**
 * Removes all query parameters with the specified key.
 * @param lines - The HTTP request lines array
 * @param key - The parameter key to remove
 * @returns The modified lines array with the parameter removed
 * @throws If the request is empty or key is empty
 */
export declare function removeQueryParam(lines: HTTPRequestLines, key: string): HTTPRequestLines;
/**
 * Updates an existing query parameter or adds it if not present.
 * @param lines - The HTTP request lines array
 * @param key - The parameter key
 * @param value - The parameter value (will be URL-encoded)
 * @returns The modified lines array with the upserted parameter
 * @throws If the request is empty or key is empty
 */
export declare function upsertQueryParam(lines: HTTPRequestLines, key: string, value: string): HTTPRequestLines;
