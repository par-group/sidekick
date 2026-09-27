// Birth dates are stored as "YYYY-MM-DD" and never shown; profiles show the age
// worked out from them, so it stays correct as birthdays pass. Safe for client and server.

/** Today's date in Toronto (York's time zone) as YYYY-MM-DD. */
export function torontoToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** True only for a real calendar date written as YYYY-MM-DD. */
export function isBirthDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Whole years between the birth date and `today` (both YYYY-MM-DD), or null if invalid or in the future. */
export function ageOn(birthDate: string, today: string = torontoToday()): number | null {
  if (!isBirthDate(birthDate) || !isBirthDate(today) || birthDate > today) return null;
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** The age to show and compare: from the birth date when we have one, else the stored age (seed profiles). */
export function currentAge(user: { age: number | null; birth_date?: string | null }): number | null {
  return (user.birth_date ? ageOn(user.birth_date) : null) ?? user.age;
}

/** Latest birth date that makes someone `years` old today (for the date picker's max). */
export function birthDateForAge(years: number, today: string = torontoToday()): string {
  const [y, m, d] = today.split("-").map(Number);
  // Feb 29 birthdays: use Feb 28 in non-leap years so the limit stays a real date.
  const target = `${String(y - years).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return isBirthDate(target) ? target : `${String(y - years).padStart(4, "0")}-02-28`;
}
