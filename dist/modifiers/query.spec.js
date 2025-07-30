import { describe, it, expect } from "vitest";
import { setQuery, addQueryParam, removeQueryParam, upsertQueryParam } from "./query";
describe("setQuery", () => {
    describe("valid input", () => {
        it("should add query string to request without existing query", () => {
            const lines = [
                "GET /api/users HTTP/1.1",
                "Host: example.com",
            ];
            const result = setQuery(lines, "name=john&age=30");
            expect(result[0]).toBe("GET /api/users?name=john&age=30 HTTP/1.1");
        });
        it("should replace existing query string", () => {
            const lines = ["GET /api/users?old=param HTTP/1.1"];
            const result = setQuery(lines, "new=value&other=test");
            expect(result[0]).toBe("GET /api/users?new=value&other=test HTTP/1.1");
        });
        it("should remove query string when empty", () => {
            const lines = ["GET /api/users?param=value HTTP/1.1"];
            const result = setQuery(lines, "");
            expect(result[0]).toBe("GET /api/users HTTP/1.1");
        });
        it("should handle request without HTTP version", () => {
            const lines = ["GET /api/users"];
            const result = setQuery(lines, "param=value");
            expect(result[0]).toBe("GET /api/users?param=value");
        });
        it("should preserve original headers and body", () => {
            const lines = [
                "GET /api/users HTTP/1.1",
                "Host: example.com",
                "",
                "body",
            ];
            const result = setQuery(lines, "filter=active");
            expect(result).toEqual([
                "GET /api/users?filter=active HTTP/1.1",
                "Host: example.com",
                "",
                "body",
            ]);
        });
    });
    describe("edge cases", () => {
        it("should throw error when input is empty", () => {
            const lines = [];
            expect(() => setQuery(lines, "param=value")).toThrow("Request cannot be empty");
        });
        it("should throw error when query is null", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setQuery(lines, null)).toThrow("Query cannot be null or undefined");
        });
        it("should throw error when query is undefined", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => setQuery(lines, undefined)).toThrow("Query cannot be null or undefined");
        });
    });
    describe("array immutability", () => {
        it("should not mutate original lines array", () => {
            const lines = ["GET /path HTTP/1.1"];
            const originalLines = [...lines];
            setQuery(lines, "param=value");
            expect(lines).toEqual(originalLines);
        });
        it("should return new array reference", () => {
            const lines = ["GET /path HTTP/1.1"];
            const result = setQuery(lines, "param=value");
            expect(result).not.toBe(lines);
        });
    });
});
describe("addQueryParam", () => {
    describe("valid input", () => {
        it("should add parameter to request without existing query", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = addQueryParam(lines, "name", "john");
            expect(result[0]).toBe("GET /api/users?name=john HTTP/1.1");
        });
        it("should add parameter to existing query string", () => {
            const lines = [
                "GET /api/users?existing=param HTTP/1.1",
            ];
            const result = addQueryParam(lines, "new", "value");
            expect(result[0]).toBe("GET /api/users?existing=param&new=value HTTP/1.1");
        });
        it("should URL encode parameter values", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = addQueryParam(lines, "name", "john doe");
            expect(result[0]).toBe("GET /api/users?name=john%20doe HTTP/1.1");
        });
        it("should handle special characters in values", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = addQueryParam(lines, "query", "hello & world");
            expect(result[0]).toBe("GET /api/users?query=hello%20%26%20world HTTP/1.1");
        });
        it("should handle empty value", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = addQueryParam(lines, "empty", "");
            expect(result[0]).toBe("GET /api/users?empty= HTTP/1.1");
        });
        it("should handle request without HTTP version", () => {
            const lines = ["GET /api/users"];
            const result = addQueryParam(lines, "param", "value");
            expect(result[0]).toBe("GET /api/users?param=value");
        });
    });
    describe("edge cases", () => {
        it("should throw error when input is empty", () => {
            const lines = [];
            expect(() => addQueryParam(lines, "key", "value")).toThrow("Request cannot be empty");
        });
        it("should throw error when key is empty", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => addQueryParam(lines, "", "value")).toThrow("Query parameter key cannot be empty");
        });
        it("should throw error when key is only whitespace", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => addQueryParam(lines, "   ", "value")).toThrow("Query parameter key cannot be empty");
        });
    });
    describe("array immutability", () => {
        it("should not mutate original lines array", () => {
            const lines = ["GET /path HTTP/1.1"];
            const originalLines = [...lines];
            addQueryParam(lines, "key", "value");
            expect(lines).toEqual(originalLines);
        });
        it("should return new array reference", () => {
            const lines = ["GET /path HTTP/1.1"];
            const result = addQueryParam(lines, "key", "value");
            expect(result).not.toBe(lines);
        });
    });
});
describe("removeQueryParam", () => {
    describe("valid input", () => {
        it("should remove parameter from query string", () => {
            const lines = [
                "GET /api/users?name=john&age=30 HTTP/1.1",
            ];
            const result = removeQueryParam(lines, "name");
            expect(result[0]).toBe("GET /api/users?age=30 HTTP/1.1");
        });
        it("should remove last parameter and question mark", () => {
            const lines = ["GET /api/users?name=john HTTP/1.1"];
            const result = removeQueryParam(lines, "name");
            expect(result[0]).toBe("GET /api/users HTTP/1.1");
        });
        it("should remove parameter from middle of query", () => {
            const lines = ["GET /api/users?a=1&b=2&c=3 HTTP/1.1"];
            const result = removeQueryParam(lines, "b");
            expect(result[0]).toBe("GET /api/users?a=1&c=3 HTTP/1.1");
        });
        it("should handle non-existent parameter", () => {
            const lines = ["GET /api/users?name=john HTTP/1.1"];
            const result = removeQueryParam(lines, "age");
            expect(result[0]).toBe("GET /api/users?name=john HTTP/1.1");
        });
        it("should handle request without query string", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = removeQueryParam(lines, "name");
            expect(result[0]).toBe("GET /api/users HTTP/1.1");
        });
        it("should handle request without HTTP version", () => {
            const lines = ["GET /api/users?name=john"];
            const result = removeQueryParam(lines, "name");
            expect(result[0]).toBe("GET /api/users");
        });
        it("should handle parameters with same prefix", () => {
            const lines = [
                "GET /api/users?name=john&namespace=app HTTP/1.1",
            ];
            const result = removeQueryParam(lines, "name");
            expect(result[0]).toBe("GET /api/users?namespace=app HTTP/1.1");
        });
    });
    describe("edge cases", () => {
        it("should throw error when input is empty", () => {
            const lines = [];
            expect(() => removeQueryParam(lines, "key")).toThrow("Request cannot be empty");
        });
        it("should throw error when key is empty", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => removeQueryParam(lines, "")).toThrow("Query parameter key cannot be empty");
        });
        it("should throw error when key is only whitespace", () => {
            const lines = ["GET /path HTTP/1.1"];
            expect(() => removeQueryParam(lines, "   ")).toThrow("Query parameter key cannot be empty");
        });
    });
    describe("malformed input preservation", () => {
        it("should preserve malformed query parameters", () => {
            const lines = [
                "GET /path?malformed&key=value&another HTTP/1.1",
            ];
            const result = removeQueryParam(lines, "key");
            expect(result[0]).toBe("GET /path?malformed&another HTTP/1.1");
        });
        it("should handle parameters without values", () => {
            const lines = ["GET /path?flag&name=john HTTP/1.1"];
            const result = removeQueryParam(lines, "flag");
            expect(result[0]).toBe("GET /path?name=john HTTP/1.1");
        });
    });
    describe("array immutability", () => {
        it("should not mutate original lines array", () => {
            const lines = ["GET /path?key=value HTTP/1.1"];
            const originalLines = [...lines];
            removeQueryParam(lines, "key");
            expect(lines).toEqual(originalLines);
        });
        it("should return new array reference", () => {
            const lines = ["GET /path?key=value HTTP/1.1"];
            const result = removeQueryParam(lines, "key");
            expect(result).not.toBe(lines);
        });
    });
    describe("upsertQueryParam", () => {
        it("should add parameter to request without existing query", () => {
            const lines = ["GET /api/users HTTP/1.1"];
            const result = upsertQueryParam(lines, "name", "john");
            expect(result[0]).toBe("GET /api/users?name=john HTTP/1.1");
        });
        it("should update existing parameter value", () => {
            const lines = ["GET /path?name=jane&age=25 HTTP/1.1"];
            const result = upsertQueryParam(lines, "name", "john");
            expect(result[0]).toBe("GET /path?name=john&age=25 HTTP/1.1");
        });
        it("should add parameter when other parameters exist", () => {
            const lines = ["GET /path?existing=value HTTP/1.1"];
            const result = upsertQueryParam(lines, "new", "param");
            expect(result[0]).toBe("GET /path?existing=value&new=param HTTP/1.1");
        });
    });
});
