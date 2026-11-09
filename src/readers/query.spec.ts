import { describe, it, expect } from "vitest";
import { getQuery, getQueryParams } from "./query.js";

describe("getQuery", () => {
  it("should extract query string", () => {
    const lines = ["GET /api/users?id=123&name=test HTTP/1.1"];
    expect(getQuery(lines)).toBe("id=123&name=test");
  });

  it("should extract query string without HTTP version", () => {
    const lines = ["GET /api/users?id=123"];
    expect(getQuery(lines)).toBe("id=123");
  });

  it("should return null when no query string", () => {
    const lines = ["GET /api/users HTTP/1.1"];
    expect(getQuery(lines)).toBeNull();
  });

  it("should handle empty query string", () => {
    const lines = ["GET /api/users? HTTP/1.1"];
    expect(getQuery(lines)).toBe("");
  });

  it("should return null for empty lines", () => {
    const lines: string[] = [];
    expect(getQuery(lines)).toBeNull();
  });

  it("should handle complex query string", () => {
    const lines = ["GET /search?q=hello%20world&page=1&sort=desc HTTP/1.1"];
    expect(getQuery(lines)).toBe("q=hello%20world&page=1&sort=desc");
  });

  it("should handle query with special characters", () => {
    const lines = ["GET /api?key=value&foo=bar%3Dbaz HTTP/1.1"];
    expect(getQuery(lines)).toBe("key=value&foo=bar%3Dbaz");
  });
});

describe("getQueryParams", () => {
  it("should parse query parameters", () => {
    const lines = ["GET /api?id=123&name=test HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      id: "123",
      name: "test",
    });
  });

  it("should decode URL-encoded values", () => {
    const lines = ["GET /api?name=hello%20world HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      name: "hello world",
    });
  });

  it("should handle empty values", () => {
    const lines = ["GET /api?key1=&key2=value HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      key1: "",
      key2: "value",
    });
  });

  it("should handle parameters without values", () => {
    const lines = ["GET /api?flag&key=value HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      flag: "",
      key: "value",
    });
  });

  it("should return null when no query string", () => {
    const lines = ["GET /api HTTP/1.1"];
    expect(getQueryParams(lines)).toBeNull();
  });

  it("should return null for empty lines", () => {
    const lines: string[] = [];
    expect(getQueryParams(lines)).toBeNull();
  });

  it("should handle single parameter", () => {
    const lines = ["GET /api?id=123 HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      id: "123",
    });
  });

  it("should handle parameter with equals in value", () => {
    const lines = ["GET /api?data=key=value HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      data: "key=value",
    });
  });

  it("should handle empty query string", () => {
    const lines = ["GET /api? HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({});
  });

  it("should handle multiple equals signs", () => {
    const lines = ["GET /api?equation=a=b=c HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({
      equation: "a=b=c",
    });
  });

  it("should decode URL-encoded keys", () => {
    const lines = ["GET /api?user%20name=1 HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({ "user name": "1" });
  });

  it("should return malformed percent-encoding as written", () => {
    const lines = ["GET /api?q=100%&a%=1 HTTP/1.1"];
    expect(getQueryParams(lines)).toEqual({ q: "100%", "a%": "1" });
  });
});
