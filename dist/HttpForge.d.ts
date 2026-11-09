import { type SetBodyParamOptions } from "./modifiers/index.js";
import { type BodyType } from "./readers/index.js";
import type { HttpMethod } from "./types.js";
/**
 * A string-first HTTP request manipulation library for security researchers.
 *
 * HttpForge provides a builder pattern API for reading and modifying raw HTTP request strings.
 * Use the static {@link HttpForge.create} method to instantiate.
 *
 * @example
 * ```typescript
 * const request = HttpForge.create(rawRequest)
 *   .method("POST")
 *   .setHeader("Content-Type", "application/json")
 *   .body('{"key": "value"}')
 *   .build();
 * ```
 */
export declare class HttpForge {
    private lines;
    /**
     * Creates a new HttpForge instance from a raw HTTP request string.
     * Splits the request line and headers into lines; the body is kept verbatim
     * as the last element so its line endings survive.
     *
     * @param request - The raw HTTP request string
     * @throws Error if the request string is empty
     */
    private constructor();
    /**
     * Creates a new HttpForge instance from a raw HTTP request string.
     *
     * @param rawRequest - The raw HTTP request string to parse and manipulate
     * @returns A new HttpForge instance
     * @throws Error if the request string is empty
     *
     * @example
     * ```typescript
     * const forge = HttpForge.create("GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n");
     * ```
     */
    static create(rawRequest: string): HttpForge;
    /**
     * Sets the HTTP method of the request.
     *
     * @param method - The HTTP method to set (e.g., "GET", "POST", "PUT")
     * @returns `this` for method chaining
     */
    method(method: HttpMethod): this;
    /**
     * Sets the request path (without query string).
     *
     * @param path - The path to set (e.g., "/api/users")
     * @returns `this` for method chaining
     */
    path(path: string): this;
    /**
     * Adds a query parameter to the request URL. If the parameter already exists, adds a duplicate.
     *
     * @param key - The query parameter name
     * @param value - The query parameter value
     * @returns `this` for method chaining
     */
    addQueryParam(key: string, value: string): this;
    /**
     * Removes a query parameter from the request URL.
     *
     * @param key - The query parameter name to remove
     * @returns `this` for method chaining
     */
    removeQueryParam(key: string): this;
    /**
     * Replaces the entire query string of the request URL.
     *
     * @param query - The new query string (without leading "?")
     * @returns `this` for method chaining
     */
    setQuery(query: string): this;
    /**
     * Adds or updates a query parameter. If the parameter exists, updates its value; otherwise adds it.
     *
     * @param key - The query parameter name
     * @param value - The query parameter value
     * @returns `this` for method chaining
     */
    upsertQueryParam(key: string, value: string): this;
    /**
     * Adds a header to the request. If the header already exists, adds a duplicate.
     *
     * @param name - The header name
     * @param value - The header value
     * @returns `this` for method chaining
     */
    addHeader(name: string, value: string): this;
    /**
     * Sets a header value, replacing any existing header with the same name.
     *
     * @param name - The header name
     * @param value - The header value
     * @returns `this` for method chaining
     */
    setHeader(name: string, value: string): this;
    /**
     * Removes a header from the request.
     *
     * @param name - The header name to remove
     * @returns `this` for method chaining
     */
    removeHeader(name: string): this;
    /**
     * Sets the request body content.
     *
     * @param body - The body content to set
     * @returns `this` for method chaining
     */
    body(body: string): this;
    /**
     * Adds a cookie to the Cookie header. If the cookie already exists, adds a duplicate.
     *
     * @param name - The cookie name
     * @param value - The cookie value
     * @returns `this` for method chaining
     */
    addCookie(name: string, value: string): this;
    /**
     * Sets a cookie value, replacing any existing cookie with the same name.
     *
     * @param name - The cookie name
     * @param value - The cookie value
     * @returns `this` for method chaining
     */
    setCookie(name: string, value: string): this;
    /**
     * Removes a cookie from the Cookie header.
     *
     * @param name - The cookie name to remove
     * @returns `this` for method chaining
     */
    removeCookie(name: string): this;
    /**
     * Sets a body parameter value. Works with URL-encoded and JSON bodies.
     *
     * @param name - The parameter name
     * @param value - The parameter value
     * @param options - Optional configuration for setting the parameter
     * @returns `this` for method chaining
     */
    setBodyParam(name: string, value: string, options?: SetBodyParamOptions): this;
    /**
     * Removes a body parameter. Works with URL-encoded and JSON bodies.
     *
     * @param name - The parameter name to remove
     * @returns `this` for method chaining
     */
    removeBodyParam(name: string): this;
    /**
     * Gets the HTTP method of the request.
     *
     * @returns The HTTP method, or `null` if it cannot be determined
     */
    getMethod(): HttpMethod | null;
    /**
     * Gets the request path (without query string).
     *
     * @returns The path, or `null` if it cannot be determined
     */
    getPath(): string | null;
    /**
     * Gets the raw query string from the request URL.
     *
     * @returns The query string (without leading "?"), or `null` if there is no query string
     */
    getQuery(): string | null;
    /**
     * Gets the query parameters as a key-value object.
     *
     * @returns An object containing query parameters, or `null` if there are no query parameters
     */
    getQueryParams(): Record<string, string> | null;
    /**
     * Gets all headers as an object where each header name maps to an array of values.
     *
     * @returns An object containing headers, or `null` if no headers are found
     */
    getHeaders(): Record<string, string[]> | null;
    /**
     * Gets the value of a specific header.
     *
     * @param name - The header name (case-insensitive)
     * @returns The header value, or `null` if the header is not found
     */
    getHeader(name: string): string | null;
    /**
     * Gets the request body content.
     *
     * @returns The body content, or `null` if there is no body
     */
    getBody(): string | null;
    /**
     * Gets all cookies from the Cookie header as a key-value object.
     *
     * @returns An object containing cookies, or `null` if no cookies are found
     */
    getCookies(): Record<string, string> | null;
    /**
     * Gets the value of a specific cookie.
     *
     * @param name - The cookie name
     * @returns The cookie value, or `null` if the cookie is not found
     */
    getCookie(name: string): string | null;
    /**
     * Determines the body content type (e.g., "json", "urlencoded", "multipart").
     *
     * @returns The body type, or `null` if it cannot be determined
     */
    getBodyType(): BodyType | null;
    /**
     * Gets body parameters as a key-value object. Works with URL-encoded and JSON bodies.
     *
     * @returns An object containing body parameters, or `null` if the body cannot be parsed
     */
    getBodyParams(): Record<string, string> | null;
    /**
     * Gets the value of a specific body parameter.
     *
     * @param name - The parameter name
     * @returns The parameter value, or `null` if the parameter is not found
     */
    getBodyParam(name: string): string | null;
    /**
     * Builds and returns the modified HTTP request as a string. The request line
     * and headers use CRLF line endings; the body is emitted unchanged.
     *
     * @returns The HTTP request string ready for transmission
     */
    build(): string;
}
