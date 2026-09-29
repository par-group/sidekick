# Sidekick

Sidekick is a friends-only app for York University students.

[![CI](https://github.com/parmisp/Sidekick/actions/workflows/ci.yml/badge.svg)](https://github.com/parmisp/Sidekick/actions/workflows/ci.yml)

## Repository layout

| Folder | What it is | Live at |
| --- | --- | --- |
| [`app-demo/`](app-demo/) | The web app: the public website plus the full product (sign-in, profiles, Discover, inbox, chat). Next.js. | [trysidekick.ca/app-demo](https://www.trysidekick.ca/app-demo) |
| `.github/workflows/` | CI: lint, typecheck, test and build for each project on every push | |

Each project is self-contained, with its own `package.json`, README and docs. Start with [app-demo/README.md](app-demo/README.md).

```bash
cd app-demo
npm install
npm run dev    # http://localhost:3000/app-demo
```

Deployment: the Vercel project's **Root Directory** is `app-demo` ([details](app-demo/docs/deployment.md)).
