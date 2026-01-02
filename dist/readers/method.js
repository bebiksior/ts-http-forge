export function getMethod(lines) {
    if (lines.length === 0)
        return null;
    const requestLine = lines[0];
    let i = 0;
    while (i < requestLine.length && requestLine[i] !== " ") {
        i++;
    }
    if (i === 0)
        return null;
    return requestLine.substring(0, i);
}
