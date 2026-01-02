import { describe, it, expect } from "vitest";
import { getMethod } from "./method";
describe("getMethod", () => {
    it("should extract GET method", () => {
        const lines = ["GET /api/users HTTP/1.1", "Host: example.com"];
        expect(getMethod(lines)).toBe("GET");
    });
    it("should extract POST method", () => {
        const lines = ["POST /api/users HTTP/1.1", "Host: example.com"];
        expect(getMethod(lines)).toBe("POST");
    });
    it("should extract custom method", () => {
        const lines = ["CUSTOM /path HTTP/1.1", "Host: example.com"];
        expect(getMethod(lines)).toBe("CUSTOM");
    });
    it("should handle method with extra spaces", () => {
        const lines = ["GET  /path HTTP/1.1", "Host: example.com"];
        expect(getMethod(lines)).toBe("GET");
    });
    it("should return null for empty lines", () => {
        const lines = [];
        expect(getMethod(lines)).toBeNull();
    });
    it("should return null for malformed request line without space", () => {
        const lines = ["GETNOSPACEPATH"];
        expect(getMethod(lines)).toBe("GETNOSPACEPATH");
    });
    it("should return null for empty request line", () => {
        const lines = ["", "Host: example.com"];
        expect(getMethod(lines)).toBeNull();
    });
    it("should handle minimal request line", () => {
        const lines = ["GET /"];
        expect(getMethod(lines)).toBe("GET");
    });
    it("should handle request line with only method", () => {
        const lines = ["GET"];
        expect(getMethod(lines)).toBe("GET");
    });
});
