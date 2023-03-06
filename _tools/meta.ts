import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: [
      "esnext",
      "dom",
      "dom.iterable",
    ],
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/http-conditional-requests",
    version,
    description: "HTTP conditional request middleware for Fetch API",
    keywords: [
      "http",
      "conditional-request",
      "fetch",
      "middleware",
      "if-match",
      "if-none-match",
      "if-modified-since",
      "if-unmodified-since",
      "request",
      "response",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/http-conditional-requests",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/http-conditional-requests.git",
    },
    bugs: {
      url: "https://github.com/httpland/http-conditional-requests/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
});
