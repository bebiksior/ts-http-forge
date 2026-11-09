import { decodeComponent } from "../encoding.js";
/**
 * Extracts the raw query string from the request line.
 * @param lines - The parsed HTTP request lines
 * @returns The query string (without leading ?) or null if no query present
 */
export function getQuery(lines) {
    if (lines.length === 0)
        return null;
    const requestLine = lines[0];
    const questionMarkIndex = requestLine.indexOf("?");
    if (questionMarkIndex === -1)
        return null;
    const spaceAfterQuery = requestLine.indexOf(" ", questionMarkIndex);
    const queryEnd = spaceAfterQuery === -1 ? requestLine.length : spaceAfterQuery;
    return requestLine.substring(questionMarkIndex + 1, queryEnd);
}
/**
 * Parses the query string into key-value pairs.
 * @param lines - The parsed HTTP request lines
 * @returns An object of decoded query parameters or null if no query present
 */
export function getQueryParams(lines) {
    const query = getQuery(lines);
    if (query === null)
        return null;
    const params = {};
    if (query === "")
        return params;
    const pairs = query.split("&");
    for (const pair of pairs) {
        if (!pair)
            continue;
        const [key, ...rest] = pair.split("=");
        const value = rest.join("=");
        params[decodeComponent(key)] = decodeComponent(value);
    }
    return params;
}
