import { describe, it, expect } from "vitest";
import { setPath } from "./path";
import type { HTTPRequestLines } from "../types";

describe("setPath", () => {
  describe("valid input", () => {
    it("should replace path in standard request line", () => {
      const lines: HTTPRequestLines = [
        "GET /old/path HTTP/1.1",
        "Host: example.com",
        "",
        "body content",
      ];

      const result = setPath(lines, "/new/path");

      expect(result).toEqual([
        "GET /new/path HTTP/1.1",
        "Host: example.com",
        "",
        "body content",
      ]);
    });

    it("should replace path with query parameters", () => {
      const lines: HTTPRequestLines = ["GET /old/path?param=value HTTP/1.1"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET /new/path?param=value HTTP/1.1");
    });

    it("should replace path with fragments", () => {
      const lines: HTTPRequestLines = ["GET /old/path#fragment HTTP/1.1"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET /new/path#fragment HTTP/1.1");
    });

    it("should handle paths with special characters", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      const result = setPath(lines, "/new/path%20with%20spaces");

      expect(result[0]).toBe("GET /new/path%20with%20spaces HTTP/1.1");
    });

    it("should handle root path", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      const result = setPath(lines, "/");

      expect(result[0]).toBe("GET / HTTP/1.1");
    });

    it("should handle empty path", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      const result = setPath(lines, "");

      expect(result[0]).toBe("GET  HTTP/1.1");
    });

    it("should preserve multiple spaces after method", () => {
      const lines: HTTPRequestLines = ["GET    /old/path    HTTP/1.1"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET    /new/path    HTTP/1.1");
    });

    it("should preserve original headers and body", () => {
      const lines: HTTPRequestLines = [
        "GET /old/path HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "Authorization: Bearer token",
        "",
        '{"key": "value"}',
      ];

      const result = setPath(lines, "/api/users");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "Authorization: Bearer token",
        "",
        '{"key": "value"}',
      ]);
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => setPath(lines, "/new/path")).toThrow("Request cannot be empty");
    });

    it("should throw error when path is null", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      expect(() => setPath(lines, null as any)).toThrow("Path cannot be null or undefined");
    });

    it("should throw error when path is undefined", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      expect(() => setPath(lines, undefined as any)).toThrow("Path cannot be null or undefined");
    });

    it("should handle request line with no spaces (malformed)", () => {
      const lines: HTTPRequestLines = ["MALFORMED"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("MALFORMED /new/path");
    });

    it("should handle request line with only method", () => {
      const lines: HTTPRequestLines = ["GET"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET /new/path");
    });

    it("should handle empty request line", () => {
      const lines: HTTPRequestLines = [""];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe(" /new/path");
    });

    it("should handle request line with method and path but no HTTP version", () => {
      const lines: HTTPRequestLines = ["GET /old/path"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET /new/path");
    });
  });

  describe("malformed input preservation", () => {
    it("should preserve malformed HTTP version", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/9.9"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("GET /new/path HTTP/9.9");
    });

    it("should preserve unusual method names", () => {
      const lines: HTTPRequestLines = ["CUSTOM123 /old/path HTTP/1.1"];

      const result = setPath(lines, "/new/path");

      expect(result[0]).toBe("CUSTOM123 /new/path HTTP/1.1");
    });

    it("should handle complex query strings", () => {
      const lines: HTTPRequestLines = ["GET /old/path?a=1&b=2&c=hello%20world HTTP/1.1"];

      const result = setPath(lines, "/api/v2/endpoint");

      expect(result[0]).toBe("GET /api/v2/endpoint?a=1&b=2&c=hello%20world HTTP/1.1");
    });

    it("should preserve malformed paths in query/fragment", () => {
      const lines: HTTPRequestLines = ["GET /old/path#fragment?weird&stuff HTTP/1.1"];

      const result = setPath(lines, "/normal/path");

      expect(result[0]).toBe("GET /normal/path#fragment?weird&stuff HTTP/1.1");
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines array", () => {
      const lines: HTTPRequestLines = [
        "GET /old/path HTTP/1.1",
        "Host: example.com",
      ];
      const originalLines = [...lines];

      setPath(lines, "/new/path");

      expect(lines).toEqual(originalLines);
    });

    it("should return new array reference", () => {
      const lines: HTTPRequestLines = ["GET /old/path HTTP/1.1"];

      const result = setPath(lines, "/new/path");

      expect(result).not.toBe(lines);
    });
  });
});
