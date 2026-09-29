# Sidekick app demo

Sidekick is a friends-only app for York University students: swipe, reply to prompts, match and chat with people who share your campus and interests. This folder is the web version, live at **[trysidekick.ca/app-demo](https://www.trysidekick.ca/app-demo)** until the App Store release. It works in any browser and can be added to a phone's home screen.

## Getting started

Requires Node 20.9+ (CI uses the version in `.nvmrc`). Run everything from this folder:

```bash
cd app-demo
npm install
npm run dev          # http://localhost:3000/app-demo
```

No setup is needed to run locally. On the first request the app creates a SQLite database in `./data`, seeds the interest tags, prompts and 30 sample profiles, and generates local secrets. Sign in as **`demo@my.yorku.ca`** with code **`000000`** to try the app without email.

To sign in with a real York address locally, copy `.env.example` to `.env.local` and fill in the email settings ([docs/email.md](docs/email.md)).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint, typecheck and test (what CI runs, minus the build) |
| `npm run lint` · `npm run typecheck` · `npm test` | Each check on its own |
| `npm run db:reset` | Delete `./data` (local database, uploads, secrets) for a clean start |
| `npm run email:test -- you@my.yorku.ca` | Check the SMTP settings and send one test email |

## Project structure

```
src/
  app/                 Routes only: pages, layouts, route handlers
    (site)/            Public website: home, support, privacy, terms
    (app)/             The product (phone-width layout, not indexed)
      login/ setup/    Sign-in and onboarding
      (tabs)/          Discover, Inbox, Matches, Profile, Settings
      chat/            One-to-one chat
    api/               Route handlers: chat polling, uploads, health check
    manifest.ts …      Web app manifest, robots, sitemap, share image, app icons
  components/          Shared UI, grouped by area (brand, profile, site, …)
  lib/                 Code safe for the browser and server: config, types, helpers
  server/              Server-only code (guarded by `import "server-only"`)
    actions/           Server Actions: every mutation the UI can call
    auth/              Sessions and email verification codes
    db/                Connection, schema, migrations, seed data
    demo/              The demo sandbox: demo account and simulated activity
    deck.ts …          Domain logic: deck, visibility, inbox, matches, profiles
tests/                 Node test runner suites against a real temp SQLite database
scripts/               Maintenance scripts
docs/                  Architecture, deployment, email setup, launch checklist
```

## Documentation

- **[Architecture](docs/architecture.md):** how the code is organized, the data model, the product rules and the demo sandbox.
- **[Deployment](docs/deployment.md):** Vercel, Turso, Blob storage, secrets and the domain.
- **[Email](docs/email.md):** setting up sign-in codes with Zoho (or Gmail/Resend).
- **[Launch checklist](docs/launch-checklist.md):** what's simplified today and what's needed before the App Store.

## Conventions

- Routes stay thin: data access and rules live in `src/server`, and pages call them.
- Anything touching the database, secrets or email lives in `src/server` and starts with `import "server-only"`.
- Every mutation is a Server Action in `src/server/actions` that validates its input on the server.
- Components are PascalCase, other modules kebab-case, and imports use the `@/` alias (it points to `src/`).
- The app is served under `/app-demo` (`basePath` in `next.config.ts`). Links and redirects add it automatically; wrap hand-built URLs (`<img src>`, `fetch`) in `withBasePath()` from `src/lib/paths.ts`. The database stores app-relative paths like `/api/uploads/…`.
- Stand-ins that need replacing before a wider launch are marked `TODO(launch)`: `grep -rn "TODO(launch)" src`.
