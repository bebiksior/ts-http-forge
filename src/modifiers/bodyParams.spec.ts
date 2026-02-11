import { describe, it, expect } from "vitest";
import { setBodyParam, removeBodyParam } from "./bodyParams.js";
import type { HTTPRequestLines } from "../types.js";

describe("setBodyParam", () => {
  describe("json body", () => {
    it("should add param to existing json body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"existing": "value"}',
      ];

      const result = setBodyParam(lines, "token", "abc123");

      expect(result).toContain("POST /api HTTP/1.1");
      const bodyLine = result[result.length - 1];
      const body = JSON.parse(bodyLine);
      expect(body.token).toBe("abc123");
      expect(body.existing).toBe("value");
    });

    it("should update existing param in json body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"token": "old"}',
      ];

      const result = setBodyParam(lines, "token", "new");

      const bodyLine = result[result.length - 1];
      const body = JSON.parse(bodyLine);
      expect(body.token).toBe("new");
    });

    it("should create json body when no body exists", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc123");

      expect(result).toContain("Content-Type: application/json");
      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe('{"token":"abc123"}');
    });
  });

  describe("urlencoded body", () => {
    it("should add param to existing urlencoded body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "existing=value",
      ];

      const result = setBodyParam(lines, "token", "abc123");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("existing=value&token=abc123");
    });

    it("should update existing param in urlencoded body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "token=old&other=value",
      ];

      const result = setBodyParam(lines, "token", "new");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("token=new&other=value");
    });

    it("should encode special characters in urlencoded", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "key=value",
      ];

      const result = setBodyParam(lines, "email", "test@example.com");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toContain("email=test%40example.com");
    });

    it("should create urlencoded body when specified", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc", {
        defaultBodyType: "urlencoded",
      });

      expect(result).toContain("Content-Type: application/x-www-form-urlencoded");
      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("token=abc");
    });
  });

  describe("method handling", () => {
    it("should change GET to POST by default", () => {
      const lines: HTTPRequestLines = [
        "GET /api HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[0]).toBe("POST /api HTTP/1.1");
    });

    it("should change GET to custom method when specified", () => {
      const lines: HTTPRequestLines = [
        "GET /api HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc", {
        defaultMethod: "PUT",
      });

      expect(result[0]).toBe("PUT /api HTTP/1.1");
    });

    it("should not change POST method", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[0]).toBe("POST /api HTTP/1.1");
    });

    it("should change HEAD to default method", () => {
      const lines: HTTPRequestLines = [
        "HEAD /api HTTP/1.1",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[0]).toBe("POST /api HTTP/1.1");
    });
  });

  describe("content-type header", () => {
    it("should add content-type when missing", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Host: example.com",
        "",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result).toContain("Content-Type: application/json");
    });

    it("should not duplicate content-type header", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"existing": "value"}',
      ];

      const result = setBodyParam(lines, "token", "abc");

      const contentTypeCount = result.filter((l) =>
        l.toLowerCase().startsWith("content-type:")
      ).length;
      expect(contentTypeCount).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should throw for empty lines", () => {
      expect(() => setBodyParam([], "key", "value")).toThrow(
        "Request cannot be empty"
      );
    });

    it("should throw for empty param name", () => {
      const lines: HTTPRequestLines = ["POST /api HTTP/1.1"];

      expect(() => setBodyParam(lines, "", "value")).toThrow(
        "Parameter name cannot be empty"
      );
    });

    it("should throw for whitespace-only param name", () => {
      const lines: HTTPRequestLines = ["POST /api HTTP/1.1"];

      expect(() => setBodyParam(lines, "   ", "value")).toThrow(
        "Parameter name cannot be empty"
      );
    });

    it("should handle empty value", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"key": "value"}',
      ];

      const result = setBodyParam(lines, "empty", "");

      const bodyLine = result[result.length - 1];
      const body = JSON.parse(bodyLine);
      expect(body.empty).toBe("");
    });

    it("should handle value with special characters", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        "{}",
      ];

      const result = setBodyParam(lines, "data", '{"nested": true}');

      const bodyLine = result[result.length - 1];
      const body = JSON.parse(bodyLine);
      expect(body.data).toBe('{"nested": true}');
    });
  });

  describe("invalid/malformed body handling", () => {
    it("should preserve invalid JSON and use default body type", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        "{not valid json",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[result.length - 1]).toBe("{not valid json");
    });

    it("should preserve unparseable body when it cannot be modified", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "",
        "random garbage",
        "multiline",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[result.length - 1]).toBe("multiline");
    });

    it("should infer urlencoded and modify single-line body with equals", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "",
        "existing=value",
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result).toContain("Content-Type: application/x-www-form-urlencoded");
      expect(result[result.length - 1]).toBe("existing=value&token=abc");
    });

    it("should handle JSON array body by preserving it", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '["a", "b", "c"]',
      ];

      const result = setBodyParam(lines, "token", "abc");

      expect(result[result.length - 1]).toBe('["a", "b", "c"]');
    });

    it("should handle request with only request line", () => {
      const lines: HTTPRequestLines = ["POST /api HTTP/1.1"];

      const result = setBodyParam(lines, "token", "abc");

      expect(result).toContain("Content-Type: application/json");
      expect(result[result.length - 1]).toBe('{"token":"abc"}');
    });

    it("should handle malformed urlencoded gracefully", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "not&properly=formatted&=weird",
      ];

      const result = setBodyParam(lines, "new", "value");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toContain("new=value");
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"key": "value"}',
      ];
      const original = [...lines];

      setBodyParam(lines, "new", "param");

      expect(lines).toEqual(original);
    });
  });
});

describe("removeBodyParam", () => {
  describe("json body", () => {
    it("should remove param from json body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"token": "abc", "other": "value"}',
      ];

      const result = removeBodyParam(lines, "token");

      const bodyLine = result[result.length - 1];
      const body = JSON.parse(bodyLine);
      expect(body.token).toBeUndefined();
      expect(body.other).toBe("value");
    });

    it("should return original when param not found", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"key": "value"}',
      ];

      const result = removeBodyParam(lines, "nonexistent");

      expect(result).toBe(lines);
    });
  });

  describe("urlencoded body", () => {
    it("should remove param from urlencoded body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "token=abc&other=value",
      ];

      const result = removeBodyParam(lines, "token");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("other=value");
    });

    it("should handle removing first param", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "first=1&second=2&third=3",
      ];

      const result = removeBodyParam(lines, "first");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("second=2&third=3");
    });

    it("should handle removing last param", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "first=1&second=2&third=3",
      ];

      const result = removeBodyParam(lines, "third");

      const bodyLine = result[result.length - 1];
      expect(bodyLine).toBe("first=1&second=2");
    });
  });

  describe("edge cases", () => {
    it("should throw for empty lines", () => {
      expect(() => removeBodyParam([], "key")).toThrow(
        "Request cannot be empty"
      );
    });

    it("should throw for empty param name", () => {
      const lines: HTTPRequestLines = ["POST /api HTTP/1.1"];

      expect(() => removeBodyParam(lines, "")).toThrow(
        "Parameter name cannot be empty"
      );
    });

    it("should return original for request without body", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "",
      ];

      const result = removeBodyParam(lines, "key");

      expect(result).toBe(lines);
    });

    it("should return original for unknown body type", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "",
        "plain text body",
      ];

      const result = removeBodyParam(lines, "key");

      expect(result).toBe(lines);
    });
  });

  describe("array immutability", () => {
    it("should not mutate original lines", () => {
      const lines: HTTPRequestLines = [
        "POST /api HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"key": "value", "other": "data"}',
      ];
      const original = [...lines];

      removeBodyParam(lines, "key");

      expect(lines).toEqual(original);
    });
  });
});
