import { setMethod, addHeader, setHeader, removeHeader, setPath, addQueryParam, removeQueryParam, setQuery, setBody, upsertQueryParam, addCookie, setCookie, removeCookie, setBodyParam, removeBodyParam, } from "./modifiers";
import { getMethod, getPath, getQuery, getQueryParams, getHeaders, getHeader, getBody, getCookies, getCookie, getBodyType, getBodyParams, getBodyParam, } from "./readers";
/**
 * A string-first HTTP request manipulation library for security researchers.
 *
 * HttpForge provides a fluent builder pattern API for reading and modifying raw HTTP request strings.
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
export class HttpForge {
    lines;
    /**
     * Creates a new HttpForge instance from a raw HTTP request string.
     * Normalizes line endings by converting CRLF to LF internally.
     *
     * @param request - The raw HTTP request string
     * @throws Error if the request string is empty
     */
    constructor(request) {
        if (request.length === 0) {
            throw new Error("Request cannot be empty");
        }
        this.lines = request.split("\n").map((line) => line.replace(/\r$/, ""));
    }
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
    static create(rawRequest) {
        return new HttpForge(rawRequest);
    }
    /**
     * Sets the HTTP method of the request.
     *
     * @param method - The HTTP method to set (e.g., "GET", "POST", "PUT")
     * @returns `this` for method chaining
     */
    method(method) {
        this.lines = setMethod(this.lines, method);
        return this;
    }
    /**
     * Sets the request path (without query string).
     *
     * @param path - The path to set (e.g., "/api/users")
     * @returns `this` for method chaining
     */
    path(path) {
        this.lines = setPath(this.lines, path);
        return this;
    }
    /**
     * Adds a query parameter to the request URL. If the parameter already exists, adds a duplicate.
     *
     * @param key - The query parameter name
     * @param value - The query parameter value
     * @returns `this` for method chaining
     */
    addQueryParam(key, value) {
        this.lines = addQueryParam(this.lines, key, value);
        return this;
    }
    /**
     * Removes a query parameter from the request URL.
     *
     * @param key - The query parameter name to remove
     * @returns `this` for method chaining
     */
    removeQueryParam(key) {
        this.lines = removeQueryParam(this.lines, key);
        return this;
    }
    /**
     * Replaces the entire query string of the request URL.
     *
     * @param query - The new query string (without leading "?")
     * @returns `this` for method chaining
     */
    setQuery(query) {
        this.lines = setQuery(this.lines, query);
        return this;
    }
    /**
     * Adds or updates a query parameter. If the parameter exists, updates its value; otherwise adds it.
     *
     * @param key - The query parameter name
     * @param value - The query parameter value
     * @returns `this` for method chaining
     */
    upsertQueryParam(key, value) {
        this.lines = upsertQueryParam(this.lines, key, value);
        return this;
    }
    /**
     * Adds a header to the request. If the header already exists, adds a duplicate.
     *
     * @param name - The header name
     * @param value - The header value
     * @returns `this` for method chaining
     */
    addHeader(name, value) {
        this.lines = addHeader(this.lines, name, value);
        return this;
    }
    /**
     * Sets a header value, replacing any existing header with the same name.
     *
     * @param name - The header name
     * @param value - The header value
     * @returns `this` for method chaining
     */
    setHeader(name, value) {
        this.lines = setHeader(this.lines, name, value);
        return this;
    }
    /**
     * Removes a header from the request.
     *
     * @param name - The header name to remove
     * @returns `this` for method chaining
     */
    removeHeader(name) {
        this.lines = removeHeader(this.lines, name);
        return this;
    }
    /**
     * Sets the request body content.
     *
     * @param body - The body content to set
     * @returns `this` for method chaining
     */
    body(body) {
        this.lines = setBody(this.lines, body);
        return this;
    }
    /**
     * Adds a cookie to the Cookie header. If the cookie already exists, adds a duplicate.
     *
     * @param name - The cookie name
     * @param value - The cookie value
     * @returns `this` for method chaining
     */
    addCookie(name, value) {
        this.lines = addCookie(this.lines, name, value);
        return this;
    }
    /**
     * Sets a cookie value, replacing any existing cookie with the same name.
     *
     * @param name - The cookie name
     * @param value - The cookie value
     * @returns `this` for method chaining
     */
    setCookie(name, value) {
        this.lines = setCookie(this.lines, name, value);
        return this;
    }
    /**
     * Removes a cookie from the Cookie header.
     *
     * @param name - The cookie name to remove
     * @returns `this` for method chaining
     */
    removeCookie(name) {
        this.lines = removeCookie(this.lines, name);
        return this;
    }
    /**
     * Sets a body parameter value. Works with URL-encoded and JSON bodies.
     *
     * @param name - The parameter name
     * @param value - The parameter value
     * @param options - Optional configuration for setting the parameter
     * @returns `this` for method chaining
     */
    setBodyParam(name, value, options) {
        this.lines = setBodyParam(this.lines, name, value, options);
        return this;
    }
    /**
     * Removes a body parameter. Works with URL-encoded and JSON bodies.
     *
     * @param name - The parameter name to remove
     * @returns `this` for method chaining
     */
    removeBodyParam(name) {
        this.lines = removeBodyParam(this.lines, name);
        return this;
    }
    /**
     * Gets the HTTP method of the request.
     *
     * @returns The HTTP method, or `null` if it cannot be determined
     */
    getMethod() {
        return getMethod(this.lines);
    }
    /**
     * Gets the request path (without query string).
     *
     * @returns The path, or `null` if it cannot be determined
     */
    getPath() {
        return getPath(this.lines);
    }
    /**
     * Gets the raw query string from the request URL.
     *
     * @returns The query string (without leading "?"), or `null` if there is no query string
     */
    getQuery() {
        return getQuery(this.lines);
    }
    /**
     * Gets the query parameters as a key-value object.
     *
     * @returns An object containing query parameters, or `null` if there are no query parameters
     */
    getQueryParams() {
        return getQueryParams(this.lines);
    }
    /**
     * Gets all headers as an object where each header name maps to an array of values.
     *
     * @returns An object containing headers, or `null` if no headers are found
     */
    getHeaders() {
        return getHeaders(this.lines);
    }
    /**
     * Gets the value of a specific header.
     *
     * @param name - The header name (case-insensitive)
     * @returns The header value, or `null` if the header is not found
     */
    getHeader(name) {
        return getHeader(this.lines, name);
    }
    /**
     * Gets the request body content.
     *
     * @returns The body content, or `null` if there is no body
     */
    getBody() {
        return getBody(this.lines);
    }
    /**
     * Gets all cookies from the Cookie header as a key-value object.
     *
     * @returns An object containing cookies, or `null` if no cookies are found
     */
    getCookies() {
        return getCookies(this.lines);
    }
    /**
     * Gets the value of a specific cookie.
     *
     * @param name - The cookie name
     * @returns The cookie value, or `null` if the cookie is not found
     */
    getCookie(name) {
        return getCookie(this.lines, name);
    }
    /**
     * Determines the body content type (e.g., "json", "urlencoded", "multipart").
     *
     * @returns The body type, or `null` if it cannot be determined
     */
    getBodyType() {
        return getBodyType(this.lines);
    }
    /**
     * Gets body parameters as a key-value object. Works with URL-encoded and JSON bodies.
     *
     * @returns An object containing body parameters, or `null` if the body cannot be parsed
     */
    getBodyParams() {
        return getBodyParams(this.lines);
    }
    /**
     * Gets the value of a specific body parameter.
     *
     * @param name - The parameter name
     * @returns The parameter value, or `null` if the parameter is not found
     */
    getBodyParam(name) {
        return getBodyParam(this.lines, name);
    }
    /**
     * Builds and returns the modified HTTP request as a string with CRLF line endings.
     *
     * @returns The HTTP request string ready for transmission
     */
    build() {
        return this.lines.join("\r\n");
    }
}
