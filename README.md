# ts-http-forge

A tool for security researchers who need to modify and inspect HTTP requests in weird ways to test and trick HTTP parsers. This library lets you change any HTTP request without complaining about broken or invalid HTTP syntax. It will only give errors if you pass bad input or wrong arguments.

## Installation

```bash
pnpm add ts-http-forge
```

## Usage

### Modifying Requests

```typescript
import { HttpForge } from 'ts-http-forge';

const modified = HttpForge.create(rawRequest)
  .method('POST')
  .path('/api/users')
  .addQueryParam('id', '123')
  .setHeader('Content-Type', 'application/json')
  .body('{"data":"value"}')
  .build();
```

### Reading Requests

```typescript
const forge = HttpForge.create(rawRequest);

console.log(forge.getMethod());        // 'POST'
console.log(forge.getPath());          // '/api/users'
console.log(forge.getQueryParams());   // { id: '123' }
console.log(forge.getHeader('Host'));  // 'example.com'
console.log(forge.getBody());          // '{"data":"value"}'
```

## API Reference

### Modifiers

#### Request Line
- `.method(method: string)` - Change the HTTP method
- `.path(path: string)` - Change the request path
- `.setQuery(query: string)` - Replace the entire query string
- `.addQueryParam(key: string, value: string)` - Add a query parameter
- `.removeQueryParam(key: string)` - Remove a query parameter
- `.upsertQueryParam(key: string, value: string)` - Add or update a query parameter

#### Headers
- `.addHeader(name: string, value: string)` - Add a new header
- `.setHeader(name: string, value: string)` - Set/replace a header
- `.removeHeader(name: string)` - Remove a header

#### Cookies
- `.addCookie(name: string, value: string)` - Add a cookie
- `.setCookie(name: string, value: string)` - Set/replace a cookie
- `.removeCookie(name: string)` - Remove a cookie

#### Body
- `.body(body: string)` - Set the request body

### Readers

#### Request Line
- `.getMethod()` → `HttpMethod | null` - Get the HTTP method
- `.getPath()` → `string | null` - Get the request path (without query string)
- `.getQuery()` → `string | null` - Get the raw query string
- `.getQueryParams()` → `Record<string, string> | null` - Get parsed query parameters

#### Headers
- `.getHeaders()` → `Record<string, string[]> | null` - Get all headers
- `.getHeader(name: string)` → `string | null` - Get a specific header value

#### Cookies
- `.getCookies()` → `Record<string, string> | null` - Get all cookies
- `.getCookie(name: string)` → `string | null` - Get a specific cookie value

#### Body
- `.getBody()` → `string | null` - Get the request body
