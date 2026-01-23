import { describe, it, expect } from "vitest";
import { getBodyType, getBodyParams, getBodyParam, inferBodyType } from "./bodyParams";
describe("getBodyType", () => {
    describe("content-type header detection", () => {
        it("should detect json from content-type header", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '{"key": "value"}',
            ];
            expect(getBodyType(lines)).toBe("json");
        });
        it("should detect json with charset", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json; charset=utf-8",
                "",
                '{"key": "value"}',
            ];
            expect(getBodyType(lines)).toBe("json");
        });
        it("should detect urlencoded from content-type header", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "key=value",
            ];
            expect(getBodyType(lines)).toBe("urlencoded");
        });
        it("should be case-insensitive for content-type", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "content-type: APPLICATION/JSON",
                "",
                '{"key": "value"}',
            ];
            expect(getBodyType(lines)).toBe("json");
        });
    });
    describe("body inference", () => {
        it("should infer json from body structure", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Host: example.com",
                "",
                '{"key": "value"}',
            ];
            expect(getBodyType(lines)).toBe("json");
        });
        it("should infer json array", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "",
                '["a", "b", "c"]',
            ];
            expect(getBodyType(lines)).toBe("json");
        });
        it("should infer urlencoded from body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "",
                "key=value&foo=bar",
            ];
            expect(getBodyType(lines)).toBe("urlencoded");
        });
        it("should return unknown for plain text", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "",
                "just some text",
            ];
            expect(getBodyType(lines)).toBe("unknown");
        });
    });
    describe("edge cases", () => {
        it("should return null for empty lines", () => {
            expect(getBodyType([])).toBeNull();
        });
        it("should return null for request without body", () => {
            const lines = [
                "GET /api HTTP/1.1",
                "Host: example.com",
                "",
            ];
            expect(getBodyType(lines)).toBeNull();
        });
        it("should return json for content-type even with invalid json body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                "{not valid json at all",
            ];
            expect(getBodyType(lines)).toBe("json");
        });
        it("should return urlencoded for content-type even with weird body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "this is not urlencoded",
            ];
            expect(getBodyType(lines)).toBe("urlencoded");
        });
        it("should handle whitespace-only body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "",
                "   ",
            ];
            expect(getBodyType(lines)).toBeNull();
        });
    });
});
describe("inferBodyType", () => {
    it("should detect valid JSON object", () => {
        expect(inferBodyType('{"key": "value"}')).toBe("json");
    });
    it("should detect valid JSON array", () => {
        expect(inferBodyType("[1, 2, 3]")).toBe("json");
    });
    it("should detect urlencoded", () => {
        expect(inferBodyType("foo=bar&baz=qux")).toBe("urlencoded");
    });
    it("should return unknown for invalid JSON that looks like JSON", () => {
        expect(inferBodyType("{invalid json}")).toBe("unknown");
    });
    it("should return unknown for multiline content", () => {
        expect(inferBodyType("foo=bar\nbaz=qux")).toBe("unknown");
    });
    it("should return unknown for content without equals", () => {
        expect(inferBodyType("just text")).toBe("unknown");
    });
    it("should return unknown for truncated JSON", () => {
        expect(inferBodyType('{"key": "val')).toBe("unknown");
    });
    it("should return unknown for JSON with trailing garbage", () => {
        expect(inferBodyType('{"key": "value"}extra')).toBe("unknown");
    });
    it("should handle empty string", () => {
        expect(inferBodyType("")).toBe("unknown");
    });
    it("should handle single equals sign", () => {
        expect(inferBodyType("=")).toBe("urlencoded");
    });
    it("should handle urlencoded with empty value", () => {
        expect(inferBodyType("key=")).toBe("urlencoded");
    });
    it("should handle urlencoded with empty key", () => {
        expect(inferBodyType("=value")).toBe("urlencoded");
    });
});
describe("getBodyParams", () => {
    describe("json body", () => {
        it("should parse json object params", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '{"name": "John", "age": "30"}',
            ];
            expect(getBodyParams(lines)).toEqual({ name: "John", age: "30" });
        });
        it("should convert numbers to strings", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '{"count": 42, "active": true}',
            ];
            expect(getBodyParams(lines)).toEqual({ count: "42", active: "true" });
        });
        it("should return null for json array", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '["a", "b"]',
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
    });
    describe("urlencoded body", () => {
        it("should parse urlencoded params", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "name=John&city=NYC",
            ];
            expect(getBodyParams(lines)).toEqual({ name: "John", city: "NYC" });
        });
        it("should decode url-encoded values", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "email=test%40example.com&name=John%20Doe",
            ];
            expect(getBodyParams(lines)).toEqual({
                email: "test@example.com",
                name: "John Doe",
            });
        });
    });
    describe("edge cases", () => {
        it("should return null for empty lines", () => {
            expect(getBodyParams([])).toBeNull();
        });
        it("should return null for unknown body type", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "",
                "plain text body",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should return null for empty body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
    });
    describe("invalid/malformed body", () => {
        it("should return null for invalid JSON", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                "{not valid json}",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should return null for truncated JSON", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '{"key": "value',
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should return null for JSON primitive", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '"just a string"',
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should return null for JSON null", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                "null",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should skip nested objects in JSON", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/json",
                "",
                '{"simple": "value", "nested": {"a": "b"}}',
            ];
            const result = getBodyParams(lines);
            expect(result).toEqual({ simple: "value" });
        });
        it("should handle urlencoded with invalid encoding gracefully", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "key=%ZZ&valid=value",
            ];
            expect(() => getBodyParams(lines)).toThrow();
        });
        it("should handle empty urlencoded body", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
        it("should handle urlencoded with only ampersands", () => {
            const lines = [
                "POST /api HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
                "&&&",
            ];
            expect(getBodyParams(lines)).toBeNull();
        });
    });
});
describe("getBodyParam", () => {
    it("should get single param from json body", () => {
        const lines = [
            "POST /api HTTP/1.1",
            "Content-Type: application/json",
            "",
            '{"token": "abc123", "user": "john"}',
        ];
        expect(getBodyParam(lines, "token")).toBe("abc123");
    });
    it("should get single param from urlencoded body", () => {
        const lines = [
            "POST /api HTTP/1.1",
            "Content-Type: application/x-www-form-urlencoded",
            "",
            "access_token=xyz789&user_id=123",
        ];
        expect(getBodyParam(lines, "access_token")).toBe("xyz789");
    });
    it("should return null for non-existent param", () => {
        const lines = [
            "POST /api HTTP/1.1",
            "Content-Type: application/json",
            "",
            '{"name": "John"}',
        ];
        expect(getBodyParam(lines, "nonexistent")).toBeNull();
    });
    it("should return null for empty lines", () => {
        expect(getBodyParam([], "key")).toBeNull();
    });
});
