import { findHeaderIndex, findHeaderInsertIndex } from "../readers/headers";
export function addHeader(lines, name, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Header name cannot be empty");
    return modifyAdd(lines, name, value);
}
export function setHeader(lines, name, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Header name cannot be empty");
    return modifySet(lines, name, value);
}
export function removeHeader(lines, name) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!name.trim())
        throw new Error("Header name cannot be empty");
    return modifyRemove(lines, name);
}
function modifyAdd(lines, name, value) {
    const headerLine = `${name}: ${value}`;
    const insertIndex = findHeaderInsertIndex(lines);
    const newLines = [...lines];
    newLines.splice(insertIndex, 0, headerLine);
    return newLines;
}
function modifySet(lines, name, value) {
    const existingIndex = findHeaderIndex(lines, name);
    if (existingIndex !== -1) {
        const newLines = [...lines];
        newLines[existingIndex] = `${name}: ${value}`;
        return newLines;
    }
    return modifyAdd(lines, name, value);
}
function modifyRemove(lines, name) {
    const lowerName = name.toLowerCase();
    const newLines = [];
    let foundAny = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i > 0 && line.trim() === "") {
            newLines.push(...lines.slice(i));
            break;
        }
        if (i > 0) {
            const colonIndex = line.indexOf(":");
            if (colonIndex !== -1) {
                const headerName = line.substring(0, colonIndex).trim().toLowerCase();
                if (headerName === lowerName) {
                    foundAny = true;
                    continue;
                }
            }
        }
        newLines.push(line);
    }
    return foundAny ? newLines : lines;
}
