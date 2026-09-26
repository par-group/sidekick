import { get, run } from "./db";
import { hashPhone, normalizePhone } from "./phone";
import type { ActionResult } from "./types";

export const PHONE_INVALID = "Enter a valid phone number, including area code.";
export const PHONE_TAKEN = "This number is already linked to an account. Please sign in to that account or use a different number.";

export function parsePhone(phone: unknown): { normalized: string; hash: string } | null {
  const normalized = typeof phone === "string" ? normalizePhone(phone) : null;
  return normalized ? { normalized, hash: hashPhone(normalized) } : null;
}

/**
 * True when the number belongs to an account other than `owner`: identified by
 * user id, or by email for someone who is still signing in.
 */
export async function phoneTakenByOther(hash: string, owner: { userId: string } | { email: string }): Promise<boolean> {
  const row =
    "userId" in owner
      ? await get("SELECT 1 AS taken FROM users WHERE phone_hash = ? AND id != ?", [hash, owner.userId])
      : await get("SELECT 1 AS taken FROM users WHERE phone_hash = ? AND lower(trim(email)) != ?", [hash, owner.email.trim().toLowerCase()]);
  return !!row;
}

/** Saves (or replaces) the account's number. One number can only belong to one account. */
export async function linkPhone(userId: string, phone: unknown): Promise<ActionResult> {
  const parsed = parsePhone(phone);
  if (!parsed) return { ok: false, error: PHONE_INVALID };
  if (await phoneTakenByOther(parsed.hash, { userId })) return { ok: false, error: PHONE_TAKEN };
  try {
    // The database also enforces this rule if two signups race for one number.
    const result = await run("UPDATE users SET phone = ?, phone_hash = ? WHERE id = ?", [parsed.normalized, parsed.hash, userId]);
    if (!result.changes) return { ok: false, error: "Your session expired — sign in again." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("PHONE_ALREADY_LINKED")) return { ok: false, error: PHONE_TAKEN };
    return { ok: false, error: "We couldn’t save your number. Please try again." };
  }
  return { ok: true };
}
