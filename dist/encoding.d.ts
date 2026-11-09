/**
 * Percent-decodes a component, returning it unchanged when it is malformed.
 * @param value - The percent-encoded text
 * @returns The decoded text, or the input if it cannot be decoded
 */
export declare function decodeComponent(value: string): string;
/**
 * Encodes the characters in a query key that would end the request target or
 * split the key. Everything else, including existing percent-encoding and
 * brackets, is left as given.
 * @param key - The query parameter key
 * @returns The key, safe to place in a request line
 */
export declare function encodeQueryKey(key: string): string;
/**
 * Checks whether a key as written in the request refers to the given key,
 * either literally or once percent-decoded.
 * @param wireKey - The key as it appears in the request
 * @param key - The key to look for
 * @returns True if both name the same parameter
 */
export declare function isSameKey(wireKey: string, key: string): boolean;
