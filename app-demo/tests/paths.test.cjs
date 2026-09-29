/* eslint-disable @typescript-eslint/no-require-imports */
// withBasePath: hand-built URLs (images, fetch) get the /app-demo prefix exactly once.
const { test } = require("node:test");
const assert = require("node:assert/strict");

process.env.NEXT_PUBLIC_BASE_PATH = "/app-demo";
const { load } = require("./support/harness.cjs");
const { BASE_PATH, withBasePath } = load("@/lib/paths");

test("app paths get the base path once", () => {
  assert.equal(BASE_PATH, "/app-demo");
  assert.equal(withBasePath("/api/uploads/x.jpg"), "/app-demo/api/uploads/x.jpg");
  assert.equal(withBasePath("/api/placeholder/u1-0?t=MC&shape=portrait"), "/app-demo/api/placeholder/u1-0?t=MC&shape=portrait");
  assert.equal(withBasePath("/"), "/app-demo/");
  assert.equal(withBasePath("/app-demo/api/upload"), "/app-demo/api/upload");
  assert.equal(withBasePath("/app-demo"), "/app-demo");
});

test("absolute and protocol-relative URLs are left alone", () => {
  assert.equal(withBasePath("https://example.com/a.png"), "https://example.com/a.png");
  assert.equal(withBasePath("//cdn.example.com/a.png"), "//cdn.example.com/a.png");
  assert.equal(withBasePath("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
  assert.equal(withBasePath("/app-demonstration"), "/app-demo/app-demonstration");
});
