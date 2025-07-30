export function setQuery(lines, query) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (query === undefined || query === null)
        throw new Error("Query cannot be null or undefined");
    return modify(lines, query);
}
export function addQueryParam(lines, key, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!key.trim())
        throw new Error("Query parameter key cannot be empty");
    return modifyAddParam(lines, key, value);
}
export function removeQueryParam(lines, key) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!key.trim())
        throw new Error("Query parameter key cannot be empty");
    return modifyRemoveParam(lines, key);
}
export function upsertQueryParam(lines, key, value) {
    if (lines.length === 0)
        throw new Error("Request cannot be empty");
    if (!key.trim())
        throw new Error("Query parameter key cannot be empty");
    return modifyUpsertParam(lines, key, value);
}
function modify(lines, query) {
    const requestLine = lines[0];
    const modifiedLine = replaceQueryInLine(requestLine, query);
    return [modifiedLine, ...lines.slice(1)];
}
function modifyAddParam(lines, key, value) {
    const requestLine = lines[0];
    const modifiedLine = addQueryParamToLine(requestLine, key, value);
    return [modifiedLine, ...lines.slice(1)];
}
function modifyRemoveParam(lines, key) {
    const requestLine = lines[0];
    const modifiedLine = removeQueryParamFromLine(requestLine, key);
    return [modifiedLine, ...lines.slice(1)];
}
function modifyUpsertParam(lines, key, value) {
    const requestLine = lines[0];
    const modifiedLine = upsertQueryParamInLine(requestLine, key, value);
    return [modifiedLine, ...lines.slice(1)];
}
function replaceQueryInLine(requestLine, newQuery) {
    const questionMarkIndex = requestLine.indexOf("?");
    if (questionMarkIndex === -1) {
        const spaceIndex = requestLine.indexOf(" ", requestLine.indexOf(" ") + 1);
        if (spaceIndex === -1) {
            return requestLine + (newQuery ? "?" + newQuery : "");
        }
        return requestLine.substring(0, spaceIndex) + (newQuery ? "?" + newQuery : "") + requestLine.substring(spaceIndex);
    }
    const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
    if (spaceAfterQuery === -1) {
        return requestLine.substring(0, questionMarkIndex) + (newQuery ? "?" + newQuery : "");
    }
    return requestLine.substring(0, questionMarkIndex) + (newQuery ? "?" + newQuery : "") + requestLine.substring(spaceAfterQuery);
}
function addQueryParamToLine(requestLine, key, value) {
    const questionMarkIndex = requestLine.indexOf("?");
    const param = `${key}=${encodeURIComponent(value)}`;
    if (questionMarkIndex === -1) {
        const spaceIndex = requestLine.indexOf(" ", requestLine.indexOf(" ") + 1);
        if (spaceIndex === -1) {
            return requestLine + "?" + param;
        }
        return requestLine.substring(0, spaceIndex) + "?" + param + requestLine.substring(spaceIndex);
    }
    const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
    const queryEnd = spaceAfterQuery === -1 ? requestLine.length : spaceAfterQuery;
    const existingQuery = requestLine.substring(questionMarkIndex + 1, queryEnd);
    const newQuery = existingQuery ? existingQuery + "&" + param : param;
    const remainingPart = spaceAfterQuery === -1 ? "" : requestLine.substring(spaceAfterQuery);
    return requestLine.substring(0, questionMarkIndex + 1) + newQuery + remainingPart;
}
function removeQueryParamFromLine(requestLine, key) {
    const questionMarkIndex = requestLine.indexOf("?");
    if (questionMarkIndex === -1) {
        return requestLine;
    }
    const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
    const queryEnd = spaceAfterQuery === -1 ? requestLine.length : spaceAfterQuery;
    const existingQuery = requestLine.substring(questionMarkIndex + 1, queryEnd);
    const params = existingQuery.split("&");
    const filteredParams = params.filter(param => {
        const [paramKey] = param.split("=");
        return paramKey !== key;
    });
    const newQuery = filteredParams.join("&");
    const remainingPart = spaceAfterQuery === -1 ? "" : requestLine.substring(spaceAfterQuery);
    if (!newQuery) {
        return requestLine.substring(0, questionMarkIndex) + remainingPart;
    }
    return requestLine.substring(0, questionMarkIndex + 1) + newQuery + remainingPart;
}
function upsertQueryParamInLine(requestLine, key, value) {
    const questionMarkIndex = requestLine.indexOf("?");
    const param = `${key}=${encodeURIComponent(value)}`;
    if (questionMarkIndex === -1) {
        const spaceIndex = requestLine.indexOf(" ", requestLine.indexOf(" ") + 1);
        if (spaceIndex === -1) {
            return requestLine + "?" + param;
        }
        return requestLine.substring(0, spaceIndex) + "?" + param + requestLine.substring(spaceIndex);
    }
    const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
    const queryEnd = spaceAfterQuery === -1 ? requestLine.length : spaceAfterQuery;
    const existingQuery = requestLine.substring(questionMarkIndex + 1, queryEnd);
    if (!existingQuery) {
        const remainingPart = spaceAfterQuery === -1 ? "" : requestLine.substring(spaceAfterQuery);
        return requestLine.substring(0, questionMarkIndex + 1) + param + remainingPart;
    }
    const params = existingQuery.split("&");
    let paramExists = false;
    const updatedParams = params.map(p => {
        const [paramKey, ...rest] = p.split("=");
        if (paramKey === key) {
            paramExists = true;
            return param;
        }
        return p;
    });
    if (!paramExists) {
        updatedParams.push(param);
    }
    const newQuery = updatedParams.join("&");
    const remainingPart = spaceAfterQuery === -1 ? "" : requestLine.substring(spaceAfterQuery);
    return requestLine.substring(0, questionMarkIndex + 1) + newQuery + remainingPart;
}
