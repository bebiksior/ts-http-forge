import type { HttpMethod } from "./types";
export declare class HttpForge {
    private lines;
    private constructor();
    static create(rawRequest: string): HttpForge;
    method(method: HttpMethod): this;
    path(path: string): this;
    addQueryParam(key: string, value: string): this;
    removeQueryParam(key: string): this;
    setQuery(query: string): this;
    upsertQueryParam(key: string, value: string): this;
    addHeader(name: string, value: string): this;
    setHeader(name: string, value: string): this;
    removeHeader(name: string): this;
    body(body: string): this;
    addCookie(name: string, value: string): this;
    setCookie(name: string, value: string): this;
    removeCookie(name: string): this;
    getMethod(): HttpMethod | null;
    getPath(): string | null;
    getQuery(): string | null;
    getQueryParams(): Record<string, string> | null;
    getHeaders(): Record<string, string[]> | null;
    getHeader(name: string): string | null;
    getBody(): string | null;
    getCookies(): Record<string, string> | null;
    getCookie(name: string): string | null;
    build(): string;
}
