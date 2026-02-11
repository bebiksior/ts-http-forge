import type { HTTPRequestLines } from "../types.js";
/** The detected body content type. */
export type BodyType = "json" | "urlencoded" | "unknown";
/**
 * Determines the body type from Content-Type header or by inference.
 * @param lines - The parsed HTTP request lines
 * @returns The body type or null if no body present
 */
export declare function getBodyType(lines: HTTPRequestLines): BodyType | null;
/**
 * Infers the body type from the body content by examining its structure.
 * @param body - The raw body string
 * @returns The inferred body type (json, urlencoded, or unknown)
 */
export declare function inferBodyType(body: string): BodyType;
/**
 * Parses body parameters from JSON or URL-encoded bodies.
 * @param lines - The parsed HTTP request lines
 * @returns An object of parameter name-value pairs or null if body cannot be parsed
 */
export declare function getBodyParams(lines: HTTPRequestLines): Record<string, string> | null;
/**
 * Gets a specific body parameter value by name.
 * @param lines - The parsed HTTP request lines
 * @param name - The parameter name to look up
 * @returns The parameter value or null if not found
 */
export declare function getBodyParam(lines: HTTPRequestLines, name: string): string | null;
