/** Landing booking form: phone mask + validation (kept framework-free so it is unit-testable). */

export const NAME_MAX = 60;
export const NOTE_MAX = 500;

/** Digits of the local part (after +998), max 9. Accepts pasted "+998…", "998…", "8…" or local digits. */
export function localDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  return d.slice(0, 9);
}

/** "+998 90 123 45 67" as you type; "" when nothing typed. */
export function formatPhone(input: string): string {
  const d = localDigits(input);
  if (!d) return "";
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(" ")}`;
}

/** E.164 for the API, e.g. "+998901234567". */
export function toE164(input: string): string {
  return `+998${localDigits(input)}`;
}

export const isValidPhone = (input: string) => localDigits(input).length === 9;

/** Letters (any script), spaces, apostrophes, hyphens, dots; 2–60 chars. */
export function isValidName(input: string): boolean {
  const v = input.trim();
  return v.length >= 2 && v.length <= NAME_MAX && /^[\p{L}][\p{L}\p{M}\s'’ʻʼ`.-]*$/u.test(v);
}

/** Strips characters that can never be part of a name while typing. */
export const cleanName = (input: string) => input.replace(/[^\p{L}\p{M}\s'’ʻʼ`.-]/gu, "").replace(/\s{2,}/g, " ").slice(0, NAME_MAX);

/** Today in Asia/Tashkent as YYYY-MM-DD (the clinic's calendar day). */
export function todayTashkent(now: Date = new Date()): string {
  return new Date(now.getTime() + 5 * 3600_000).toISOString().slice(0, 10);
}

export function maxBookingDate(now: Date = new Date()): string {
  const d = new Date(now.getTime() + 5 * 3600_000);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export const isValidDate = (v: string, now: Date = new Date()) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= todayTashkent(now) && v <= maxBookingDate(now);
