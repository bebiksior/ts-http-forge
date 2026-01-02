export function getBody(lines) {
    if (lines.length === 0)
        return null;
    const bodyStartIndex = findBodyStartIndex(lines);
    if (bodyStartIndex >= lines.length)
        return null;
    const bodyLines = lines.slice(bodyStartIndex);
    if (bodyLines.length === 0)
        return null;
    if (bodyLines.length === 1 && bodyLines[0].trim() === "")
        return null;
    return bodyLines.join("\n");
}
export function findBodyStartIndex(lines) {
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") {
            return i + 1;
        }
    }
    return lines.length;
}
