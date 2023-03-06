import { isValidDate, parseFieldValue } from "../deps.ts";
import { isStrong, strongMatch, weakMatch } from "./etag.ts";

export function ifMatch(
  fieldValue: string,
  etag: string,
): boolean {
  if (!isStrong(etag)) return false;

  if (isStar(fieldValue)) return true;

  return parseFieldValue(fieldValue).some((opaqueTag) =>
    strongMatch(opaqueTag, etag)
  );
}

export function ifNoneMatch(fieldValue: string, etag: string): boolean {
  if (isStar(fieldValue)) return false;

  return parseFieldValue(fieldValue)
    .every((opaqueTag) => !weakMatch(opaqueTag, etag));
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
  // recent than the date provided in the field-value;
  return lastModifiedDate <= date;
}

/** Whether the input is `*` or not. */
function isStar(input: string): input is "*" {
  return input === "*";
}
