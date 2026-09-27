/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const { ageOn, birthDateForAge, currentAge, isBirthDate, torontoToday } = require("../lib/age.ts");

test("age counts whole years and changes on the birthday", () => {
  assert.equal(ageOn("2007-09-26", "2025-09-25"), 17);
  assert.equal(ageOn("2007-09-26", "2025-09-26"), 18);
  assert.equal(ageOn("2007-09-26", "2026-01-01"), 18);
});

test("impossible or future dates have no age", () => {
  for (const bad of ["", "2006-02-30", "2006-13-01", "06-01-2006", "2006/01/01", null, 20060101]) assert.equal(isBirthDate(bad), false, String(bad));
  assert.equal(isBirthDate("2004-02-29"), true);
  assert.equal(ageOn("2030-01-01", "2026-09-26"), null);
});

test("Feb 29 birthdays and the picker limit", () => {
  assert.equal(ageOn("2004-02-29", "2022-02-28"), 17);
  assert.equal(ageOn("2004-02-29", "2022-03-01"), 18);
  assert.equal(birthDateForAge(18, "2026-09-26"), "2008-09-26");
  assert.equal(birthDateForAge(18, "2024-02-29"), "2006-02-28");
  assert.equal(ageOn(birthDateForAge(18, "2026-09-26"), "2026-09-26"), 18);
});

test("profiles without a birth date keep their stored age", () => {
  assert.equal(currentAge({ age: 21, birth_date: null }), 21);
  assert.equal(currentAge({ age: 99, birth_date: birthDateForAge(20) }), 20);
  assert.match(torontoToday(), /^\d{4}-\d{2}-\d{2}$/);
});
