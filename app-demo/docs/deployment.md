# Deployment

Production runs on **Vercel**. The app lives at [trysidekick.ca/app-demo](https://www.trysidekick.ca/app-demo), and the bare domain redirects there. Vercel's server disk is read-only, and requests can land on different short-lived servers, so production needs a hosted database and hosted photo storage. When the environment variables below are set, the app uses them automatically. Without them it falls back to local files, which only works in development.

`GET /app-demo/api/health` reports which services are configured (never their values) and whether the database is reachable. Check it after every configuration change.

## 0. Project settings

The app is in the `app-demo/` folder of the repository. In Vercel, **Settings → Build and Deployment → Root Directory** must be `app-demo`. Everything else (framework preset Next.js, build command) stays on the defaults.

## 1. Database: Turso

In the Vercel project, open **Storage → Create → Turso**, or create a database at turso.tech. The project needs `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Tables, migrations and seed data are applied automatically on the first request. Pick a Turso region close to the Vercel function region (**Settings → Functions**), because every page runs several queries.

## 2. Photo storage: Vercel Blob

Open **Storage → Create → Blob** and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`. Public and private stores both work. Photos are always served through `/api/uploads/…`, which requires a signed-in session. Until Blob is connected, photo uploads show a "not set up yet" message.

## 3. Secrets

Add two long random values, for example from `openssl rand -hex 32`:

- `SESSION_SECRET` signs sign-in cookies. Changing it signs everyone out.
- `PHONE_HASH_PEPPER` keys phone-number hashes. **Never change it after launch**, or existing phone blocks and sample-profile numbers stop matching.

## 4. Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` (see [email.md](email.md)).

## 5. Redeploy

Environment variables only apply to new deployments. After changing them, go to **Deployments → ⋯ → Redeploy**.

The full list of variables, with comments, is in [`.env.example`](../.env.example).

## Domain

`trysidekick.ca` is registered at Squarespace, which also hosts its DNS:

| Record | Value | Purpose |
| --- | --- | --- |
| `A @` | `216.198.79.1` | Vercel (apex) |
| `CNAME www` | Vercel DNS target | Vercel (`www`, the canonical host) |
| `MX` | `mx.zohocloud.ca` (and Zoho's backups) | Zoho Mail for `hello@trysidekick.ca` |

## Git and Vercel

Vercel deploys `main` from the Git repository connected under **Settings → Git**. On the Hobby plan, a private repository only deploys commits whose author has access to the Vercel account. If a push shows **Blocked** in Deployments, check the commit author, or move the project to a team plan.

CI (`.github/workflows/ci.yml` at the repository root) runs lint, typecheck, tests and a production build of `app-demo/` on every push and pull request to `main`.
