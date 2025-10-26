import { describe, it, expect } from "vitest";
import { setBody } from "./body";
describe("setBody", () => {
    describe("valid input", () => {
        it("should replace body in request with existing body", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "",
                '{"old": "body"}',
            ];
            const result = setBody(lines, '{"new": "body"}');
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "",
                '{"new": "body"}',
            ]);
        });
        it("should add body to request without existing body", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "",
            ];
            const result = setBody(lines, '{"name": "john"}');
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "",
                '{"name": "john"}',
            ]);
        });
        it("should handle multiline body content", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
            ];
            const multilineBody = "line1\nline2\nline3";
            const result = setBody(lines, multilineBody);
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "line1",
                "line2",
                "line3",
            ]);
        });
        it("should handle body with CRLF line endings", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
            ];
            const crlfBody = "line1\r\nline2\r\nline3";
            const result = setBody(lines, crlfBody);
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "line1",
                "line2",
                "line3",
            ]);
        });
        it("should remove body when empty string provided", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "old body content",
            ];
            const result = setBody(lines, "");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "",
            ]);
        });
        it("should remove body when only whitespace provided", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "old body content",
            ];
            const result = setBody(lines, "   \n  \t  ");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "",
            ]);
        });
        it("should replace multiline body with single line", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "old line 1",
                "old line 2",
                "old line 3",
            ];
            const result = setBody(lines, "new single line");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "new single line",
            ]);
        });
        it("should handle body with special characters", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
            ];
            const specialBody = 'body with "quotes" & symbols <> []';
            const result = setBody(lines, specialBody);
            expect(result[3]).toBe('body with "quotes" & symbols <> []');
        });
        it("should handle setting empty body", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "old body content",
            ];
            const result = setBody(lines, "");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "",
            ]);
        });
    });
    describe("edge cases", () => {
        it("should throw error when input is empty", () => {
            const lines = [];
            expect(() => setBody(lines, "body")).toThrow("Request cannot be empty");
        });
        it("should throw error when body is null", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setBody(lines, null)).toThrow("Body cannot be null or undefined");
        });
        it("should throw error when body is undefined", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setBody(lines, undefined)).toThrow("Body cannot be null or undefined");
        });
        it("should handle request without headers (no empty line)", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = setBody(lines, "new body");
            expect(result).toEqual(["GET /api/users HTTP/1.1", "new body"]);
        });
        it("should handle request with only method line and empty line", () => {
            const lines = ["GET /api/users HTTP/1.1", ""];
            const result = setBody(lines, "body content");
            expect(result).toEqual(["GET /api/users HTTP/1.1", "", "body content"]);
        });
        it("should handle request with headers but no empty line separator", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
            ];
            const result = setBody(lines, '{"data": "value"}');
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                '{"data": "value"}',
            ]);
        });
        it("should find body after first empty line even with multiple empty lines", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "",
                "old body",
            ];
            const result = setBody(lines, "new body");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "new body",
            ]);
        });
    });
    describe("malformed input preservation", () => {
        it("should handle malformed headers gracefully", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "MalformedHeader",
                "Host: example.com",
                "",
                "old body",
            ];
            const result = setBody(lines, "new body");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "MalformedHeader",
                "Host: example.com",
                "",
                "new body",
            ]);
        });
        it("should preserve request line format", () => {
            const lines = [
                "POST    /api/users    HTTP/1.1",
                "",
                "old body",
            ];
            const result = setBody(lines, "new body");
            expect(result).toEqual([
                "POST    /api/users    HTTP/1.1",
                "",
                "new body",
            ]);
        });
        it("should handle requests with headers containing colons in values", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Authorization: Bearer abc:def:ghi",
                "Custom-Header: http://example.com:8080",
                "",
                "old body",
            ];
            const result = setBody(lines, "new body");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Authorization: Bearer abc:def:ghi",
                "Custom-Header: http://example.com:8080",
                "",
                "new body",
            ]);
        });
        it("should handle body with only empty lines", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "",
                "",
            ];
            const result = setBody(lines, "actual content");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "actual content",
            ]);
        });
    });
    describe("body content handling", () => {
        it("should handle JSON body content", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Content-Type: application/json",
                "",
            ];
            const jsonBody = '{\n  "name": "John",\n  "age": 30\n}';
            const result = setBody(lines, jsonBody);
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Content-Type: application/json",
                "",
                "{",
                '  "name": "John",',
                '  "age": 30',
                "}",
            ]);
        });
        it("should handle XML body content", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Content-Type: application/xml",
                "",
            ];
            const xmlBody = "<user>\n  <name>John</name>\n</user>";
            const result = setBody(lines, xmlBody);
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Content-Type: application/xml",
                "",
                "<user>",
                "  <name>John</name>",
                "</user>",
            ]);
        });
        it("should handle form data body", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Content-Type: application/x-www-form-urlencoded",
                "",
            ];
            const result = setBody(lines, "name=John&age=30&email=john%40example.com");
            expect(result[3]).toBe("name=John&age=30&email=john%40example.com");
        });
        it("should handle binary-like content", () => {
            const lines = [
                "POST /api/upload HTTP/1.1",
                "Content-Type: application/octet-stream",
                "",
            ];
            const binaryContent = "\\x00\\x01\\x02\\xFF";
            const result = setBody(lines, binaryContent);
            expect(result[3]).toBe("\\x00\\x01\\x02\\xFF");
        });
    });
    describe("array immutability", () => {
        it("should not mutate original lines array", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "old body",
            ];
            const originalLines = [...lines];
            setBody(lines, "new body");
            expect(lines).toEqual(originalLines);
        });
        it("should return new array reference", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "",
                "old body",
            ];
            const result = setBody(lines, "new body");
            expect(result).not.toBe(lines);
        });
        it("should create new array even when removing body", () => {
            const lines = [
                "POST /api/users HTTP/1.1",
                "",
                "old body",
            ];
            const result = setBody(lines, "");
            expect(result).not.toBe(lines);
        });
    });
});
