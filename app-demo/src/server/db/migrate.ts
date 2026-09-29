import "server-only";
import type { Client } from "@libsql/client";
import { DEMO_EMAIL } from "@/lib/config";
import { SCHEMA } from "./schema";

// Columns added to `users` after the first release. Older databases gain them
// in place; nothing is dropped or rewritten.
const ADDED_USER_COLUMNS: [name: string, definition: string][] = [
  ["hometown", "TEXT"],
  ["residence_id", "TEXT"],
  ["main_campus", "TEXT"],
  ["degree", "TEXT"],
  ["birth_date", "TEXT"],
  ["is_active", "INTEGER NOT NULL DEFAULT 1"],
  ["is_sandbox", "INTEGER NOT NULL DEFAULT 0"],
];

async function userColumns(client: Client): Promise<Set<string>> {
  return new Set((await client.execute("PRAGMA table_info(users)")).rows.map((column) => String(column.name)));
}

/** Creates missing tables and applies additive migrations. Safe to run on every cold start. */
export async function migrate(client: Client) {
  await client.executeMultiple(SCHEMA);

  const existing = await userColumns(client);
  for (const [name, definition] of ADDED_USER_COLUMNS) {
    if (existing.has(name)) continue;
    try {
      await client.execute(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
    } catch (error) {
      // Another server instance may have applied the same migration first.
      if (!(await userColumns(client)).has(name)) throw error;
    }
  }

  // Sample profiles and the shared demo account live in a sandbox that real
  // students never see (see visibility.ts). Idempotent backfill for databases
  // created before the sandbox existed.
  await client.execute({
    sql: "UPDATE users SET is_sandbox = 1 WHERE is_sandbox = 0 AND (is_seed = 1 OR lower(trim(email)) = ?)",
    args: [DEMO_EMAIL],
  });
}
