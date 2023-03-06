// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export interface Precondition {
  /** The target precondition header field. */
  readonly header: string;

  readonly evaluate: EvaluateCallback;

  readonly respond: RespondCallback;
}

export interface EvaluateContext {
  readonly fieldValue: string;
}

export interface EvaluateCallback {
  (
    request: Request,
    response: Response,
    context: EvaluateContext,
  ): boolean | Promise<boolean>;
}

export interface RespondCallback {
  (request: Request): Response | Promise<Response>;
}
