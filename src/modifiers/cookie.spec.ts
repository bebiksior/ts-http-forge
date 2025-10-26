import { describe, it, expect } from "vitest";
import { addCookie, setCookie, removeCookie } from "./cookie";
import type { HTTPRequestLines } from "../types";

describe("addCookie", () => {
  describe("valid input", () => {
    it("should add cookie when no Cookie header exists", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "",
        "body",
      ];

      const result = addCookie(lines, "session", "abc123");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Content-Type: application/json",
        "Cookie: session=abc123",
        "",
        "body",
      ]);
    });

    it("should add cookie to existing Cookie header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ];

      const result = addCookie(lines, "user", "john");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john",
        "",
      ]);
    });

    it("should add multiple cookies sequentially", () => {
      let lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      lines = addCookie(lines, "session", "abc123");
      lines = addCookie(lines, "user", "john");
      lines = addCookie(lines, "theme", "dark");

      expect(lines).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john; theme=dark",
        "",
      ]);
    });

    it("should add cookie to request without body", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
      ];

      const result = addCookie(lines, "session", "abc123");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
      ]);
    });

    it("should handle cookie values with special characters", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = addCookie(lines, "data", "value with spaces");

      expect(result[2]).toContain("Cookie:");
      expect(result[2]).toContain("data=");
    });

    it("should overwrite existing cookie with same name", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john",
        "",
      ];

      const result = addCookie(lines, "session", "xyz789");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=xyz789; user=john",
        "",
      ]);
    });

    it("should handle empty cookie value", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = addCookie(lines, "empty", "");

      expect(result[2]).toContain("Cookie:");
      expect(result[2]).toContain("empty=");
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => addCookie(lines, "session", "abc123")).toThrow("Request cannot be empty");
    });

    it("should throw error when cookie name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => addCookie(lines, "", "value")).toThrow("Cookie name cannot be empty");
    });

    it("should throw error when cookie name is only whitespace", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => addCookie(lines, "   ", "value")).toThrow("Cookie name cannot be empty");
    });
  });

  describe("malformed input", () => {
    it("should handle request with only request line", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      const result = addCookie(lines, "session", "abc123");

      expect(result).toEqual([
        "GET /path HTTP/1.1",
        "Cookie: session=abc123",
      ]);
    });

    it("should handle malformed Cookie header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: malformed",
        "",
      ];

      const result = addCookie(lines, "session", "abc123");

      expect(result[2]).toContain("Cookie:");
      expect(result[2]).toContain("session=abc123");
    });
  });
});

describe("setCookie", () => {
  describe("valid input", () => {
    it("should set cookie when no Cookie header exists", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setCookie(lines, "session", "abc123");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ]);
    });

    it("should update existing cookie value", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john",
        "",
      ];

      const result = setCookie(lines, "session", "xyz789");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=xyz789; user=john",
        "",
      ]);
    });

    it("should add cookie when it doesn't exist", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ];

      const result = setCookie(lines, "user", "john");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john",
        "",
      ]);
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => setCookie(lines, "session", "abc123")).toThrow("Request cannot be empty");
    });

    it("should throw error when cookie name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => setCookie(lines, "", "value")).toThrow("Cookie name cannot be empty");
    });
  });
});

describe("removeCookie", () => {
  describe("valid input", () => {
    it("should remove cookie from Cookie header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john",
        "",
      ];

      const result = removeCookie(lines, "session");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: user=john",
        "",
      ]);
    });

    it("should remove entire Cookie header when last cookie is removed", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ];

      const result = removeCookie(lines, "session");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ]);
    });

    it("should remove one of multiple cookies", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john; theme=dark",
        "",
      ];

      const result = removeCookie(lines, "user");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; theme=dark",
        "",
      ]);
    });

    it("should do nothing when cookie doesn't exist", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ];

      const result = removeCookie(lines, "nonexistent");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123",
        "",
      ]);
    });

    it("should do nothing when no Cookie header exists", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = removeCookie(lines, "session");

      expect(result).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "",
      ]);
    });

    it("should remove multiple cookies sequentially", () => {
      let lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; user=john; theme=dark; lang=en",
        "",
      ];

      lines = removeCookie(lines, "user");
      lines = removeCookie(lines, "theme");

      expect(lines).toEqual([
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: session=abc123; lang=en",
        "",
      ]);
    });
  });

  describe("edge cases", () => {
    it("should throw error when input is empty", () => {
      const lines: HTTPRequestLines = [];

      expect(() => removeCookie(lines, "session")).toThrow("Request cannot be empty");
    });

    it("should throw error when cookie name is empty", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => removeCookie(lines, "")).toThrow("Cookie name cannot be empty");
    });

    it("should throw error when cookie name is only whitespace", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      expect(() => removeCookie(lines, "   ")).toThrow("Cookie name cannot be empty");
    });
  });

  describe("malformed input", () => {
    it("should handle request with only request line", () => {
      const lines: HTTPRequestLines = ["GET /path HTTP/1.1"];

      const result = removeCookie(lines, "session");

      expect(result).toEqual(["GET /path HTTP/1.1"]);
    });

    it("should handle malformed Cookie header", () => {
      const lines: HTTPRequestLines = [
        "GET /api/users HTTP/1.1",
        "Host: example.com",
        "Cookie: malformed",
        "",
      ];

      const result = removeCookie(lines, "session");

      expect(result.length).toBe(4);
    });
  });
});

describe("cookie integration tests", () => {
  it("should add, set, and remove cookies in sequence", () => {
    let lines: HTTPRequestLines = [
      "GET /api/users HTTP/1.1",
      "Host: example.com",
      "",
    ];

    lines = addCookie(lines, "session", "abc123");
    lines = addCookie(lines, "user", "john");
    lines = setCookie(lines, "session", "xyz789");
    lines = removeCookie(lines, "user");

    expect(lines).toEqual([
      "GET /api/users HTTP/1.1",
      "Host: example.com",
      "Cookie: session=xyz789",
      "",
    ]);
  });

  it("should handle complex cookie manipulation", () => {
    let lines: HTTPRequestLines = [
      "GET /api/data HTTP/1.1",
      "Host: api.example.com",
      "Content-Type: application/json",
      "",
      '{"key":"value"}',
    ];

    lines = addCookie(lines, "auth", "token123");
    lines = addCookie(lines, "pref", "light");
    lines = addCookie(lines, "lang", "en");
    lines = setCookie(lines, "pref", "dark");
    lines = removeCookie(lines, "lang");

    expect(lines[3]).toBe("Cookie: auth=token123; pref=dark");
  });

  it("should maintain other headers when manipulating cookies", () => {
    let lines: HTTPRequestLines = [
      "POST /api/data HTTP/1.1",
      "Host: example.com",
      "Content-Type: application/json",
      "Authorization: Bearer token",
      "",
      '{"data":"value"}',
    ];

    lines = addCookie(lines, "session", "abc123");
    lines = addCookie(lines, "user", "john");

    expect(lines).toEqual([
      "POST /api/data HTTP/1.1",
      "Host: example.com",
      "Content-Type: application/json",
      "Authorization: Bearer token",
      "Cookie: session=abc123; user=john",
      "",
      '{"data":"value"}',
    ]);
  });
});
