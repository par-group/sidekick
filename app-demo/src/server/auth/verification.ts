import "server-only";
import { createHmac, randomInt, randomUUID } from "node:crypto";
import { DEMO_EMAIL, DEMO_VERIFICATION_CODE, isAllowedEmail } from "@/lib/config";
import { get, run } from "@/server/db/client";
import { deliverEmail, emailProvider } from "@/server/mailer";
import { getSecrets } from "@/server/secrets";
import type { ActionResult } from "@/lib/types";

const EXPIRY_MS = 10 * 60_000;
const COOLDOWN_MS = 60_000;
const WINDOW_MS = 60 * 60_000;
const MAX_SENDS = 5;
const MAX_ATTEMPTS = 5;
const INVALID_CODE = "That code is incorrect or expired. Request a new code if needed.";

function normalize(email: string) {
  return email.trim().toLowerCase();
}

function digest(email: string, nonce: string, code: string) {
  return createHmac("sha256", getSecrets().sessionSecret)
    .update(JSON.stringify([email, nonce, code])).digest("hex");
}

export async function requestVerification(email: string): Promise<ActionResult> {
  if (typeof email !== "string" || email.length > 254 || !isAllowedEmail(email)) {
    return { ok: false, error: "Use your York email address (yourname@my.yorku.ca)." };
  }
  email = normalize(email);
  if (email === DEMO_EMAIL) return { ok: true };

  if (!emailProvider()) {
    return { ok: false, error: "Email sign-in isn't available yet. Please try again later." };
  }

  // Exclude 000000 so it is reserved exclusively for the demo account.
  const code = String(randomInt(1, 1_000_000)).padStart(6, "0");
  const nonce = randomUUID();
  const now = Date.now();
  // Reserve the send atomically, including across serverless instances.
  const reserved = await run(`
    INSERT INTO email_verifications
      (email, nonce, code_hash, expires_at, attempts, delivered, sent_at, window_start, send_count)
    VALUES (?, ?, ?, ?, 0, 0, ?, ?, 1)
    ON CONFLICT(email) DO UPDATE SET
      nonce = excluded.nonce, code_hash = excluded.code_hash,
      expires_at = excluded.expires_at, attempts = 0, delivered = 0,
      sent_at = excluded.sent_at,
      window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END,
      send_count = CASE WHEN window_start <= ? THEN 1 ELSE send_count + 1 END
    WHERE sent_at <= ? AND (window_start <= ? OR send_count < ?)
  `, [email, nonce, digest(email, nonce, code), now + EXPIRY_MS, now, now,
    now - WINDOW_MS, now - WINDOW_MS, now - COOLDOWN_MS, now - WINDOW_MS, MAX_SENDS]);
  if (!reserved.changes) {
    return { ok: false, error: "Please wait at least a minute between codes. You can request up to 5 codes per hour." };
  }

  try {
    await deliverEmail({
      to: email,
      subject: "Your Sidekick verification code",
      text: `Your Sidekick verification code is ${code}.\n\nIt expires in 10 minutes and can only be used once. If you didn't request this code, you can ignore this email.`,
      idempotencyKey: nonce,
    });
    await run("UPDATE email_verifications SET delivered = 1 WHERE email = ? AND nonce = ?", [email, nonce]);
    return { ok: true };
  } catch {
    // Keep rate limits, but make an unsuccessful/uncertain send unusable.
    await run("UPDATE email_verifications SET code_hash = '', expires_at = 0 WHERE email = ? AND nonce = ?", [email, nonce]);
    return { ok: false, error: "We couldn't send your code. Please wait a minute and try again." };
  }
}

export async function consumeVerification(email: string, code: string): Promise<ActionResult> {
  if (typeof email !== "string" || email.length > 254 || !isAllowedEmail(email) || typeof code !== "string") {
    return { ok: false, error: INVALID_CODE };
  }
  email = normalize(email);
  code = code.trim();
  if (email === DEMO_EMAIL) {
    return code === DEMO_VERIFICATION_CODE ? { ok: true } : { ok: false, error: INVALID_CODE };
  }
  if (!/^\d{6}$/.test(code)) return { ok: false, error: INVALID_CODE };

  const row = await get<{ nonce: string }>(
    "SELECT nonce FROM email_verifications WHERE email = ?", [email],
  );
  if (!row) return { ok: false, error: INVALID_CODE };
  const supplied = digest(email, row.nonce, code);
  // One atomic write checks the current challenge, counts the guess and consumes
  // a match. Concurrent requests cannot reuse it or exceed the guess limit.
  const result = await get<{ code_hash: string }>(`
    UPDATE email_verifications SET
      attempts = attempts + 1,
      expires_at = CASE WHEN code_hash = ? THEN 0 ELSE expires_at END,
      code_hash = CASE WHEN code_hash = ? THEN '' ELSE code_hash END
    WHERE email = ? AND nonce = ? AND delivered = 1
      AND expires_at > ? AND attempts < ? AND code_hash != ''
    RETURNING code_hash
  `, [supplied, supplied, email, row.nonce, Date.now(), MAX_ATTEMPTS]);
  return result?.code_hash === "" ? { ok: true } : { ok: false, error: INVALID_CODE };
}
