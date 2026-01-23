/**
 * ts-http-forge - A string-first HTTP request manipulation library for security researchers.
 *
 * Unlike traditional HTTP parsers that reject malformed requests, ts-http-forge works with
 * **any** input—preserving edge cases, broken syntax, and weird formatting that's essential
 * for testing HTTP parsers.
 *
 * @packageDocumentation
 */
export * from './HttpForge';
export { getMethod, getPath, getQuery, getQueryParams, getHeaders, getHeader, getBody, getCookies, getCookie, getBodyType, getBodyParams, getBodyParam, } from "./readers";
export type { BodyType } from "./readers";
export type { SetBodyParamOptions } from "./modifiers";
export type { HttpMethod, HTTPRequestLines } from "./types";
