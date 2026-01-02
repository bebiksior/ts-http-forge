import { describe, it, expect } from "vitest";
import { getCookies, getCookie } from "./cookie";
describe("getCookies", () => {
    it("should extract all cookies", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: session=abc123; token=xyz789",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            session: "abc123",
            token: "xyz789",
        });
    });
    it("should return null when no Cookie header", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
        ];
        expect(getCookies(lines)).toBeNull();
    });
    it("should return null for empty lines", () => {
        const lines = [];
        expect(getCookies(lines)).toBeNull();
    });
    it("should handle single cookie", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: session=abc123",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            session: "abc123",
        });
    });
    it("should handle cookie with special characters", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: data=value%3Dtest",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            data: "value=test",
        });
    });
    it("should handle multiple cookies with spaces", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: a=1; b=2; c=3",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            a: "1",
            b: "2",
            c: "3",
        });
    });
    it("should handle empty cookie value", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: empty=; notempty=value",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            empty: "",
            notempty: "value",
        });
    });
    it("should handle cookie header case-insensitively", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "cookie: session=abc",
            "",
        ];
        expect(getCookies(lines)).toEqual({
            session: "abc",
        });
    });
});
describe("getCookie", () => {
    it("should get specific cookie", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: session=abc123; token=xyz789",
            "",
        ];
        expect(getCookie(lines, "session")).toBe("abc123");
        expect(getCookie(lines, "token")).toBe("xyz789");
    });
    it("should return null for non-existent cookie", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: session=abc123",
            "",
        ];
        expect(getCookie(lines, "nonexistent")).toBeNull();
    });
    it("should return null when no Cookie header", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Host: example.com",
            "",
        ];
        expect(getCookie(lines, "session")).toBeNull();
    });
    it("should return null for empty lines", () => {
        const lines = [];
        expect(getCookie(lines, "session")).toBeNull();
    });
    it("should handle cookie with empty value", () => {
        const lines = [
            "GET /api HTTP/1.1",
            "Cookie: empty=; notempty=value",
            "",
        ];
        expect(getCookie(lines, "empty")).toBe("");
        expect(getCookie(lines, "notempty")).toBe("value");
    });
});
