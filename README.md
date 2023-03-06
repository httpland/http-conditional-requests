# http-conditional-requests

HTTP Conditional Requests middleware for Fetch API.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_conditional_requests)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_conditional_requests/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-conditional-requests)](https://github.com/httpland/http-conditional-requests/releases)
[![codecov](https://codecov.io/gh/httpland/http-conditional-requests/branch/main/graph/badge.svg?token=nan4NUrx1V)](https://codecov.io/gh/httpland/http-conditional-requests)
[![GitHub](https://img.shields.io/github/license/httpland/http-conditional-requests)](https://github.com/httpland/http-conditional-requests/blob/main/LICENSE)

[![test](https://github.com/httpland/http-conditional-requests/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-conditional-requests/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-conditional-requests.png?mini=true)](https://nodei.co/npm/@httpland/http-conditional-requests/)

## What

Middleware for HTTP Conditional Requests.

It conditionally processes a HTTP request based on a precondition.

It compliant with
[RFC 9110, 13. Conditional Requests](https://www.rfc-editor.org/rfc/rfc9110#section-13).

## Middleware

For a definition of Universal HTTP middleware, see the
[http-middleware](https://github.com/httpland/http-middleware) project.

## Usage

Middleware factory is exported by default.

To evaluate precondition, you need to provide a function to retrieve the
selected representation.

The following example evaluates the `If-None-Match` precondition and controls
the handler.

```ts
import conditionalRequests from "https://deno.land/x/http_conditional_requests@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";

const selectedRepresentation = new Response("<body>", {
  headers: { etag: "<etag>" },
});
const selectRepresentation = spy(() => selectedRepresentation);
const middleware = conditionalRequests(selectRepresentation);
const conditionalRequest = new Request("<uri>", {
  headers: { "if-none-match": "<etag>" },
});
const handler = spy(() => selectedRepresentation);

const response = await middleware(conditionalRequest, handler);

assertSpyCalls(handler, 0);
assertSpyCalls(selectRepresentation, 1);
assertEquals(response.status, 304);
```

## Preconditions

[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)
compliant and supports the following precondition:

- If-Match
- If-None-Match
- If-Modified-Since
- If-Unmodified-Since

If multiple precondition headers are present, precondition is processed
according to
[precedence](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.2.2).

## Effects

Middleware will effect following:

- HTTP response status
  - [304 (Not Modified)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5)
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)

## Conditions

Middleware will execute only if the following conditions are met:

- The precondition header exists
  - `If-Match`
    - The `ETag` header exist
  - `If-None-Match`
    - The `ETag` header exist
  - `If-Modified-Since`
    - The `Last-Modified` header exist
  - `If-Unmodified-Since`
    - The `Last-Modified` header exist

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
