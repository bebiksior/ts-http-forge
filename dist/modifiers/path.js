export function setPath(lines, path) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (path === undefined || path === null)
        throw new Error("Path cannot be null or undefined");
    if (path.includes(" "))
        path = path.replaceAll(" ", "%20");
    return modify(lines, path);
}
function modify(lines, path) {
    const requestLine = lines[0];
    const modifiedLine = replacePathInLine(requestLine, path);
    return [modifiedLine, ...lines.slice(1)];
}
function replacePathInLine(requestLine, newPath) {
    let methodEnd = 0;
    while (methodEnd < requestLine.length && requestLine[methodEnd] !== " ") {
        methodEnd++;
    }
    if (methodEnd === requestLine.length) {
        return requestLine + " " + newPath;
    }
    let pathStart = methodEnd;
    while (pathStart < requestLine.length && requestLine[pathStart] === " ") {
        pathStart++;
    }
    let pathEnd = pathStart;
    while (pathEnd < requestLine.length && requestLine[pathEnd] !== " ") {
        pathEnd++;
    }
    const method = requestLine.substring(0, methodEnd);
    const spacesAfterMethod = requestLine.substring(methodEnd, pathStart);
    const pathAndQuery = requestLine.substring(pathStart, pathEnd);
    const remainingPart = pathEnd < requestLine.length ? requestLine.substring(pathEnd) : "";
    const questionMarkIndex = pathAndQuery.indexOf("?");
    const hashIndex = pathAndQuery.indexOf("#");
    let queryAndFragment = "";
    if (questionMarkIndex !== -1 && hashIndex !== -1) {
        queryAndFragment = pathAndQuery.substring(Math.min(questionMarkIndex, hashIndex));
    }
    else if (questionMarkIndex !== -1) {
        queryAndFragment = pathAndQuery.substring(questionMarkIndex);
    }
    else if (hashIndex !== -1) {
        queryAndFragment = pathAndQuery.substring(hashIndex);
    }
    return (method + spacesAfterMethod + newPath + queryAndFragment + remainingPart);
}
