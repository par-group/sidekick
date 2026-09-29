# Launch checklist

The website is live for York students. This page lists what's still simplified, and what's needed before the App Store release. Code stand-ins are marked `TODO(launch)` (`grep -rn "TODO(launch)" src`).

## Before inviting more students

| Area | Today | Needed |
| --- | --- | --- |
| **Photo storage** | Works once Vercel Blob is connected ([deployment.md](deployment.md)). Replaced photos are never deleted, and photos are served through an app route (no CDN) | Connect Blob. Then: delete on replace and on account deletion, EXIF/location stripping, CDN delivery |
| **Account deletion** | By email request; the Privacy Policy promises 30 days | A "Delete account" button in Settings. **Apple requires in-app deletion** for apps with sign-up |
| **Reporting** | By email to `hello@trysidekick.ca` | In-app report and block-user flows, with a review queue |
| **Moderation** | A tiny word-list filter on profile text and comments (`server/moderation.ts`). Chat messages and **images are not moderated** | Real text and image moderation (including nudity and CSAM detection), plus rate limits on comments and messages |
| **Legal pages** | Plain-language Privacy Policy and Terms written from how the app actually works | Review by someone qualified (PIPEDA, and Ontario law). Confirm the legal operator name, and update `LEGAL_LAST_UPDATED` in `src/lib/site.ts` on every change |

## Before the App Store

| Area | Today | Needed |
| --- | --- | --- |
| **Phone number** | Stored as typed, with no SMS check. 10-digit numbers are assumed North American | SMS verification, E.164 parsing (e.g. libphonenumber), and encryption at rest (or don't keep the raw number) |
| **Sessions** | An HMAC-signed cookie (`server/auth/session.ts`) | Revocable sessions (a sessions table), token auth for the native app, key rotation |
| **Chat** | The client polls every 2 seconds | Websockets/SSE, push notifications, delivery and read state |
| **Email** | SMTP from a Zoho mailbox | A transactional email provider on the domain (higher limits, better inbox placement), plus IP-level abuse protection |
| **Age and student status** | Self-reported birth date (18+); York email verified once | Periodic re-verification of student status (e.g. yearly) |
| **Database** | SQLite on Turso, additive migrations on startup | Backups and restore drills, a versioned migration tool, indexes tuned for real load |
| **Deck scale** | Scores every eligible user in memory on each load | Precomputed candidates and pagination past a few thousand users per campus |
| **Demo sandbox** | Shared demo account `demo@my.yorku.ca` / `000000`, isolated from real students | Keep it for App Review (Apple needs a demo login). Give reviewers the credentials in App Store Connect |

## App Store Connect needs

- Support URL: `https://www.trysidekick.ca/app-demo/support`
- Privacy Policy URL: `https://www.trysidekick.ca/app-demo/privacy`
- A demo account for App Review: `demo@my.yorku.ca`, code `000000`
- In-app account deletion (see above)
