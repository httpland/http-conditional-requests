import {
  ConditionalHeader,
  isNull,
  isRetrieveMethod,
  RepresentationHeader,
  Status,
} from "../deps.ts";
import type { EvaluateCallback, Precondition } from "../types.ts";
import { ifNoneMatch } from "./util.ts";

const evaluate: EvaluateCallback = (_, response, context) => {
  const etag = response.headers.get(RepresentationHeader.ETag);

  if (isNull(etag)) return true;

  return ifNoneMatch(context.fieldValue, etag);
};

const IfNoneMatch: Precondition = {
  header: ConditionalHeader.IfNoneMatch,
  evaluate,
  respond: (request) => {
    const status = isRetrieveMethod(request.method)
      ? Status.NotModified
      : Status.PreconditionFailed;

    return new Response(null, { status });
  },
};

export default IfNoneMatch;
