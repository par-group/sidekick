import "server-only";
import { DEMO_EMAIL } from "@/lib/config";
import { newId, run, tx } from "@/server/db/client";
import type { UserRow } from "@/lib/types";

// The shared demo account (demo@my.yorku.ca, code 000000) lives in the sandbox
// with the sample profiles: it only ever sees them, and real students never see it.

/** True for the shared demo account, which unlocks demo-only tools. */
export function isDemoAccount(user: Pick<UserRow, "email">): boolean {
  return user.email.trim().toLowerCase() === DEMO_EMAIL;
}

/** Start a fresh demo identity, invalidating cookies for the previous demo run. */
export async function resetDemoAccount() {
  const id = newId();
  await tx(async (t) => {
    await run("DELETE FROM users WHERE email = ?", [DEMO_EMAIL], t);
    await run("INSERT INTO users (id, email, is_sandbox, created_at) VALUES (?, ?, 1, ?)", [id, DEMO_EMAIL, Date.now()], t);
  });
  return { id, phone: null, profile_complete: 0 };
}

export async function clearDemoAccount(userId: string) {
  // Both conditions are required: this can never erase a normal account.
  await run("DELETE FROM users WHERE id = ? AND email = ?", [userId, DEMO_EMAIL]);
}
