import {
  ConditionalHeader,
  isNull,
  RepresentationHeader,
  Status,
} from "../deps.ts";
import type { EvaluateCallback, Precondition } from "../types.ts";
import { ifMatch } from "./util.ts";

const evaluate: EvaluateCallback = (_, response, context) => {
  const etagValue = response.headers.get(RepresentationHeader.ETag);

  if (isNull(etagValue)) return false;

  return ifMatch(context.fieldValue, etagValue);
};

const IfMatch: Precondition = {
  header: ConditionalHeader.IfMatch,
  evaluate,
  respond: () => new Response(null, { status: Status.PreconditionFailed }),
};

export default IfMatch;
