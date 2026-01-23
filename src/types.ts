/**
 * @packageDocumentation
 * Type definitions for ts-http-forge, a library for manipulating raw HTTP requests.
 */

/**
 * Utility type that provides autocomplete suggestions for known values
 * while still allowing arbitrary strings.
 *
 * @typeParam T - The union of known string literal values to suggest
 */
type StringWithAutocomplete<T> = T | (string & Record<never, never>);

/**
 * HTTP request method type with autocomplete support for standard methods.
 *
 * Includes all standard HTTP methods (GET, POST, PUT, DELETE, etc.) as suggestions,
 * but also accepts custom methods for testing edge cases or non-standard servers.
 *
 * @example
 * ```ts
 * const method: HttpMethod = "GET";
 * const custom: HttpMethod = "CUSTOM"; // also could be valid for testing
 * ```
 */
export type HttpMethod = StringWithAutocomplete<
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT"
>;

/**
 * Represents a raw HTTP request as an array of lines.
 *
 * Each element corresponds to a single line of the HTTP request,
 * preserving the original structure for low-level manipulation.
 *
 * @example
 * ```ts
 * const lines: HTTPRequestLines = [
 *   "GET /api/users HTTP/1.1",
 *   "Host: example.com",
 *   "Authorization: Bearer token",
 *   "",
 *   "request body"
 * ];
 * ```
 */
export type HTTPRequestLines = string[];
