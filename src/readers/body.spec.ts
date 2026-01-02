import { describe, it, expect } from "vitest";
import { getBody, findBodyStartIndex } from "./body";

describe("getBody", () => {
  it("should extract simple body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
      "",
      "request body",
    ];
    expect(getBody(lines)).toBe("request body");
  });

  it("should extract multiline body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
      "",
      "line 1",
      "line 2",
      "line 3",
    ];
    expect(getBody(lines)).toBe("line 1\nline 2\nline 3");
  });

  it("should extract JSON body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Content-Type: application/json",
      "",
      '{"key":"value"}',
    ];
    expect(getBody(lines)).toBe('{"key":"value"}');
  });

  it("should return null when no body", () => {
    const lines = [
      "GET /api HTTP/1.1",
      "Host: example.com",
      "",
    ];
    expect(getBody(lines)).toBeNull();
  });

  it("should return null for empty lines", () => {
    const lines: string[] = [];
    expect(getBody(lines)).toBeNull();
  });

  it("should return null when only blank line in body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
      "",
      "",
    ];
    expect(getBody(lines)).toBeNull();
  });

  it("should handle body with empty lines", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
      "line 1",
      "",
      "line 3",
    ];
    expect(getBody(lines)).toBe("line 1\n\nline 3");
  });

  it("should handle request without headers", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
      "body content",
    ];
    expect(getBody(lines)).toBe("body content");
  });

  it("should preserve whitespace in body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
      "  indented  ",
      "normal",
    ];
    expect(getBody(lines)).toBe("  indented  \nnormal");
  });

  it("should handle XML body", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
      "<?xml version=\"1.0\"?>",
      "<root>",
      "  <data>value</data>",
      "</root>",
    ];
    expect(getBody(lines)).toBe(
      '<?xml version="1.0"?>\n<root>\n  <data>value</data>\n</root>'
    );
  });

  it("should return null for request with only request line", () => {
    const lines = ["GET /api HTTP/1.1"];
    expect(getBody(lines)).toBeNull();
  });
});

describe("findBodyStartIndex", () => {
  it("should find body start after headers", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
      "Content-Type: application/json",
      "",
      "body",
    ];
    expect(findBodyStartIndex(lines)).toBe(4);
  });

  it("should find body start with no headers", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
      "body",
    ];
    expect(findBodyStartIndex(lines)).toBe(2);
  });

  it("should return length when no empty line", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
    ];
    expect(findBodyStartIndex(lines)).toBe(2);
  });

  it("should handle immediate empty line", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "",
    ];
    expect(findBodyStartIndex(lines)).toBe(2);
  });

  it("should find first empty line", () => {
    const lines = [
      "POST /api HTTP/1.1",
      "Host: example.com",
      "",
      "",
      "body",
    ];
    expect(findBodyStartIndex(lines)).toBe(3);
  });
});
