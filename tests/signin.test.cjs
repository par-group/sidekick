/* eslint-disable @typescript-eslint/no-require-imports */
// Sign-in with York email + phone, codes emailed over SMTP (Gmail). Real SQLite in a
// temp directory; the SMTP transport and the session cookie are mocked.
const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");

const root = path.resolve(__dirname, "..");
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
let sessionUserId = null;
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === "@/lib/auth") return {
    setSession: async (id) => { sessionUserId = id; },
    clearSession: async () => { sessionUserId = null; },
    getCurrentUser: () => (sessionUserId ? get("SELECT * FROM users WHERE id = ?", [sessionUserId]) : null),
  };
  if (request === "next/navigation") return { redirect() {} };
  return originalLoad.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, ...args);
};

// Every SMTP send lands here instead of on the network.
const nodemailer = require("nodemailer");
let sent = [];
let transportOptions = [];
let smtpBehaviour = "accept";
nodemailer.createTransport = nodemailer.default.createTransport = (options) => {
  transportOptions.push(options);
  return {
    sendMail: async (message) => {
      if (smtpBehaviour === "throw") throw new Error("connection refused");
      sent.push(message);
      return { accepted: smtpBehaviour === "reject-recipient" ? [] : [message.to], rejected: [] };
    },
  };
};

const originalCwd = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "sidekick-signin-"));
process.chdir(temp);
delete process.env.TURSO_DATABASE_URL;
delete process.env.VERCEL;
delete process.env.ALLOWED_EMAIL_DOMAINS;
process.env.SESSION_SECRET = "test-only-session-secret";
process.env.PHONE_HASH_PEPPER = "test-only-phone-pepper";

const { isAllowedEmail } = require("../lib/config.ts");
const { requestVerification, consumeVerification } = require("../lib/verification.ts");
const { linkPhone, parsePhone, phoneTakenByOther, PHONE_TAKEN, PHONE_INVALID } = require("../lib/phone-link.ts");
const { sendCode, verifyCode } = require("../app/actions/auth.ts");
const { db, get, run } = require("../lib/db.ts");

const originalFetch = global.fetch;
const sentCode = () => sent.at(-1).text.match(/\b\d{6}\b/)[0];
const allowResend = () => run("UPDATE email_verifications SET sent_at = sent_at - 61000");

beforeEach(async () => {
  await run("DELETE FROM email_verifications");
  await run("DELETE FROM users WHERE is_seed = 0");
  sent = [];
  transportOptions = [];
  smtpBehaviour = "accept";
  sessionUserId = null;
  process.env.SMTP_USER = "sidekick.app@gmail.com";
  process.env.SMTP_PASS = "abcd efgh ijkl mnop";
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  global.fetch = async () => {
    throw new Error("Resend must not be called when SMTP is configured");
  };
});
after(async () => {
  (await db()).close();
  global.fetch = originalFetch;
  Module._load = originalLoad;
  process.chdir(originalCwd);
  fs.rmSync(temp, { recursive: true, force: true });
});

test("only exact @my.yorku.ca addresses are allowed", () => {
  for (const ok of ["a@my.yorku.ca", " A.B@MY.YORKU.CA ", "demo@my.yorku.ca"]) assert.equal(isAllowedEmail(ok), true, ok);
  for (const bad of ["a@yorku.ca", "a@x.my.yorku.ca", "a@my.yorku.ca.evil.com", "a@utoronto.ca", "a@gmail.com", "a@edu", "my.yorku.ca"]) {
    assert.equal(isAllowedEmail(bad), false, bad);
  }
});

test("codes go out over Gmail SMTP, even when Resend is also configured", async () => {
  process.env.RESEND_API_KEY = "also-set";
  process.env.EMAIL_FROM = "Sidekick <sidekick.app@gmail.com>";
  assert.equal((await requestVerification("Student@My.Yorku.ca")).ok, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "student@my.yorku.ca");
  assert.match(sent[0].subject, /verification code/i);
  const [options] = transportOptions;
  assert.equal(options.host, "smtp.gmail.com");
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.equal(options.auth.pass, "abcdefghijklmnop", "spaces in a Gmail App Password are ignored");
  const code = sentCode();
  assert.equal((await consumeVerification("student@my.yorku.ca", code)).ok, true);
  assert.equal((await consumeVerification("student@my.yorku.ca", code)).ok, false, "single use");
});

test("a Zoho custom-domain account uses the server it names", async () => {
  process.env.SMTP_HOST = "smtppro.zoho.com";
  process.env.SMTP_USER = "hello@sidekick.example";
  process.env.SMTP_PASS = "zoho app password";
  assert.equal((await requestVerification("a@my.yorku.ca")).ok, true);
  const [options] = transportOptions;
  assert.equal(options.host, "smtppro.zoho.com");
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.equal(options.auth.user, "hello@sidekick.example");
  assert.equal(options.auth.pass, "zoho app password", "only Gmail passwords have spaces removed");
  assert.equal(sent[0].from, "Sidekick <hello@sidekick.example>", "Zoho only sends from the signed-in address");
});

test("a non-Gmail address without SMTP_HOST counts as not configured", async () => {
  process.env.SMTP_USER = "hello@sidekick.example";
  const res = await requestVerification("a@my.yorku.ca");
  assert.equal(res.ok, false);
  assert.match(res.error, /isn't available yet/);
  assert.equal(transportOptions.length, 0, "never falls back to Gmail's server");
});

test("the sender defaults to the Gmail account and can be overridden", async () => {
  await requestVerification("a@my.yorku.ca");
  assert.equal(sent[0].from, "Sidekick <sidekick.app@gmail.com>");
  process.env.EMAIL_FROM = "Sidekick Team <sidekick.app@gmail.com>";
  await allowResend();
  await requestVerification("a@my.yorku.ca");
  assert.equal(sent[1].from, "Sidekick Team <sidekick.app@gmail.com>");
});

test("a failed or refused SMTP send never produces a usable code", async () => {
  smtpBehaviour = "throw";
  assert.equal((await requestVerification("a@my.yorku.ca")).ok, false);
  const row = await get("SELECT code_hash, expires_at FROM email_verifications WHERE email = ?", ["a@my.yorku.ca"]);
  assert.equal(row.code_hash, "");
  assert.equal(row.expires_at, 0);

  smtpBehaviour = "reject-recipient";
  await allowResend();
  assert.equal((await requestVerification("a@my.yorku.ca")).ok, false);
  assert.equal((await consumeVerification("a@my.yorku.ca", sentCode())).ok, false);
});

test("with no email provider configured, sign-in says so and sends nothing", async () => {
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  const res = await requestVerification("a@my.yorku.ca");
  assert.equal(res.ok, false);
  assert.match(res.error, /isn't available yet/);
  assert.equal(sent.length, 0);
});

test("a phone number can belong to only one account", async () => {
  await run("INSERT INTO users (id, email, created_at) VALUES ('u1', 'one@my.yorku.ca', 0), ('u2', 'two@my.yorku.ca', 0)");
  assert.equal((await linkPhone("u1", "(416) 555-0100")).ok, true);
  assert.equal((await linkPhone("u1", "416-555-0100")).ok, true, "re-saving your own number is fine");
  assert.deepEqual(await linkPhone("u2", "+1 416 555 0100"), { ok: false, error: PHONE_TAKEN });
  assert.deepEqual(await linkPhone("u2", "12"), { ok: false, error: PHONE_INVALID });
  const { hash } = parsePhone("4165550100");
  assert.equal(await phoneTakenByOther(hash, { email: " ONE@my.yorku.ca " }), false);
  assert.equal(await phoneTakenByOther(hash, { email: "two@my.yorku.ca" }), true);
  assert.equal((await get("SELECT phone FROM users WHERE id = 'u1'")).phone, "14165550100");
});

test("full sign-in: new York student gets an account with their phone attached", async () => {
  assert.equal((await sendCode("new.student@my.yorku.ca", "(647) 555-0199")).ok, true);
  assert.equal(sent.at(-1).to, "new.student@my.yorku.ca");
  const res = await verifyCode("new.student@my.yorku.ca", "(647) 555-0199", sentCode());
  assert.equal(res.ok, true);
  assert.equal(res.next, "/setup");
  const user = await get("SELECT * FROM users WHERE email = 'new.student@my.yorku.ca'");
  assert.equal(user.id, sessionUserId);
  assert.equal(user.phone, "16475550199");
});

test("returning student signs into the same account and can change their number", async () => {
  await sendCode("back@my.yorku.ca", "647-555-0111");
  await verifyCode("back@my.yorku.ca", "647-555-0111", sentCode());
  const first = sessionUserId;
  await allowResend();
  await sendCode("back@my.yorku.ca", "647-555-0222");
  const res = await verifyCode("back@my.yorku.ca", "647-555-0222", sentCode());
  assert.equal(res.ok, true);
  assert.equal(sessionUserId, first);
  assert.equal((await get("SELECT COUNT(*) AS n FROM users WHERE email = 'back@my.yorku.ca'")).n, 1);
  assert.equal((await get("SELECT phone FROM users WHERE id = ?", [first])).phone, "16475550222");
});

test("sign-in refuses other schools, bad numbers and someone else's number before sending a code", async () => {
  assert.equal((await sendCode("someone@gmail.com", "647-555-0100")).ok, false);
  assert.equal((await sendCode("someone@yorku.ca", "647-555-0100")).ok, false);
  assert.equal((await sendCode("someone@my.yorku.ca", "12")).ok, false);
  await run("INSERT INTO users (id, email, phone, phone_hash, created_at) VALUES ('owner', 'owner@my.yorku.ca', '16475550333', ?, 0)", [
    parsePhone("647-555-0333").hash,
  ]);
  assert.deepEqual(await sendCode("thief@my.yorku.ca", "647-555-0333"), { ok: false, error: PHONE_TAKEN });
  assert.equal((await sendCode("owner@my.yorku.ca", "647-555-0333")).ok, true, "the owner can use their own number");
  assert.equal(sent.length, 1);
});

test("a wrong code or a bad number at the last step does not sign anyone in", async () => {
  await sendCode("careful@my.yorku.ca", "647-555-0444");
  const code = sentCode();
  assert.equal((await verifyCode("careful@my.yorku.ca", "647-555-0444", code === "123456" ? "654321" : "123456")).ok, false);
  assert.equal((await verifyCode("careful@my.yorku.ca", "12", code)).ok, false, "a bad number is rejected before the code is used");
  assert.equal(sessionUserId, null);
  assert.equal((await verifyCode("careful@my.yorku.ca", "647-555-0444", code)).ok, true, "the code still works afterwards");
});

test("the demo account still signs in with 000000 and keeps the typed phone", async () => {
  assert.equal((await sendCode("demo@my.yorku.ca", "647-555-0555")).ok, true);
  assert.equal(sent.length, 0, "no email for the demo account");
  const res = await verifyCode("demo@my.yorku.ca", "647-555-0555", "000000");
  assert.equal(res.ok, true);
  assert.equal(res.next, "/setup");
  assert.equal((await get("SELECT phone FROM users WHERE id = ?", [sessionUserId])).phone, "16475550555");
});
