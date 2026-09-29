// Product configuration shared by the client and server. Code marked
// TODO(launch) is a stand-in to replace before a wider launch — see
// docs/launch-checklist.md.

/**
 * Allowed email domains, matched exactly: "my.yorku.ca" accepts
 * "name@my.yorku.ca" but not "name@yorku.ca" or "name@x.my.yorku.ca".
 * Override with ALLOWED_EMAIL_DOMAINS="my.yorku.ca,yorku.ca".
 */
export const ALLOWED_EMAIL_DOMAINS: string[] = (process.env.ALLOWED_EMAIL_DOMAINS ?? "my.yorku.ca")
  .split(",")
  .map((d) => d.trim().toLowerCase().replace(/^[.@]/, ""))
  .filter(Boolean);

// Only this shared demo account bypasses email delivery.
export const DEMO_EMAIL = "demo@my.yorku.ca";
export const DEMO_VERIFICATION_CODE = "000000";

export const PASS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
export const DECK_SIZE = 20;
export const DECK_AFFINITY_SHARE = 0.75;

// Compatibility weights total 100; campus is a preference, never an eligibility filter.
export const AFFINITY_WEIGHTS = { campus: 40, interests: 25, major: 20, age: 10, residence: 5 } as const;

export const MIN_INTERESTS = 3;
export const MAX_INTERESTS = 5;
export const CUSTOM_TAG_MAX = 20;
export const PROMPT_ANSWER_MAX = 160;
export const COMMENT_MAX = 200;
export const MESSAGE_MAX = 1000;
export const PHOTO_SLOTS = 4;
export const PROMPT_SLOTS = 3;
export const MIN_AGE = 18;
export const MAX_AGE = 99;

export function isAllowedEmail(email: string): boolean {
  const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email.trim().toLowerCase());
  return !!match && ALLOWED_EMAIL_DOMAINS.includes(match[1]);
}
