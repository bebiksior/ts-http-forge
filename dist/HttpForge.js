import { setMethod, addHeader, setHeader, removeHeader, setPath, addQueryParam, removeQueryParam, setQuery, setBody, upsertQueryParam, addCookie, setCookie, removeCookie, } from "./modifiers";
import { getMethod, getPath, getQuery, getQueryParams, getHeaders, getHeader, getBody, getCookies, getCookie, } from "./readers";
export class HttpForge {
    lines;
    constructor(request) {
        if (request.length === 0) {
            throw new Error("Request cannot be empty");
        }
        this.lines = request.split("\n").map((line) => line.replace(/\r$/, ""));
    }
    static create(rawRequest) {
        return new HttpForge(rawRequest);
    }
    method(method) {
        this.lines = setMethod(this.lines, method);
        return this;
    }
    path(path) {
        this.lines = setPath(this.lines, path);
        return this;
    }
    addQueryParam(key, value) {
        this.lines = addQueryParam(this.lines, key, value);
        return this;
    }
    removeQueryParam(key) {
        this.lines = removeQueryParam(this.lines, key);
        return this;
    }
    setQuery(query) {
        this.lines = setQuery(this.lines, query);
        return this;
    }
    upsertQueryParam(key, value) {
        this.lines = upsertQueryParam(this.lines, key, value);
        return this;
    }
    addHeader(name, value) {
        this.lines = addHeader(this.lines, name, value);
        return this;
    }
    setHeader(name, value) {
        this.lines = setHeader(this.lines, name, value);
        return this;
    }
    removeHeader(name) {
        this.lines = removeHeader(this.lines, name);
        return this;
    }
    body(body) {
        this.lines = setBody(this.lines, body);
        return this;
    }
    addCookie(name, value) {
        this.lines = addCookie(this.lines, name, value);
        return this;
    }
    setCookie(name, value) {
        this.lines = setCookie(this.lines, name, value);
        return this;
    }
    removeCookie(name) {
        this.lines = removeCookie(this.lines, name);
        return this;
    }
    getMethod() {
        return getMethod(this.lines);
    }
    getPath() {
        return getPath(this.lines);
    }
    getQuery() {
        return getQuery(this.lines);
    }
    getQueryParams() {
        return getQueryParams(this.lines);
    }
    getHeaders() {
        return getHeaders(this.lines);
    }
    getHeader(name) {
        return getHeader(this.lines, name);
    }
    getBody() {
        return getBody(this.lines);
    }
    getCookies() {
        return getCookies(this.lines);
    }
    getCookie(name) {
        return getCookie(this.lines, name);
    }
    build() {
        return this.lines.join("\r\n");
    }
}
