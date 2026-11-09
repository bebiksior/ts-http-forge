import {
  setMethod,
  addHeader,
  setHeader,
  removeHeader,
  setPath,
  addQueryParam,
  removeQueryParam,
  setQuery,
  setBody,
  upsertQueryParam,
  addCookie,
  setCookie,
  removeCookie,
  setBodyParam,
  removeBodyParam,
  type SetBodyParamOptions,
} from "./modifiers/index.js";
import {
  getMethod,
  getPath,
  getQuery,
  getQueryParams,
  getHeaders,
  getHeader,
  getBody,
  getCookies,
  getCookie,
  getBodyType,
  getBodyParams,
  getBodyParam,
  type BodyType,
} from "./readers/index.js";
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
export class HttpForge {
  private lines: string[];

  /**
   * Creates a new HttpForge instance from a raw HTTP request string.
   * Splits the request line and headers into lines; the body is kept verbatim
   * as the last element so its line endings survive.
   *
   * @param request - The raw HTTP request string
   * @throws Error if the request string is empty
   */
  private constructor(request: string) {
    if (request.length === 0) {
      throw new Error("Request cannot be empty");
    }

    const rawLines = request.split("\n");
    const separatorIndex = rawLines.findIndex(
      (line, index) => index > 0 && line.trim() === ""
    );
    const headEnd =
      separatorIndex === -1 ? rawLines.length : separatorIndex + 1;

    this.lines = rawLines
      .slice(0, headEnd)
      .map((line) => line.replace(/\r$/, ""));
    if (headEnd < rawLines.length) {
      this.lines.push(rawLines.slice(headEnd).join("\n"));
    }
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
  static create(rawRequest: string): HttpForge {
    return new HttpForge(rawRequest);
  }

  /**
   * Sets the HTTP method of the request.
   *
   * @param method - The HTTP method to set (e.g., "GET", "POST", "PUT")
   * @returns `this` for method chaining
   */
  method(method: HttpMethod): this {
    this.lines = setMethod(this.lines, method);
    return this;
  }

  /**
   * Sets the request path (without query string).
   *
   * @param path - The path to set (e.g., "/api/users")
   * @returns `this` for method chaining
   */
  path(path: string): this {
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
  addQueryParam(key: string, value: string): this {
    this.lines = addQueryParam(this.lines, key, value);
    return this;
  }

  /**
   * Removes a query parameter from the request URL.
   *
   * @param key - The query parameter name to remove
   * @returns `this` for method chaining
   */
  removeQueryParam(key: string): this {
    this.lines = removeQueryParam(this.lines, key);
    return this;
  }

  /**
   * Replaces the entire query string of the request URL.
   *
   * @param query - The new query string (without leading "?")
   * @returns `this` for method chaining
   */
  setQuery(query: string): this {
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
  upsertQueryParam(key: string, value: string): this {
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
  addHeader(name: string, value: string): this {
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
  setHeader(name: string, value: string): this {
    this.lines = setHeader(this.lines, name, value);
    return this;
  }

  /**
   * Removes a header from the request.
   *
   * @param name - The header name to remove
   * @returns `this` for method chaining
   */
  removeHeader(name: string): this {
    this.lines = removeHeader(this.lines, name);
    return this;
  }

  /**
   * Sets the request body content.
   *
   * @param body - The body content to set
   * @returns `this` for method chaining
   */
  body(body: string): this {
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
  addCookie(name: string, value: string): this {
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
  setCookie(name: string, value: string): this {
    this.lines = setCookie(this.lines, name, value);
    return this;
  }

  /**
   * Removes a cookie from the Cookie header.
   *
   * @param name - The cookie name to remove
   * @returns `this` for method chaining
   */
  removeCookie(name: string): this {
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
  setBodyParam(name: string, value: string, options?: SetBodyParamOptions): this {
    this.lines = setBodyParam(this.lines, name, value, options);
    return this;
  }

  /**
   * Removes a body parameter. Works with URL-encoded and JSON bodies.
   *
   * @param name - The parameter name to remove
   * @returns `this` for method chaining
   */
  removeBodyParam(name: string): this {
    this.lines = removeBodyParam(this.lines, name);
    return this;
  }

  /**
   * Gets the HTTP method of the request.
   *
   * @returns The HTTP method, or `null` if it cannot be determined
   */
  getMethod(): HttpMethod | null {
    return getMethod(this.lines);
  }

  /**
   * Gets the request path (without query string).
   *
   * @returns The path, or `null` if it cannot be determined
   */
  getPath(): string | null {
    return getPath(this.lines);
  }

  /**
   * Gets the raw query string from the request URL.
   *
   * @returns The query string (without leading "?"), or `null` if there is no query string
   */
  getQuery(): string | null {
    return getQuery(this.lines);
  }

  /**
   * Gets the query parameters as a key-value object.
   *
   * @returns An object containing query parameters, or `null` if there are no query parameters
   */
  getQueryParams(): Record<string, string> | null {
    return getQueryParams(this.lines);
  }

  /**
   * Gets all headers as an object where each header name maps to an array of values.
   *
   * @returns An object containing headers, or `null` if no headers are found
   */
  getHeaders(): Record<string, string[]> | null {
    return getHeaders(this.lines);
  }

  /**
   * Gets the value of a specific header.
   *
   * @param name - The header name (case-insensitive)
   * @returns The header value, or `null` if the header is not found
   */
  getHeader(name: string): string | null {
    return getHeader(this.lines, name);
  }

  /**
   * Gets the request body content.
   *
   * @returns The body content, or `null` if there is no body
   */
  getBody(): string | null {
    return getBody(this.lines);
  }

  /**
   * Gets all cookies from the Cookie header as a key-value object.
   *
   * @returns An object containing cookies, or `null` if no cookies are found
   */
  getCookies(): Record<string, string> | null {
    return getCookies(this.lines);
  }

  /**
   * Gets the value of a specific cookie.
   *
   * @param name - The cookie name
   * @returns The cookie value, or `null` if the cookie is not found
   */
  getCookie(name: string): string | null {
    return getCookie(this.lines, name);
  }

  /**
   * Determines the body content type (e.g., "json", "urlencoded", "multipart").
   *
   * @returns The body type, or `null` if it cannot be determined
   */
  getBodyType(): BodyType | null {
    return getBodyType(this.lines);
  }

  /**
   * Gets body parameters as a key-value object. Works with URL-encoded and JSON bodies.
   *
   * @returns An object containing body parameters, or `null` if the body cannot be parsed
   */
  getBodyParams(): Record<string, string> | null {
    return getBodyParams(this.lines);
  }

  /**
   * Gets the value of a specific body parameter.
   *
   * @param name - The parameter name
   * @returns The parameter value, or `null` if the parameter is not found
   */
  getBodyParam(name: string): string | null {
    return getBodyParam(this.lines, name);
  }

  /**
   * Builds and returns the modified HTTP request as a string. The request line
   * and headers use CRLF line endings; the body is emitted unchanged.
   *
   * @returns The HTTP request string ready for transmission
   */
  build(): string {
    return this.lines.join("\r\n");
  }
}
