import { describe, it, expect } from "vitest";
import { HttpForge } from "../src/index";

describe("HttpForge", () => {
  it("should chain multiple modifications fluently", () => {
    const request =
      "GET /api/users HTTP/1.1\r\nHost :example.com\r\nAuthorization: Bearer token\r\n\r\nbody content";

    const result = HttpForge.create(request)
      .method("POST")
      .method("PUT")
      .build();

    expect(result).toBe(
      "PUT /api/users HTTP/1.1\r\nHost :example.com\r\nAuthorization: Bearer token\r\n\r\nbody content"
    );
  });

  describe("line ending handling", () => {
    it("should handle pure CRLF input", () => {
      const request = "GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n";

      const result = HttpForge.create(request).method("POST").build();

      expect(result).toBe(
        "POST /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n"
      );
    });

    it("should handle pure LF input", () => {
      const request = "GET /api/users HTTP/1.1\nHost: example.com\n\n";

      const result = HttpForge.create(request).method("POST").build();

      expect(result).toBe(
        "POST /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n"
      );
    });

    it("should handle mixed line endings", () => {
      const request =
        "GET /api/users HTTP/1.1\r\nHost: example.com\nContent-Length: 0\r\n\r\n";

      const result = HttpForge.create(request).method("PUT").build();

      expect(result).toBe(
        "PUT /api/users HTTP/1.1\r\nHost: example.com\r\nContent-Length: 0\r\n\r\n"
      );
    });

    it("should throw an error if the request is empty", () => {
      expect(() => HttpForge.create("")).toThrow("Request cannot be empty");
    });

    it("should handle single line without line endings", () => {
      const request = "GET /api/users HTTP/1.1";

      const result = HttpForge.create(request).method("DELETE").build();

      expect(result).toBe("DELETE /api/users HTTP/1.1");
    });
  });

  describe("complex chaining scenarios", () => {
    it("should handle malformed request with all modifications and preserve odd syntax", () => {
      const request = `PATCH /api/../weird%20path?old=param&malformed=%XX HTTP/1.1
Host:   example.com
X-Weird-Header  :   value with   spaces
Content-Type: application/json
Authorization:Bearer token123

{"old": "body"}`;

      const result = HttpForge.create(request)
        .method("POST")
        .path("/new/api/endpoint")
        .removeQueryParam("old")
        .addQueryParam("new", "value")
        .addQueryParam("special", "char&=test")
        .setQuery("completely=new&query=string")
        .setHeader("Host", "newhost.com")
        .addHeader("X-Custom", "header-value")
        .removeHeader("Authorization")
        .addHeader("Content-Length", "25")
        .body('{"updated": "content"}')
        .upsertQueryParam("new", "value")
        .build();

      expect(result).toBe(
        `POST /new/api/endpoint?completely=new&query=string&new=value HTTP/1.1\r\nHost: newhost.com\r\nX-Weird-Header  :   value with   spaces\r\nContent-Type: application/json\r\nX-Custom: header-value\r\nContent-Length: 25\r\n\r\n{"updated": "content"}`
      );
    });

    it("should handle request with duplicate headers and malformed query params", () => {
      const request = `OPTIONS /api/test?param1=value1&param1=value2&=empty&invalid= HTTP/1.0
Host: api.example.com
Accept: */*
Accept: application/json
X-Duplicate: first
X-Duplicate: second
Connection: keep-alive

original body content`;

      const result = HttpForge.create(request)
        .method("PUT")
        .path("/api/v2/test")
        .removeQueryParam("param1")
        .addQueryParam("version", "2.0")
        .addQueryParam("debug", "true")
        .setQuery("reset=true&version=2.0&debug=true")
        .removeHeader("Accept")
        .setHeader("Content-Type", "application/xml")
        .addHeader("X-API-Version", "v2")
        .removeHeader("X-Duplicate")
        .addHeader("Cache-Control", "no-cache")
        .body('<data><status>updated</status></data>')
        .build();

      expect(result).toBe(
        `PUT /api/v2/test?reset=true&version=2.0&debug=true HTTP/1.0\r\nHost: api.example.com\r\nConnection: keep-alive\r\nContent-Type: application/xml\r\nX-API-Version: v2\r\nCache-Control: no-cache\r\n\r\n<data><status>updated</status></data>`
      );
    });
  });
});
