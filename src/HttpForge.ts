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
} from "./modifiers";
import type { HttpMethod } from "./types";

export class HttpForge {
  private lines: string[];

  private constructor(request: string) {
    if (request.length === 0) {
      throw new Error("Request cannot be empty");
    }

    this.lines = request.split("\n").map((line) => line.replace(/\r$/, ""));
  }

  static create(rawRequest: string): HttpForge {
    return new HttpForge(rawRequest);
  }

  method(method: HttpMethod): this {
    this.lines = setMethod(this.lines, method);
    return this;
  }

  path(path: string): this {
    this.lines = setPath(this.lines, path);
    return this;
  }

  addQueryParam(key: string, value: string): this {
    this.lines = addQueryParam(this.lines, key, value);
    return this;
  }

  removeQueryParam(key: string): this {
    this.lines = removeQueryParam(this.lines, key);
    return this;
  }

  setQuery(query: string): this {
    this.lines = setQuery(this.lines, query);
    return this;
  }

  upsertQueryParam(key: string, value: string): this {
    this.lines = upsertQueryParam(this.lines, key, value);
    return this;
  }

  addHeader(name: string, value: string): this {
    this.lines = addHeader(this.lines, name, value);
    return this;
  }

  setHeader(name: string, value: string): this {
    this.lines = setHeader(this.lines, name, value);
    return this;
  }

  removeHeader(name: string): this {
    this.lines = removeHeader(this.lines, name);
    return this;
  }

  body(body: string): this {
    this.lines = setBody(this.lines, body);
    return this;
  }

  addCookie(name: string, value: string): this {
    this.lines = addCookie(this.lines, name, value);
    return this;
  }

  setCookie(name: string, value: string): this {
    this.lines = setCookie(this.lines, name, value);
    return this;
  }

  removeCookie(name: string): this {
    this.lines = removeCookie(this.lines, name);
    return this;
  }

  build(): string {
    return this.lines.join("\r\n");
  }
}
