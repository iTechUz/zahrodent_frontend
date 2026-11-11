/**
 * Klinika kontakt/sayt sozlamalari — yagona manba.
 * Qiymatlar build vaqtida VITE_* env'lardan olinadi (Docker ARG / cd.yml `vars.*`).
 * Sozlanmagan yoki ma'lum placeholder bo'lgan qiymatlar `null` bo'ladi — UI ularni
 * "o'lik" ko'rsatmasdan YASHIRADI.
 */
import type { Lang } from "@/i18n/translations";

type Env = Record<string, string | undefined>;

/** Dizayn paytidagi soxta raqam: haqiqiy emas, shuning uchun hech qachon ko'rsatilmaydi. */
export const PLACEHOLDER_PHONE = "+998901234567";
/** Hozirgi (eski) manzil koordinatalari — env berilmaganda fallback. */
export const DEFAULT_COORDS = { lat: 41.311081, lng: 69.279737 };
export const DEFAULT_TELEGRAM_CHANNEL_URL = "https://t.me/zahrodentaluz";
export const DEFAULT_EMAIL = "info@zahrodental.uz";
/** schema.org openingHours; translations'dagi ish vaqti bilan mos (Du–Sha 09–20, Yak 10–17). */
export const DEFAULT_OPENING_HOURS = ["Mo-Sa 09:00-20:00", "Su 10:00-17:00"];
/** Faqat lokal dev (vite dev) uchun; production build'da VITE_API_URL majburiy. */
export const DEV_API_URL = "http://localhost:3000";

export type Phone = { e164: string; display: string };

const clean = (v: string | undefined): string => (v ?? "").trim();

/** http(s) URL bo'lsa (oxiridagi "/" siz) qaytaradi, aks holda null. */
export function parseUrl(raw: string | undefined): string | null {
  const v = clean(raw);
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return v.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/** "+998 90 123 45 67" -> {e164, display}. Placeholder yoki noto'g'ri raqam -> null. */
export function parsePhone(raw: string | undefined): Phone | null {
  let d = clean(raw).replace(/\D/g, "");
  if (d.length === 9) d = `998${d}`;
  if (!/^998\d{9}$/.test(d)) return null;
  const e164 = `+${d}`;
  if (e164 === PLACEHOLDER_PHONE) return null;
  const l = d.slice(3);
  return { e164, display: `+998 ${l.slice(0, 2)} ${l.slice(2, 5)} ${l.slice(5, 7)} ${l.slice(7, 9)}` };
}

export function parseBotUsername(raw: string | undefined): string | null {
  const v = clean(raw).replace(/^@/, "");
  return /^[A-Za-z0-9_]{3,64}$/.test(v) ? v : null;
}

function parseCoord(raw: string | undefined, min: number, max: number, fallback: number): number {
  const v = clean(raw);
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

export function buildSiteConfig(env: Env) {
  const lat = parseCoord(env.VITE_CLINIC_LAT, -90, 90, DEFAULT_COORDS.lat);
  const lng = parseCoord(env.VITE_CLINIC_LNG, -180, 180, DEFAULT_COORDS.lng);
  const botUsername = parseBotUsername(env.VITE_TELEGRAM_BOT_USERNAME);
  const hours = clean(env.VITE_CLINIC_OPENING_HOURS)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const email = clean(env.VITE_CLINIC_EMAIL) || DEFAULT_EMAIL;

  return {
    /** null -> qo'ng'iroq tugmalari va raqam yashiriladi */
    phone: parsePhone(env.VITE_CLINIC_PHONE),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    /** Til bo'yicha env manzil; bo'sh bo'lsa translations'dagi matn ishlatiladi. */
    address: {
      uz: clean(env.VITE_CLINIC_ADDRESS_UZ) || undefined,
      ru: clean(env.VITE_CLINIC_ADDRESS_RU) || undefined,
      en: clean(env.VITE_CLINIC_ADDRESS_EN) || undefined,
    } as Partial<Record<Lang, string>>,
    coords: { lat, lng },
    openingHours: hours.length ? hours : DEFAULT_OPENING_HOURS,
    telegramChannelUrl: parseUrl(env.VITE_TELEGRAM_CHANNEL_URL) ?? DEFAULT_TELEGRAM_CHANNEL_URL,
    telegramBotUsername: botUsername,
    /** null -> "Telegram botni ochish" tugmasi (va bot bloki) yashiriladi; kanalga fallback YO'Q. */
    telegramBotUrl: botUsername ? `https://t.me/${botUsername}?start=lead` : null,
    instagramUrl: parseUrl(env.VITE_INSTAGRAM_URL),
    youtubeUrl: parseUrl(env.VITE_YOUTUBE_URL),
    facebookUrl: parseUrl(env.VITE_FACEBOOK_URL),
    whatsappUrl: parseUrl(env.VITE_WHATSAPP_URL),
    siteUrl: parseUrl(env.VITE_SITE_URL),
    /** Prod'da bo'sh bo'lsa Docker build yiqiladi; dev'da localhost. */
    apiUrl: (parseUrl(env.VITE_API_URL) ?? (env.DEV ? DEV_API_URL : "")) as string,
  };
}

export type SiteConfig = ReturnType<typeof buildSiteConfig>;

export const siteConfig: SiteConfig = buildSiteConfig({
  ...(import.meta.env as unknown as Env),
  DEV: import.meta.env.DEV ? "1" : undefined,
});

/** Env manzili bo'lsa shuni, aks holda translations matnini qaytaradi. */
export const resolveAddress = (cfg: SiteConfig, lang: Lang, fallback: string): string =>
  cfg.address[lang] ?? fallback;

export const mapEmbedUrl = ({ lat, lng }: SiteConfig["coords"]) =>
  `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;
export const mapDirectionsUrl = ({ lat, lng }: SiteConfig["coords"]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
