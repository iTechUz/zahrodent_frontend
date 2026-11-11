/** Til bo'yicha SEO meta (title/description/og/html lang/JSON-LD) — DOM'ga yozuvchi toza yordamchilar. */
import type { Lang, TranslationDict } from "@/i18n/translations";
import { resolveAddress, type SiteConfig } from "@/config/site";

export const CLINIC_NAME = "ZAHRODENTAL";
const LD_ID = "ld-json-clinic";

/** schema.org Dentist; noma'lum maydonlar (telefon, url, ...) tushirib qoldiriladi. */
export function buildJsonLd(cfg: SiteConfig, lang: Lang, t: TranslationDict): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness"],
    name: CLINIC_NAME,
    description: t.meta.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: resolveAddress(cfg, lang, t.location.address),
      addressCountry: "UZ",
    },
    geo: { "@type": "GeoCoordinates", latitude: cfg.coords.lat, longitude: cfg.coords.lng },
    openingHours: cfg.openingHours,
  };
  if (cfg.phone) ld.telephone = cfg.phone.e164;
  if (cfg.siteUrl) ld.url = cfg.siteUrl;
  const sameAs = [cfg.instagramUrl, cfg.youtubeUrl, cfg.facebookUrl, cfg.telegramChannelUrl].filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;
  return ld;
}

function setMeta(doc: Document, attr: "name" | "property", key: string, value: string) {
  let el = doc.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = doc.createElement("meta");
    el.setAttribute(attr, key);
    doc.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(doc: Document, rel: string, href: string) {
  let el = doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = doc.createElement("link");
    el.setAttribute("rel", rel);
    doc.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applySeo(doc: Document, cfg: SiteConfig, lang: Lang, t: TranslationDict) {
  doc.documentElement.lang = lang;
  doc.title = t.meta.title;
  setMeta(doc, "name", "description", t.meta.description);
  setMeta(doc, "property", "og:title", t.meta.ogTitle);
  setMeta(doc, "property", "og:description", t.meta.ogDescription);
  setMeta(doc, "name", "twitter:title", t.meta.ogTitle);
  setMeta(doc, "name", "twitter:description", t.meta.ogDescription);
  setMeta(doc, "property", "og:locale", { uz: "uz_UZ", ru: "ru_RU", en: "en_US" }[lang]);
  if (cfg.siteUrl) {
    setLink(doc, "canonical", `${cfg.siteUrl}/`);
    setMeta(doc, "property", "og:url", `${cfg.siteUrl}/`);
  }
  let ld = doc.getElementById(LD_ID);
  if (!ld) {
    ld = doc.createElement("script");
    ld.id = LD_ID;
    ld.setAttribute("type", "application/ld+json");
    doc.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify(buildJsonLd(cfg, lang, t));
}
