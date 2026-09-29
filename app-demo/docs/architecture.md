# Architecture

Sidekick is a single Next.js 16 app (App Router, React 19, Tailwind v4) that serves both the public website and the signed-in product. Data lives in SQLite through `@libsql/client`: a local file in development, a hosted Turso database in production.

## Layers

| Layer | Folder | Rules |
| --- | --- | --- |
| Routes | `src/app` | Pages, layouts and route handlers. Thin: they read the session, call `src/server`, and render. Client components used by only one route sit next to it (e.g. `discover/Deck.tsx`). |
| UI | `src/components` | Shared components, grouped by area: `brand`, `ui`, `navigation`, `profile`, `account`, `site`, `demo`. |
| Shared | `src/lib` | Code the browser may load: constants (`config.ts`, `site.ts`), types, date/age helpers, the upload helper. No secrets, no database. |
| Server | `src/server` | Everything that touches the database, secrets, email or storage. Each module starts with `import "server-only"`, so importing one into a client component fails the build. |
| Mutations | `src/server/actions` | Server Actions (`"use server"`). The only way the UI changes data. Each one re-checks the session and validates its input. |

### Base path

The app is served under **`/app-demo`** (`basePath` in `next.config.ts`), so the domain root is free for something else later. Until then, the root and any old link without the prefix (`/login`, `/discover`, `/robots.txt`, …) redirect into `/app-demo` with a temporary (307) redirect.

- `next/link`, the router and `redirect()` add the prefix automatically.
- `<img src>` and `fetch()` don't, so hand-built URLs go through `withBasePath()` (`src/lib/paths.ts`).
- Stored URLs stay app-relative (`/api/uploads/…`, `/api/placeholder/…`) and get the prefix when rendered, so moving the app never requires a data migration.
- Icons are declared in the root layout's metadata rather than as `app/icon.*` files, because Next's generated `apple-touch-icon` link leaves out the base path.

### Route groups

- `(site)`: the public website (`/app-demo`, `/app-demo/support`, `/app-demo/privacy`, `/app-demo/terms`). Full-width layout with the site header and footer, indexed by search engines. The home page sends signed-in visitors straight into the app.
- `(app)`: sign-in, onboarding and the product, in a phone-width column. Marked `noindex` and disallowed in `robots.txt`.
  - `(tabs)`: the screens with the tab bar (Discover, Inbox, Matches, Profile, Settings). Its layout requires a finished profile.

Root-level files: `manifest.ts` and the icons (`public/icon.svg`, PNGs from `icons/[name]`) make the site installable on a home screen (`start_url` is `/app-demo/discover`). `opengraph-image.tsx` is the link-share card. `not-found.tsx` and `error.tsx` are the fallback pages.

## Request flow

1. **Session:** `server/auth/session.ts` stores `userId.expiresAt.signature` in an HMAC-signed, HTTP-only cookie (30 days). `requireOnboardedUser()` redirects to the right onboarding step; `assertOnboardedUser()` throws (for actions).
2. **Sign-in:** `server/actions/auth.ts`:
   1. `sendCode(email, phone)` accepts only `@my.yorku.ca` addresses and rejects a phone number that belongs to another account.
   2. It then emails a code through `server/auth/verification.ts` and `server/mailer.ts`.
   3. `verifyCode` consumes the code, creates or finds the account, links the phone, and sets the session.
3. **Visibility:** every query that shows one user to another goes through `server/visibility.ts`:
   - `MUTUALLY_VISIBLE_SQL` for Discover and comments;
   - `NOT_BLOCKED_SQL` for existing inbox items, matches and chats.

   These enforce audience, activation, phone blocks and the mutual gender filter in SQL.
4. **Database:** `server/db/client.ts` connects lazily once per server instance. It then runs `migrate()` (schema plus additive column migrations) and `seed()` (a one-time seed guarded by `app_meta`).

## Audiences: real students and the demo sandbox

Two audiences share the database but never see each other:

| | Real students | Demo sandbox |
| --- | --- | --- |
| Who | Everyone who signs in with a York email | The 30 sample profiles (`is_seed = 1`) and the shared demo account `demo@my.yorku.ca` |
| `users.is_sandbox` | `0` | `1` |
| Sign-in | Emailed 6-digit code | Fixed code `000000`, no email |
| Simulated activity | Never | When the demo account finishes its profile, sample profiles like it and leave comments. They also auto-reply in chat (`server/demo/simulation.ts`) |
| Demo tools in Settings | Hidden, and the actions refuse | "Skip ahead 30 days" and "Reset my swipes" |

The rule is enforced in the two visibility fragments (`viewer.is_sandbox = u.is_sandbox`), so it covers Discover, comments, inbox, matches, chat and friend profiles. `tests/sandbox.test.cjs` checks each of these. Each demo sign-in starts a blank demo profile; signing out deletes it.

**Trying phone blocks in the sandbox:** sample profiles use fictional numbers `+1 (555) 010-0001` to `+1 (555) 010-0030`, in the order of `SEED_USERS` in `server/db/seed.ts` (`0001` is Maya Chen, `0002` is Jordan Okafor). Block one from the demo account and that person disappears from Discover, Inbox, Matches and Chat in both directions.

## Data model

Raw SQL, no ORM (`server/db/schema.ts`); all timestamps are epoch milliseconds. The same code runs against a local file or Turso with no generate or migrate step.

- `users`: account, profile fields, flags (`profile_complete`, `is_active`, `is_seed`, `is_sandbox`, `demo_simulated`). The phone is stored normalized, with a keyed hash (`phone_hash`) used for blocks. Triggers keep emails and phone numbers unique without deleting legacy rows.
- `photos`, `user_interests`, `user_custom_tags`, `user_prompts`: profile content; `interest_tags` and `prompts` are the catalog.
- `swipes`, `pass_states`, `matches`, `comments`, `messages`: activity. `comments.dismissed_at` / `replied_at` and `matches.source` record how rows were resolved or created.
- `phone_blocks`: blocker, plus a keyed hash of the blocked number.
- `email_verifications`: hashed codes with expiry, attempt and send-rate counters.

**Migrations** are additive and idempotent (`server/db/migrate.ts`). To add a column, append it to `ADDED_USER_COLUMNS` and to the `CREATE TABLE` in `schema.ts`. Never drop or rename columns in place: the production database is migrated on every cold start.

## Product rules

- **Account activation:** Settings has an Account active switch. Turning it off hides the user from Discover, inbox and matches, and pauses browsing and chat, but keeps all data. Settings and logout stay available.
- **Unique accounts:**
  - Emails are compared without case or surrounding spaces.
  - A normalized phone number belongs to one account only. A number used by another account is refused before any code is sent.
  - The number typed at sign-in replaces the account's number once the code is verified.
- **Deck:** batches of up to 20, where every 4th card is a random discovery pick from outside the top affinity slice. The rest are ranked by affinity:
  - same main campus: 40;
  - shared interests: up to 25 (4 shared earns the full weight);
  - same major: 20;
  - age within 2 years: 10;
  - same residence status: 5.

  Campus is a preference, not a filter. Ties are broken randomly.
- **Excluded from the deck:**
  - people you've friend-swiped, and existing matches;
  - anyone in a 30-day pass cooldown, or permanently excluded;
  - blocked pairs (either direction);
  - anyone outside the gender filter, or in the other audience.
- **Passes:**
  1. The first pass starts a 30-day cooldown.
  2. After it, the person appears once more, with a "Second look" banner.
  3. A second pass excludes them permanently.
- **Matches:** created by a mutual friend swipe or by replying to a comment. There is at most one match per pair.
- **Comments:** on a photo, prompt or custom tag of someone you're allowed to see. Dismissing is silent.
- **Gender filter is mutual:** "same gender" also hides you from people outside that setting. "Rather not say" can't use it.
- **Residence names:** shown only to viewers who also live in residence. Everyone else sees "Lives in residence".
- **Academics:** main campus (Keele, Glendon, Markham), degree and major are required. Existing users fill them in on their next visit.
- **Validation:** every profile rule is enforced on the server:
  - 4 photos;
  - 3–5 interests;
  - a custom tag of up to 20 characters;
  - 3 distinct prompts, each with a written answer;
  - age 18+ from the birth date. Only the age is ever shown.

## Testing

`npm test` runs the suites in `tests/` with Node's built-in test runner. `tests/support/harness.cjs` does the shared setup:

- loads the TypeScript sources directly, resolving `@/` to `src/`;
- lets a suite replace modules that only work inside Next.js (the session cookie, `next/cache`, `server-only`);
- runs each file in a temporary directory with its own SQLite database.

Email delivery is mocked; everything else is the real code and real SQL.
