/**
 * ts-http-forge - A string-first HTTP request manipulation library for security researchers.
 *
 * Unlike traditional HTTP parsers that reject malformed requests, ts-http-forge works with
 * **any** input—preserving edge cases, broken syntax, and weird formatting that's essential
 * for testing HTTP parsers.
 *
 * @packageDocumentation
 */
export * from './HttpForge.js';
export { getMethod, getPath, getQuery, getQueryParams, getHeaders, getHeader, getBody, getCookies, getCookie, getBodyType, getBodyParams, getBodyParam, } from "./readers/index.js";
export type { BodyType } from "./readers/index.js";
export type { SetBodyParamOptions } from "./modifiers/index.js";
export type { HttpMethod, HTTPRequestLines } from "./types.js";
