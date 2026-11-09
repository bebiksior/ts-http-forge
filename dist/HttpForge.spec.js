import { describe, it, expect } from "vitest";
import { HttpForge } from "../src/index.js";
describe("HttpForge", () => {
    it("should chain multiple modifications fluently", () => {
        const request = "GET /api/users HTTP/1.1\r\nHost :example.com\r\nAuthorization: Bearer token\r\n\r\nbody content";
        const result = HttpForge.create(request)
            .method("POST")
            .method("PUT")
            .build();
        expect(result).toBe("PUT /api/users HTTP/1.1\r\nHost :example.com\r\nAuthorization: Bearer token\r\n\r\nbody content");
    });
    describe("line ending handling", () => {
        it("should handle pure CRLF input", () => {
            const request = "GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const result = HttpForge.create(request).method("POST").build();
            expect(result).toBe("POST /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n");
        });
        it("should handle pure LF input", () => {
            const request = "GET /api/users HTTP/1.1\nHost: example.com\n\n";
            const result = HttpForge.create(request).method("POST").build();
            expect(result).toBe("POST /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n");
        });
        it("should keep CRLF line endings inside the body", () => {
            const body = "--b\r\nContent-Disposition: form-data; name=\"a\"\r\n\r\n1\r\n--b--\r\n";
            const request = `POST /upload HTTP/1.1\r\nHost: example.com\r\n\r\n${body}`;
            const forge = HttpForge.create(request);
            expect(forge.getBody()).toBe(body);
            expect(forge.build()).toBe(request);
        });
        it("should keep LF line endings inside the body", () => {
            const body = '{\n  "a": 1\n}';
            const request = `POST /api HTTP/1.1\nHost: example.com\n\n${body}`;
            const forge = HttpForge.create(request).setHeader("X-Test", "1");
            expect(forge.getBody()).toBe(body);
            expect(forge.build()).toBe(`POST /api HTTP/1.1\r\nHost: example.com\r\nX-Test: 1\r\n\r\n${body}`);
        });
        it("should keep a lone CR inside the body", () => {
            const request = "POST /api HTTP/1.1\r\nHost: example.com\r\n\r\na\rb\r\nc\r";
            expect(HttpForge.create(request).build()).toBe(request);
        });
        it("should write a new body exactly as given", () => {
            const request = "POST /api HTTP/1.1\r\nHost: example.com\r\n\r\nold";
            const forge = HttpForge.create(request).body("line1\nline2\r\nline3");
            expect(forge.getBody()).toBe("line1\nline2\r\nline3");
            expect(forge.build()).toBe("POST /api HTTP/1.1\r\nHost: example.com\r\n\r\nline1\nline2\r\nline3");
        });
        it("should handle mixed line endings", () => {
            const request = "GET /api/users HTTP/1.1\r\nHost: example.com\nContent-Length: 0\r\n\r\n";
            const result = HttpForge.create(request).method("PUT").build();
            expect(result).toBe("PUT /api/users HTTP/1.1\r\nHost: example.com\r\nContent-Length: 0\r\n\r\n");
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
    describe("cookie chaining", () => {
        it("should chain cookie modifications fluently", () => {
            const request = `GET /api/users HTTP/1.1
Host: example.com

`;
            const result = HttpForge.create(request)
                .addCookie("session", "abc123")
                .addCookie("user", "john")
                .setCookie("session", "xyz789")
                .removeCookie("user")
                .build();
            expect(result).toBe("GET /api/users HTTP/1.1\r\nHost: example.com\r\nCookie: session=xyz789\r\n\r\n");
        });
        it("should integrate cookie modifications with other operations", () => {
            const request = `POST /api/data HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"key":"value"}`;
            const result = HttpForge.create(request)
                .addCookie("auth", "token123")
                .addCookie("pref", "light")
                .method("PUT")
                .path("/api/v2/data")
                .addQueryParam("version", "2")
                .setCookie("pref", "dark")
                .setHeader("Authorization", "Bearer token")
                .body('{"updated":"data"}')
                .build();
            expect(result).toBe('PUT /api/v2/data?version=2 HTTP/1.1\r\nHost: api.example.com\r\nContent-Type: application/json\r\nCookie: auth=token123; pref=dark\r\nAuthorization: Bearer token\r\n\r\n{"updated":"data"}');
        });
    });
    describe("reader methods", () => {
        it("should read method", () => {
            const request = "GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getMethod()).toBe("GET");
        });
        it("should read path", () => {
            const request = "GET /api/users?id=123 HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getPath()).toBe("/api/users");
        });
        it("should read query string", () => {
            const request = "GET /api/users?id=123&name=test HTTP/1.1\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getQuery()).toBe("id=123&name=test");
        });
        it("should read query params", () => {
            const request = "GET /api/users?id=123&name=test HTTP/1.1\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getQueryParams()).toEqual({ id: "123", name: "test" });
        });
        it("should read all headers", () => {
            const request = "GET /api HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getHeaders()).toEqual({
                host: ["example.com"],
                "content-type": ["application/json"],
            });
        });
        it("should read single header", () => {
            const request = "GET /api HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getHeader("Host")).toBe("example.com");
            expect(forge.getHeader("content-type")).toBe("application/json");
        });
        it("should read body", () => {
            const request = "POST /api HTTP/1.1\r\nHost: example.com\r\n\r\n{\"key\":\"value\"}";
            const forge = HttpForge.create(request);
            expect(forge.getBody()).toBe('{"key":"value"}');
        });
        it("should read cookies", () => {
            const request = "GET /api HTTP/1.1\r\nCookie: session=abc123; token=xyz789\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getCookies()).toEqual({ session: "abc123", token: "xyz789" });
        });
        it("should read single cookie", () => {
            const request = "GET /api HTTP/1.1\r\nCookie: session=abc123; token=xyz789\r\n\r\n";
            const forge = HttpForge.create(request);
            expect(forge.getCookie("session")).toBe("abc123");
            expect(forge.getCookie("token")).toBe("xyz789");
        });
        it("should read after modifications", () => {
            const request = "GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const forge = HttpForge.create(request)
                .method("POST")
                .path("/api/data")
                .addQueryParam("id", "123")
                .setHeader("Content-Type", "application/json")
                .addCookie("session", "abc")
                .body('{"test":"data"}');
            expect(forge.getMethod()).toBe("POST");
            expect(forge.getPath()).toBe("/api/data");
            expect(forge.getQueryParams()).toEqual({ id: "123" });
            expect(forge.getHeader("Content-Type")).toBe("application/json");
            expect(forge.getCookie("session")).toBe("abc");
            expect(forge.getBody()).toBe('{"test":"data"}');
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
            expect(result).toBe(`POST /new/api/endpoint?completely=new&query=string&new=value HTTP/1.1\r\nHost: newhost.com\r\nX-Weird-Header  :   value with   spaces\r\nContent-Type: application/json\r\nX-Custom: header-value\r\nContent-Length: 25\r\n\r\n{"updated": "content"}`);
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
                .body("<data><status>updated</status></data>")
                .build();
            expect(result).toBe(`PUT /api/v2/test?reset=true&version=2.0&debug=true HTTP/1.0\r\nHost: api.example.com\r\nConnection: keep-alive\r\nContent-Type: application/xml\r\nX-API-Version: v2\r\nCache-Control: no-cache\r\n\r\n<data><status>updated</status></data>`);
        });
    });
});
