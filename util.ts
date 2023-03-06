// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ascend,
  isNegativeNumber,
  isNull,
  isValidDate,
  Method,
  parseFieldValue,
} from "./deps.ts";
import { isStrong, strongMatch, weakMatch } from "./etag.ts";
import type { Precondition } from "./types.ts";

export function ifNoneMatch(fieldValue: string, etag: string): boolean {
  if (isStar(fieldValue)) return true;

  return !parseFieldValue(fieldValue)
    .every((opaqueTag) => weakMatch(opaqueTag, etag));
}

export function ifMatch(
  fieldValue: string,
  etag: string,
): boolean {
  if (isStar(fieldValue)) return true;

  if (!isStrong(etag)) return false;

  return parseFieldValue(fieldValue).some((opaqueTag) =>
    strongMatch(opaqueTag, etag)
  );
}

export function ifModifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  // A recipient MUST ignore the If-Modified-Since header field if the
  // received field-value is not a valid HTTP-date
  const date = new Date(fieldValue);
  const lastModifiedDate = new Date(lastModified);

  if (!isValidDate(date) || !isValidDate(lastModifiedDate)) {
    return true;
  }

  // The origin server SHOULD NOT perform the requested
  // method if the selected representation's last modification date is
  // earlier than or equal to the date provided in the field-value;
  // instead, the origin server SHOULD generate a 304 (Not Modified)
  // response, including only those metadata that are useful for
  // identifying or updating a previously cached response.
  return lastModifiedDate > date;
}

export function ifUnmodifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  // A recipient MUST ignore the If-Modified-Since header field if the
  // received field-value is not a valid HTTP-date
  const date = new Date(fieldValue);
  const lastModifiedDate = new Date(lastModified);

  if (!isValidDate(date) || !isValidDate(lastModifiedDate)) return true;

  // The origin server MUST NOT perform the requested method
  // if the selected representation's last modification date is more
  // recent than the date provided in the field-value; instead the origin
  // server MUST respond with either a) the 412 (Precondition Failed)
  // status code.
  return lastModifiedDate <= date;
}

/** Whether the input is `*` or not. */
function isStar(input: string): input is "*" {
  return input === "*";
}

export function isNotSelectionOrModificationMethod(method: string): boolean {
  return ([Method.Connect, Method.Options, Method.Trace] as string[]).includes(
    method,
  );
}

enum PreconditionPriority {
  "if-match",
  "if-none-match",
  "if-modified-since",
  "if-unmodified-since",
}

export type Ord = 1 | 0 | -1;

export function toPriority(input: string): number {
  input = input.toLowerCase();

  const Order = Object.values(PreconditionPriority);

  const result = Order.indexOf(input);

  return isNegativeNumber(result) ? Infinity : result;
}

export function ascendPrecondition(
  left: Precondition,
  right: Precondition,
): Ord {
  return ascendPreconditionHeader(left.header, right.header);
}

export function ascendPreconditionHeader(
  left: string,
  right: string,
): Ord {
  const l = toPriority(left);
  const r = toPriority(right);

  return ascend(l, r);
}

export async function applyPrecondition(
  request: Request,
  response: Response,
  precondition: Precondition,
): Promise<Response | void> {
  const fieldValue = request.headers.get(precondition.header);

  if (isNull(fieldValue)) return;

  const evalResult = await precondition.evaluate(request, response, {
    fieldValue,
  });

  if (evalResult) return;

  return precondition.respond(request);
}
