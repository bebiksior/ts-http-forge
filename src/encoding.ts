/**
 * Percent-decodes a component, returning it unchanged when it is malformed.
 * @param value - The percent-encoded text
 * @returns The decoded text, or the input if it cannot be decoded
 */
export function decodeComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Encodes the characters in a query key that would end the request target or
 * split the key. Everything else, including existing percent-encoding and
 * brackets, is left as given.
 * @param key - The query parameter key
 * @returns The key, safe to place in a request line
 */
export function encodeQueryKey(key: string): string {
  return key.replace(/[\s#&=]/g, encodeURIComponent);
}

/**
 * Checks whether a key as written in the request refers to the given key,
 * either literally or once percent-decoded.
 * @param wireKey - The key as it appears in the request
 * @param key - The key to look for
 * @returns True if both name the same parameter
 */
export function isSameKey(wireKey: string, key: string): boolean {
  return wireKey === key || decodeComponent(wireKey) === key;
}
