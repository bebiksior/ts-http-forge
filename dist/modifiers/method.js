export function setMethod(lines, method) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!method.trim())
        throw new Error("Method cannot be empty");
    if (method.includes(" "))
        throw new Error("Method cannot contain spaces");
    return modify(lines, method);
}
function modify(lines, method) {
    const requestLine = lines[0];
    const modifiedLine = replaceMethodInLine(requestLine, method);
    return [modifiedLine, ...lines.slice(1)];
}
function replaceMethodInLine(requestLine, newMethod) {
    let i = 0;
    while (i < requestLine.length && requestLine[i] !== " ") {
        i++;
    }
    if (i === requestLine.length) {
        return newMethod;
    }
    return newMethod + requestLine.substring(i);
}
