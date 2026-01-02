import { describe, it, expect } from "vitest";
import { getHeaders, getHeader, findHeaderIndex, findHeaderInsertIndex } from "./headers";
describe("getHeaders", () => {
    it("should extract all headers", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "Content-Type: application/json",
            "Authorization: Bearer token",
            "",
            "body",
        ];
        expect(getHeaders(lines)).toEqual({
            host: ["example.com"],
            "content-type": ["application/json"],
            authorization: ["Bearer token"],
        });
    });
    it("should handle multiple headers with same name", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Set-Cookie: session=abc",
            "Set-Cookie: token=xyz",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            "set-cookie": ["session=abc", "token=xyz"],
        });
    });
    it("should handle headers with colons in value", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "X-Custom: value:with:colons",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            "x-custom": ["value:with:colons"],
        });
    });
    it("should return null for empty lines", () => {
        const lines = [];
        expect(getHeaders(lines)).toBeNull();
    });
    it("should handle request with no headers", () => {
        const lines = ["GET /api HTTP/1.1", "", "body"];
        expect(getHeaders(lines)).toEqual({});
    });
    it("should handle request with only request line", () => {
        const lines = ["GET /api HTTP/1.1"];
        expect(getHeaders(lines)).toEqual({});
    });
    it("should skip malformed header lines", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Valid-Header: value",
            "InvalidHeaderNoColon",
            "Another-Valid: value",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            "valid-header": ["value"],
            "another-valid": ["value"],
        });
    });
    it("should trim header names and values", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "  Host  :  example.com  ",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            host: ["example.com"],
        });
    });
    it("should handle empty header value", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "X-Empty:",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            "x-empty": [""],
        });
    });
    it("should normalize header names to lowercase", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Content-Type: application/json",
            "AUTHORIZATION: Bearer token",
            "x-custom-header: value",
            "",
        ];
        expect(getHeaders(lines)).toEqual({
            "content-type": ["application/json"],
            authorization: ["Bearer token"],
            "x-custom-header": ["value"],
        });
    });
});
describe("getHeader", () => {
    it("should get single header value", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "Content-Type: application/json",
            "",
        ];
        expect(getHeader(lines, "Host")).toBe("example.com");
    });
    it("should be case-insensitive", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Content-Type: application/json",
            "",
        ];
        expect(getHeader(lines, "content-type")).toBe("application/json");
        expect(getHeader(lines, "CONTENT-TYPE")).toBe("application/json");
        expect(getHeader(lines, "Content-Type")).toBe("application/json");
    });
    it("should return first value for duplicate headers", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Set-Cookie: first=value",
            "Set-Cookie: second=value",
            "",
        ];
        expect(getHeader(lines, "Set-Cookie")).toBe("first=value");
    });
    it("should return null for non-existent header", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
        ];
        expect(getHeader(lines, "Authorization")).toBeNull();
    });
    it("should return null for empty lines", () => {
        const lines = [];
        expect(getHeader(lines, "Host")).toBeNull();
    });
});
describe("findHeaderIndex", () => {
    it("should find header index", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "Content-Type: application/json",
            "",
        ];
        expect(findHeaderIndex(lines, "Content-Type")).toBe(2);
    });
    it("should be case-insensitive", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Content-Type: application/json",
            "",
        ];
        expect(findHeaderIndex(lines, "content-type")).toBe(1);
        expect(findHeaderIndex(lines, "CONTENT-TYPE")).toBe(1);
    });
    it("should return -1 for non-existent header", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
        ];
        expect(findHeaderIndex(lines, "Authorization")).toBe(-1);
    });
    it("should return first occurrence for duplicate headers", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Set-Cookie: first",
            "Set-Cookie: second",
            "",
        ];
        expect(findHeaderIndex(lines, "Set-Cookie")).toBe(1);
    });
    it("should stop at empty line", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
            "Host: in-body",
        ];
        expect(findHeaderIndex(lines, "Host")).toBe(1);
    });
});
describe("findHeaderInsertIndex", () => {
    it("should return index before empty line", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
            "body",
        ];
        expect(findHeaderInsertIndex(lines)).toBe(2);
    });
    it("should return end of array if no empty line", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
        ];
        expect(findHeaderInsertIndex(lines)).toBe(2);
    });
    it("should handle request with only request line", () => {
        const lines = ["GET /api HTTP/1.1"];
        expect(findHeaderInsertIndex(lines)).toBe(1);
    });
    it("should handle immediate empty line after request", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "",
            "body",
        ];
        expect(findHeaderInsertIndex(lines)).toBe(1);
    });
});
