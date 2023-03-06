import {
  ConditionalHeader,
  isNull,
  isRetrieveMethod,
  RepresentationHeader,
  Status,
} from "../deps.ts";
import { ifModifiedSince } from "./util.ts";
import type { EvaluateCallback, Precondition } from "../types.ts";

const evaluate: EvaluateCallback = (request, response, context) => {
  if (
    // A recipient MUST ignore If-Modified-Since if the request contains an
    // If-None-Match header field
    !isRetrieveMethod(request.method) ||
    // A recipient MUST ignore the If-Modified-Since header field if the
    // request method is neither GET nor HEAD
    request.headers.has(ConditionalHeader.IfNoneMatch)
  ) {
    return true;
  }

  const lastModified = response.headers.get(
    RepresentationHeader.LastModified,
  );

  if (isNull(lastModified)) return true;

  return ifModifiedSince(context.fieldValue, lastModified);
};

const IfModifiedSince: Precondition = {
  header: ConditionalHeader.IfModifiedSince,
  evaluate,
  respond: () => new Response(null, { status: Status.NotModified }),
};

export default IfModifiedSince;
