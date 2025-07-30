import { describe, it, expect } from "vitest";
import { setMethod } from "./method";
describe("setMethod", () => {
    describe("valid input", () => {
        it("should replace method in standard request line", () => {
            const lines = [
                "GET /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "body content",
            ];
            const result = setMethod(lines, "POST");
            expect(result).toEqual([
                "POST /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "body content",
            ]);
        });
        it("should replace method with different HTTP methods", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(setMethod(lines, "DELETE")[0]).toBe("DELETE /path HTTP/1.1");
            expect(setMethod(lines, "PUT")[0]).toBe("PUT /path HTTP/1.1");
            expect(setMethod(lines, "PATCH")[0]).toBe("PATCH /path HTTP/1.1");
            expect(setMethod(lines, "HEAD")[0]).toBe("HEAD /path HTTP/1.1");
            expect(setMethod(lines, "OPTIONS")[0]).toBe("OPTIONS /path HTTP/1.1");
        });
        it("should throw an error if the method contains spaces", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setMethod(lines, "POST PUT")).toThrow("Method cannot contain spaces");
        });
        it("should handle custom HTTP methods", () => {
            const lines = ["GET /path HTTP/1.1"];
            const result = setMethod(lines, "CUSTOM");
            expect(result[0]).toBe("CUSTOM /path HTTP/1.1");
        });
        it("should preserve multiple spaces after method", () => {
            const lines = ["GET    /path    HTTP/1.1"];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST    /path    HTTP/1.1");
        });
        it("should preserve original formatting and headers", () => {
            const lines = [
                "GET /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "Authorization: Bearer token",
                "",
                '{"key": "value"}',
            ];
            const result = setMethod(lines, "PUT");
            expect(result).toEqual([
                "PUT /api/users HTTP/1.1",
                "Host: example.com",
                "Content-Type: application/json",
                "Authorization: Bearer token",
                "",
                '{"key": "value"}',
            ]);
        });
    });
    describe("edge cases", () => {
        it("should return original lines when input is empty", () => {
            const lines = [];
            expect(() => setMethod(lines, "POST")).toThrow("Request cannot be empty");
        });
        it("should return original lines when method is empty", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setMethod(lines, "")).toThrow("Method cannot be empty");
        });
        it("should return original lines when method is only whitespace", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setMethod(lines, "   ")).toThrow("Method cannot be empty");
        });
        it("should handle request line with no spaces (malformed)", () => {
            const lines = ["MALFORMED"];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST");
        });
        it("should handle request line with only method", () => {
            const lines = ["GET"];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST");
        });
        it("should handle empty request line", () => {
            const lines = [""];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST");
        });
        it("should handle unusual characters in existing method", () => {
            const lines = ["G3T /path HTTP/1.1"];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST /path HTTP/1.1");
        });
        it("should handle very long method names", () => {
            const lines = ["VERYLONGMETHODNAME /path HTTP/1.1"];
            const result = setMethod(lines, "GET");
            expect(result[0]).toBe("GET /path HTTP/1.1");
        });
    });
    describe("malformed input preservation", () => {
        it("should preserve malformed HTTP version", () => {
            const lines = ["GET /path HTTP/9.9"];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST /path HTTP/9.9");
        });
        it("should preserve malformed paths", () => {
            const lines = ["GET ///weird//path HTTP/1.1"];
            const result = setMethod(lines, "DELETE");
            expect(result[0]).toBe("DELETE ///weird//path HTTP/1.1");
        });
        it("should preserve query parameters", () => {
            const lines = [
                "GET /path?param=value&other=test HTTP/1.1",
            ];
            const result = setMethod(lines, "POST");
            expect(result[0]).toBe("POST /path?param=value&other=test HTTP/1.1");
        });
        it("should preserve fragments and unusual characters", () => {
            const lines = ["GET /path#fragment?weird HTTP/1.1"];
            const result = setMethod(lines, "PUT");
            expect(result[0]).toBe("PUT /path#fragment?weird HTTP/1.1");
        });
    });
    describe("array immutability", () => {
        it("should not mutate original lines array", () => {
            const lines = [
                "GET /path HTTP/1.1",
                "Host: example.com",
            ];
            const originalLines = [...lines];
            setMethod(lines, "POST");
            expect(lines).toEqual(originalLines);
        });
        it("should return new array reference", () => {
            const lines = ["GET /path HTTP/1.1"];
            const result = setMethod(lines, "POST");
            expect(result).not.toBe(lines);
        });
    });
});
