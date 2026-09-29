# Sign-in emails

Sign-in is **York email (`@my.yorku.ca`) + phone number**. The 6-digit code is always emailed, over SMTP, from a mailbox on our domain. Production sends from `hello@trysidekick.ca` on **Zoho Mail**.

## Zoho setup

1. **`SMTP_HOST`**: `smtppro.` plus the domain in your browser's address bar when you're in Zoho Mail:

   | You log in at | `SMTP_HOST` |
   | --- | --- |
   | `mail.zoho.com` | `smtppro.zoho.com` |
   | `mail.zohocloud.ca` | `smtppro.zohocloud.ca` |
   | `mail.zoho.eu` | `smtppro.zoho.eu` |
   | `mail.zoho.in` | `smtppro.zoho.in` |
   | `mail.zoho.com.au` | `smtppro.zoho.com.au` |

2. **`SMTP_PORT`**: `465`.
3. **`SMTP_USER`**: the full Zoho address, e.g. `hello@trysidekick.ca`. Codes are sent from it.
4. **`SMTP_PASS`**: an app-specific password, created as follows:
   1. Go to your Zoho account settings (`accounts.zoho.com`, or the same region as above) → **Security** → **App Passwords** → **Generate New Password**.
   2. Name it "Sidekick" and copy it. It's shown only once.

   If there's no App Passwords option, turn on **Multi-Factor Authentication** on that page first.
5. Put the four values in `.env.local` (see `.env.example`) and in the Vercel project's environment variables. Then restart the dev server or redeploy.
6. Run `npm run email:test -- yourname@my.yorku.ca`. It logs in to Zoho and sends one test email, and says which setting is wrong if it can't.

`/app-demo/api/health` shows `"emailDelivery": "smtp"` once the settings are picked up.

**Zoho's free plan can't send mail from apps** (it's web and mobile only). If `email:test` says the login was refused and the password is right, check the plan in the Zoho Mail Admin Console.

## Alternatives

- **Resend:** verify the domain at [resend.com](https://resend.com), then set `RESEND_API_KEY` and `EMAIL_FROM`, and remove the `SMTP_*` values. SMTP wins when both are configured.
- **Gmail:** set only `SMTP_USER` (a `@gmail.com` address) and `SMTP_PASS`. The password is an [App Password](https://myaccount.google.com/apppasswords), which needs 2-Step Verification. `SMTP_HOST` can be left out. Gmail allows about 500 emails a day.

## Behaviour

- Without an email sender, real sign-ins show an "unavailable" message instead of pretending to send a code. The demo account still works.
- Codes are random and hashed. Each code:
  - expires after 10 minutes;
  - can be used once, with 5 guesses.
- A new code replaces the previous one. Sends are limited to one every 60 seconds and 5 per hour per email, and failed sends count toward the limit.
- The first codes may land in spam.

`npm test` covers verification with mocked delivery. To check real delivery, sign in with a York inbox you own.
