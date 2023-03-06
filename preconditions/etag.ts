// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export function isWeak(etag: string): boolean {
  return etag.startsWith('W/"');
}

export function isStrong(etag: string): boolean {
  return etag.startsWith('"');
}

export function opaqueTag(etag: string): string {
  if (isWeak(etag)) {
    return etag.substring(2);
  }

  return etag;
}

export function weakMatch(left: string, right: string): boolean {
  return opaqueTag(left) === opaqueTag(right);
}

export function strongMatch(left: string, right: string): boolean {
  return isStrong(left) && isStrong(right) && left === right;
}
