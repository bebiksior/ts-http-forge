export function setBody(lines, body) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (body === undefined || body === null)
        throw new Error("Body cannot be null or undefined");
    return modify(lines, body);
}
function modify(lines, body) {
    const bodyStartIndex = findBodyStartIndex(lines);
    const newLines = [...lines.slice(0, bodyStartIndex)];
    if (!body.trim()) {
        const hadSeparator = bodyStartIndex > 0 && lines[bodyStartIndex - 1].trim() === "";
        if (hadSeparator) {
            newLines.push("");
        }
        else {
            newLines.push("", "");
        }
        return newLines;
    }
    const bodyLines = body.split(/\r?\n/);
    newLines.push(...bodyLines);
    return newLines;
}
function findBodyStartIndex(lines) {
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") {
            return i + 1;
        }
    }
    return lines.length;
}
