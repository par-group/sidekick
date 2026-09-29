// Public-facing site details, used by metadata, the web app manifest and the
// website's pages. Safe for client and server.
import { BASE_PATH } from "./paths";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trysidekick.ca";

export const SITE = {
  name: "Sidekick",
  /** Where the website lives, base path included, e.g. https://www.trysidekick.ca/app-demo */
  url: `${ORIGIN}${BASE_PATH}`,
  /** Short form for body text, e.g. trysidekick.ca/app-demo */
  displayUrl: `${new URL(ORIGIN).host.replace(/^www\./, "")}${BASE_PATH}`,
  tagline: "Find your people at York.",
  description:
    "Sidekick is a friends-only app for York University students. Meet people who share your campus, classes and interests, and turn a conversation into plans.",
  supportEmail: "hello@trysidekick.ca",
} as const;

/** Pages anyone can read without an account (also the sitemap). */
export const PUBLIC_PAGES = ["/", "/support", "/privacy", "/terms"] as const;

/** Date shown on the Privacy Policy and Terms. Update it whenever either changes. */
export const LEGAL_LAST_UPDATED = "September 27, 2026";
