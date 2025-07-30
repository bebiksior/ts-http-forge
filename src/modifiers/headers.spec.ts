import { describe, it, expect } from "vitest";
import { addHeader, setHeader, removeHeader } from "./headers";
import type { HTTPRequestLines } from "../types";

describe("addHeader", () => {
  describe("valid input", () => {
    it("should add header to request with existing headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "",
        "body",
      ];

      const result = addHeader(lines, "Authorization", "Bearer token");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "Authorization: Bearer token",
        "",
        "body",
      ]);
    });

    it("should add header to request without existing headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "",
        "body",
      ];

      const result = addHeader(lines, "Host", "example.com");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
        "body",
      ]);
    });

    it("should add header to request without body", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
      ];

      const result = addHeader(lines, "Accept", "application/json");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Accept: application/json",
      ]);
    });

    it("should add duplicate headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=123",
        "",
      ];

      const result = addHeader(lines, "Cookie", "user=john");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=123",
        "Cookie: user=john",
        "",
      ]);
    });

    it("should handle headers with special characters", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "",
      ];

      const result = addHeader(lines, "X-Custom-Header", "value with spaces & symbols");

      expect(result[1]).toBe("X-Custom-Header: value with spaces & symbols");
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => addHeader(lines, "Host", "example.com")).toThrow("Request cannot be empty");
    });

    it("should throw error when header name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => addHeader(lines, "", "value")).toThrow("Header name cannot be empty");
    });

    it("should throw error when header name is only whitespace", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => addHeader(lines, "   ", "value")).toThrow("Header name cannot be empty");
    });

    it("should handle empty header value", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "",
      ];

      const result = addHeader(lines, "X-Empty", "");

      expect(result[1]).toBe("X-Empty: ");
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines array", () => {
      const lines: HTTPRequestLines = [
        "GET /path HTTP/1.1",
        "Host: example.com",
      ];
      const originalLines = [...lines];

      addHeader(lines, "Accept", "application/json");

      expect(lines).toEqual(originalLines);
    });

    it("should return new array reference", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      const result = addHeader(lines, "Host", "example.com");

      expect(result).not.toBe(lines);
    });
  });
});

describe("setHeader", () => {
  describe("valid input", () => {
    it("should replace existing header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: old.example.com",
        "Content-Type: application/json",
        "",
      ];

      const result = setHeader(lines, "Host", "new.example.com");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: new.example.com",
        "Content-Type: application/json",
        "",
      ]);
    });

    it("should add header when it doesn't exist", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setHeader(lines, "Authorization", "Bearer token");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Authorization: Bearer token",
        "",
      ]);
    });

    it("should be case insensitive for header names", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "content-type: application/xml",
        "",
      ];

      const result = setHeader(lines, "Content-Type", "application/json");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Content-Type: application/json",
        "",
      ]);
    });

    it("should replace first occurrence of duplicate headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Cookie: session=123",
        "Host: example.com",
        "Cookie: user=john",
        "",
      ];

      const result = setHeader(lines, "Cookie", "new=value");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Cookie: new=value",
        "Host: example.com",
        "Cookie: user=john",
        "",
      ]);
    });

    it("should handle headers with whitespace around colons", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host : example.com",
        "",
      ];

      const result = setHeader(lines, "host", "new.example.com");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "host: new.example.com",
        "",
      ]);
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => setHeader(lines, "Host", "example.com")).toThrow("Request cannot be empty");
    });

    it("should throw error when header name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => setHeader(lines, "", "value")).toThrow("Header name cannot be empty");
    });

    it("should throw error when header name is only whitespace", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => setHeader(lines, "   ", "value")).toThrow("Header name cannot be empty");
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines array", () => {
      const lines: HTTPRequestLines = [
        "GET /path HTTP/1.1",
        "Host: example.com",
      ];
      const originalLines = [...lines];

      setHeader(lines, "Host", "new.example.com");

      expect(lines).toEqual(originalLines);
    });

    it("should return new array reference", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      const result = setHeader(lines, "Host", "example.com");

      expect(result).not.toBe(lines);
    });
  });
});

describe("removeHeader", () => {
  describe("valid input", () => {
    it("should remove existing header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Authorization: Bearer token",
        "Content-Type: application/json",
        "",
      ];

      const result = removeHeader(lines, "Authorization");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "",
      ]);
    });

    it("should be case insensitive for header names", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Content-Type: application/json",
        "",
      ];

      const result = removeHeader(lines, "content-type");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "",
      ]);
    });

    it("should remove all occurrences of duplicate headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Cookie: session=123",
        "Host: example.com",
        "Cookie: user=john",
        "",
      ];

      const result = removeHeader(lines, "Cookie");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ]);
    });

    it("should return original array when header doesn't exist", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = removeHeader(lines, "Authorization");

      expect(result).toBe(lines);
    });

    it("should handle malformed headers gracefully", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "MalformedHeader",
        "Content-Type: application/json",
        "",
      ];

      const result = removeHeader(lines, "Content-Type");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "MalformedHeader",
        "",
      ]);
    });

    it("should handle headers with whitespace around colons", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host : example.com",
        "",
      ];

      const result = removeHeader(lines, "host");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "",
      ]);
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => removeHeader(lines, "Host")).toThrow("Request cannot be empty");
    });

    it("should throw error when header name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => removeHeader(lines, "")).toThrow("Header name cannot be empty");
    });

    it("should throw error when header name is only whitespace", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => removeHeader(lines, "   ")).toThrow("Header name cannot be empty");
    });
  });

  describe("malformed input preservation", () => {
    it("should stop at empty line when looking for headers", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
        "Content-Type: application/json",
        "body content",
      ];

      const result = removeHeader(lines, "Content-Type");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
        "Content-Type: application/json",
        "body content",
      ]);
    });

    it("should handle request with no empty line separator", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
      ];

      const result = removeHeader(lines, "Content-Type");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
      ]);
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines array", () => {
      const lines: HTTPRequestLines = [
        "GET /path HTTP/1.1",
        "Host: example.com",
      ];
      const originalLines = [...lines];

      removeHeader(lines, "Host");

      expect(lines).toEqual(originalLines);
    });

    it("should return new array reference when header is removed", () => {
      const lines: HTTPRequestLines = [
        "GET /path HTTP/1.1",
        "Host: example.com",
      ];

      const result = removeHeader(lines, "Host");

      expect(result).not.toBe(lines);
    });

    it("should return same array reference when header doesn't exist", () => {
      const lines: HTTPRequestLines = [
        "GET /path HTTP/1.1",
        "Host: example.com",
      ];

      const result = removeHeader(lines, "Authorization");

      expect(result).toBe(lines);
    });
  });
});
