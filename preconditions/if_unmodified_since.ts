import {
  ConditionalHeader,
  isNull,
  RepresentationHeader,
  Status,
} from "../deps.ts";
import { ifUnmodifiedSince } from "./util.ts";
import type { EvaluateCallback, Precondition } from "../types.ts";

const evaluate: EvaluateCallback = (request, response, context) => {
  // A recipient MUST ignore If-Unmodified-Since if the request contains
  // an If-Match header field
  if (request.headers.has(ConditionalHeader.IfMatch)) return true;

  const lastModified = response.headers.get(
    RepresentationHeader.LastModified,
  );

  if (isNull(lastModified)) return true;

  return ifUnmodifiedSince(context.fieldValue, lastModified);
};

const IfUnmodifiedSince: Precondition = {
  header: ConditionalHeader.IfUnmodifiedSince,
  evaluate,

  respond: () => new Response(null, { status: Status.PreconditionFailed }),
};

export default IfUnmodifiedSince;
