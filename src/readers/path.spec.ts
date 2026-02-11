import { describe, it, expect } from "vitest";
import { getPath } from "./path.js";

describe("getPath", () => {
  it("should extract simple path", () => {
    const lines = ["GET /api/users HTTP/1.1", "Host: example.com"];
    expect(getPath(lines)).toBe("/api/users");
  });

  it("should extract path without query string", () => {
    const lines = ["GET /path/to/resource HTTP/1.1"];
    expect(getPath(lines)).toBe("/path/to/resource");
  });

  it("should extract path with query string", () => {
    const lines = ["GET /api/users?id=123&name=test HTTP/1.1"];
    expect(getPath(lines)).toBe("/api/users");
  });

  it("should extract path with hash", () => {
    const lines = ["GET /page#section HTTP/1.1"];
    expect(getPath(lines)).toBe("/page");
  });

  it("should extract path with both query and hash", () => {
    const lines = ["GET /page?id=1#section HTTP/1.1"];
    expect(getPath(lines)).toBe("/page");
  });

  it("should handle root path", () => {
    const lines = ["GET / HTTP/1.1"];
    expect(getPath(lines)).toBe("/");
  });

  it("should handle path with encoded spaces", () => {
    const lines = ["GET /path%20with%20spaces HTTP/1.1"];
    expect(getPath(lines)).toBe("/path%20with%20spaces");
  });

  it("should return null for empty lines", () => {
    const lines: string[] = [];
    expect(getPath(lines)).toBeNull();
  });

  it("should return null for request line with only method", () => {
    const lines = ["GET"];
    expect(getPath(lines)).toBeNull();
  });

  it("should return null for request line with method and spaces only", () => {
    const lines = ["GET   "];
    expect(getPath(lines)).toBeNull();
  });

  it("should handle minimal path", () => {
    const lines = ["GET /"];
    expect(getPath(lines)).toBe("/");
  });

  it("should handle path without HTTP version", () => {
    const lines = ["GET /api/users"];
    expect(getPath(lines)).toBe("/api/users");
  });

  it("should extract path when hash comes before query", () => {
    const lines = ["GET /page#section?id=1 HTTP/1.1"];
    expect(getPath(lines)).toBe("/page");
  });
});
