# http-conditional-requests

HTTP Conditional Request middleware for standard `Request` and `Response`.

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
const selectRepresentation = spy((request: Request) => selectedRepresentation);
const middleware = conditionalRequests(selectRepresentation);
const conditionalRequest = new Request("<uri>", {
  headers: { "if-none-match": "<etag" },
});
const handler = spy(() => selectedRepresentation);

const response = await middleware(conditionalRequest, handler);

assertSpyCalls(handler, 0);
assertSpyCalls(selectRepresentation, 1);
assertEquals(response.status, 304);
```

## Preconditions

[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)
compliant and supports the following precondition

- [If-None-Match](#if-none-match)

### If-None-Match

If an `if-none-match` header is present in the request, a weak comparison is
made with the ETag header of the target resource.

If `if-none-match` evaluates to `false`, the handler is not executed and returns
a `304` status code response.

## Effects

Middleware will effect following:

- HTTP response status
  - [304 (Not Modified)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5)
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)

## Conditions

Middleware will execute only if the following conditions are met:

- The Preconditions header exists
  - `If-None-Match`
    - The `ETag` header **does not exist**

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
