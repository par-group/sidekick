"use server";

import { redirect } from "next/navigation";
import { clearSession, getCurrentUser, setSession } from "@/server/auth/session";
import { consumeVerification, requestVerification } from "@/server/auth/verification";
import { DEMO_EMAIL, isAllowedEmail } from "@/lib/config";
import { clearDemoAccount, isDemoAccount, resetDemoAccount } from "@/server/demo/account";
import { get, newId, run } from "@/server/db/client";
import { linkPhone, parsePhone, PHONE_INVALID, PHONE_TAKEN, phoneTakenByOther } from "@/server/phone";
import type { ActionResult } from "@/lib/types";

/** Step 1 of sign-in: York email + phone number. The code always goes to the email. */
export async function sendCode(email: string, phone: string): Promise<ActionResult> {
  try {
    if (typeof email !== "string" || !isAllowedEmail(email)) {
      return { ok: false, error: "Use your York email address (yourname@my.yorku.ca)." };
    }
    const parsed = parsePhone(phone);
    if (!parsed) return { ok: false, error: PHONE_INVALID };
    // Catch a number that belongs to someone else before spending a code on it.
    if (await phoneTakenByOther(parsed.hash, { email })) return { ok: false, error: PHONE_TAKEN };
    return await requestVerification(email);
  } catch {
    return { ok: false, error: "We couldn't start sign-in. Please try again later." };
  }
}

export async function verifyCode(email: string, phone: string, code: string): Promise<ActionResult<{ next: string }>> {
  // Check the number first so a typo doesn't burn a valid code.
  if (!parsePhone(phone)) return { ok: false, error: PHONE_INVALID };
  try {
    const verification = await consumeVerification(email, code);
    if (!verification.ok) return verification;
  } catch {
    return { ok: false, error: "We couldn't verify your code. Please try again later." };
  }

  const normalized = email.trim().toLowerCase();
  let user: { id: string; phone: string | null; profile_complete: number };
  let phoneSaved: boolean;
  try {
    if (normalized === DEMO_EMAIL) {
      user = await resetDemoAccount();
    } else {
      // INSERT OR IGNORE so two simultaneous first logins can't create duplicate accounts.
      await run("INSERT OR IGNORE INTO users (id, email, created_at) VALUES (?, ?, ?)", [newId(), normalized, Date.now()]);
      user = (await get<{ id: string; phone: string | null; profile_complete: number }>(
        "SELECT id, phone, profile_complete FROM users WHERE lower(trim(email)) = ?",
        [normalized],
      ))!;
    }
    // The email is now proven, so the number typed at sign-in becomes the account's number.
    phoneSaved = (await linkPhone(user.id, phone)).ok;
  } catch (e) {
    // Most likely the deployment has no database configured yet — see /api/health.
    console.error("Sign-in failed", e);
    return { ok: false, error: "This deployment isn't finished being set up (no database). Check /api/health." };
  }
  await setSession(user.id);
  // If someone claimed the number in the meantime, let them pick another one.
  return { ok: true, next: !phoneSaved ? "/login/phone" : user.profile_complete ? "/discover" : "/setup" };
}

export async function savePhone(phone: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };
  // TODO(launch): verify phone ownership via SMS. For now the number is trusted as typed.
  return linkPhone(user.id, phone);
}

export async function logout() {
  const user = await getCurrentUser();
  if (user && isDemoAccount(user)) await clearDemoAccount(user.id);
  await clearSession();
  redirect("/login");
}

export async function restartDemo(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !isDemoAccount(user)) return { ok: false, error: "This option is only available for the demo account." };
  try {
    const fresh = await resetDemoAccount();
    await setSession(fresh.id);
  } catch {
    return { ok: false, error: "Couldn't restart the demo. Please try again." };
  }
  redirect("/login/phone");
}
