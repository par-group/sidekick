/* eslint-disable @typescript-eslint/no-require-imports */
// Shared test setup. Loads the app's TypeScript straight from src/ (resolving the
// "@/" alias), lets a test file replace modules it can't run outside Next.js, and
// gives each file a throwaway working directory with its own SQLite database.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const SRC = path.resolve(__dirname, "../../src");

require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};

// "server-only" throws outside a React Server environment; it guards bundling, not logic.
const mocks = new Map([["server-only", {}]]);
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (mocks.has(request)) return mocks.get(request);
  return originalLoad.call(this, request.startsWith("@/") ? path.join(SRC, request.slice(2)) : request, ...args);
};

/** Replace a module for this test file, keyed by the exact import specifier (e.g. "@/server/auth/session"). */
function mock(specifier, exports) {
  mocks.set(specifier, exports);
}

/** Load app code by its "@/..." specifier. */
function load(specifier) {
  return require(path.join(SRC, specifier.replace(/^@\//, "")));
}

/**
 * Run this file's tests in a fresh temp directory, so the local database, uploads
 * and generated secrets never touch the developer's ./data. Call before loading
 * any server code. Returns `cleanup` for the file's `after()` hook.
 */
function useTempWorkspace(name) {
  const originalCwd = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `sidekick-${name}-`));
  process.chdir(dir);
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.VERCEL;
  delete process.env.ALLOWED_EMAIL_DOMAINS;
  process.env.SESSION_SECRET = "test-only-session-secret";
  process.env.PHONE_HASH_PEPPER = "test-only-phone-pepper";
  return {
    dir,
    async cleanup() {
      (await load("@/server/db/client").db()).close();
      process.chdir(originalCwd);
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

module.exports = { load, mock, useTempWorkspace };
