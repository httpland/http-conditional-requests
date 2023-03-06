import {
  assert,
  assertEquals,
  assertExists,
  assertSpyCallArgs,
  assertSpyCalls,
  describe,
  it,
  spy,
} from "./_dev_deps.ts";
import conditionalRequests from "./mod.ts";

describe("default export", () => {
  it("should exists", () => {
    assertExists(conditionalRequests);
  });

  it("should return next response if the request is not selection or modification method", async () => {
    const selectRepresentation = spy(() => new Response());
    const middleware = conditionalRequests(selectRepresentation);
    const conditionalRequest = new Request("test:", {
      method: "OPTIONS",
    });
    const newResponse = new Response();
    const handler = spy(() => newResponse);

    const response = await middleware(conditionalRequest, handler);

    assertSpyCalls(selectRepresentation, 0);
    assertSpyCalls(handler, 1);
    assert(newResponse === response);
  });

  it("should return next response if the filtered preconditions is empty", async () => {
    const selectedRepresentation = new Response("<body>", {
      headers: { etag: "<etag>" },
    });
    const selectRepresentation = spy(() => selectedRepresentation);
    const middleware = conditionalRequests(selectRepresentation, {
      preconditions: [],
    });
    const conditionalRequest = new Request("test:", {
      headers: { "if-none-match": "<etag>" },
    });
    const handler = spy(() => selectedRepresentation);

    const response = await middleware(conditionalRequest, handler);

    assertSpyCalls(selectRepresentation, 0);
    assertSpyCalls(handler, 1);
    assert(selectedRepresentation === response);
  });

  it("should return next response if the preconditions does match", async () => {
    const selectedRepresentation = new Response("<body>", {
      headers: { etag: "<etag>" },
    });
    const selectRepresentation = spy(() => selectedRepresentation);
    const middleware = conditionalRequests(selectRepresentation, {
      preconditions: [{
        header: "if-none-match",
        evaluate: () => true,
        respond: () => new Response(),
      }],
    });
    const conditionalRequest = new Request("test:", {
      headers: { "if-none-match": "<etag>" },
    });
    const handler = spy(() => selectedRepresentation);

    const response = await middleware(conditionalRequest, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 1);
    assert(selectedRepresentation === response);
  });

  it("should return precondition defined response if the precondition match", async () => {
    const selectedRepresentation = new Response("<body>", {
      headers: { etag: "<etag>" },
    });
    const selectRepresentation = spy(() => selectedRepresentation);
    const middleware = conditionalRequests(selectRepresentation);
    const conditionalRequest = new Request("test:", {
      headers: { "if-none-match": "<etag>" },
    });
    const handler = spy(() => selectedRepresentation);

    const response = await middleware(conditionalRequest, handler);

    assertSpyCalls(handler, 0);
    assertSpyCalls(selectRepresentation, 1);
    assertEquals(response.status, 304);
  });

  it("should handler multiple precondition", async () => {
    const selectedRepresentation = new Response("<body>", {
      headers: { etag: "<etag>" },
    });
    const selectRepresentation = spy(() => selectedRepresentation);
    const store = spy((_: string) => true);
    const middleware = conditionalRequests(selectRepresentation, {
      preconditions: [{
        header: "if-none-match",
        evaluate: () => {
          return store("if-none-match");
        },
        respond: () => new Response(),
      }, {
        header: "if-match",
        evaluate: () => {
          return store("if-match");
        },
        respond: () => new Response(),
      }],
    });
    const conditionalRequest = new Request("test:", {
      headers: { "if-none-match": "<etag>", "if-match": "<etag>" },
    });
    const handler = spy(() => selectedRepresentation);

    const response = await middleware(conditionalRequest, handler);

    assertSpyCallArgs(store, 0, ["if-match"]);
    assertSpyCallArgs(store, 1, ["if-none-match"]);
    assertSpyCalls(handler, 1);
    assertSpyCalls(selectRepresentation, 1);
    assert(response === selectedRepresentation);
  });
});
