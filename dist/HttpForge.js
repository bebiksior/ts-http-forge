import { setMethod, addHeader, setHeader, removeHeader, setPath, addQueryParam, removeQueryParam, setQuery, setBody, upsertQueryParam, } from "./modifiers";
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
    build() {
        return this.lines.join("\r\n");
    }
}
