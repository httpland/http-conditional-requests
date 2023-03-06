// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type Middleware } from "./deps.ts";
import type { Precondition } from "./types.ts";
import {
  applyPrecondition,
  ascendPrecondition,
  isNotSelectionOrModificationMethod,
} from "./util.ts";
import IfNoneMatch from "./preconditions/if_none_match.ts";
import IfMatch from "./preconditions/if_match.ts";
import IfModifiedSince from "./preconditions/if_modified_since.ts";
import IfUnmodifiedSince from "./preconditions/if_unmodified_since.ts";

export type {
  EvaluateCallback,
  EvaluateContext,
  Precondition,
  RespondCallback,
} from "./types.ts";

const defaultPreconditions = [
  IfMatch,
  IfNoneMatch,
  IfModifiedSince,
  IfUnmodifiedSince,
];

/** Callback for selecting presentation data. */
export interface SelectPresentationCallback {
  (request: Request): Response | Promise<Response>;
}

/** Middleware options. */
export interface Options {
  /** Apply precondition list. */
  readonly preconditions?: Iterable<Precondition>;
}

/** HTTP Conditional Requests middleware factory.
 *
 * @example
 * ```ts
 * import conditionalRequests from "https://deno.land/x/http_conditional_requests@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";
 *
 * const selectedRepresentation = new Response("<body>", {
 *   headers: { etag: "<etag>" },
 * });
 * const selectRepresentation = spy(() => selectedRepresentation);
 * const middleware = conditionalRequests(selectRepresentation);
 * const conditionalRequest = new Request("<uri>", {
 *   headers: { "if-none-match": "<etag>" },
 * });
 * const handler = spy(() => selectedRepresentation);
 *
 * const response = await middleware(conditionalRequest, handler);
 *
 * assertSpyCalls(handler, 0);
 * assertSpyCalls(selectRepresentation, 1);
 * assertEquals(response.status, 304);
 * ```
 */
export default function conditionalRequests(
  selectRepresentation: SelectPresentationCallback,
  options?: Options,
): Middleware {
  // TODO(miyauci): use toSort
  const preconditions = Array.from(
    options?.preconditions ?? defaultPreconditions,
  ).sort(ascendPrecondition);

  return async (request, next) => {
    if (isNotSelectionOrModificationMethod(request.method)) {
      return next(request);
    }

    const targetPreconditions = preconditions.filter(hasPreconditionHeader);

    if (!targetPreconditions.length) return next(request);

    const selectedRepresentation = await selectRepresentation(request);

    for (const precondition of targetPreconditions) {
      const result = await applyPrecondition(
        request,
        selectedRepresentation,
        precondition,
      );

      if (result) return result;
    }

    return next(request);

    function hasPreconditionHeader(precondition: Precondition): boolean {
      return request.headers.has(precondition.header);
    }
  };
}
