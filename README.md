# ts-http-forge

A tool for security researchers who need to modify HTTP requests in weird ways to test and trick HTTP parsers. This library lets you change any HTTP request without complaining about broken or invalid HTTP syntax. It will only give errors if you pass bad input or wrong arguments to the modifiers.

## Installation

```bash
pnpm add ts-http-forge
```

## Usage

```typescript
import { HttpForge } from 'ts-http-forge';

const modified = HttpForge.create(rawRequest)
  .method('POST')
  .build();
```

## Available Modifiers

### Request Line
- `.method(method: string)` - Change the HTTP method
- `.path(path: string)` - Change the request path
- `.setQuery(query: string)` - Replace the entire query string
- `.addQueryParam(key: string, value: string)` - Add a query parameter
- `.removeQueryParam(key: string)` - Remove a query parameter

### Headers
- `.addHeader(name: string, value: string)` - Add a new header
- `.setHeader(name: string, value: string)` - Set/replace a header
- `.removeHeader(name: string)` - Remove a header

### Body
- `.body(body: string)` - Set the request body
