import { describe, expect, it } from "vitest";
import { buildSiteConfig } from "@/config/site";
import { translations } from "@/i18n/translations";
import { applySeo, buildJsonLd } from "./seo";
import { buildRobotsTxt, buildSitemapXml } from "./robots";

describe("applySeo", () => {
  it("updates title, description, og and html lang per language", () => {
    const cfg = buildSiteConfig({});
    applySeo(document, cfg, "ru", translations.ru);
    expect(document.documentElement.lang).toBe("ru");
    expect(document.title).toBe(translations.ru.meta.title);
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(translations.ru.meta.description);
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(translations.ru.meta.ogTitle);
    applySeo(document, cfg, "en", translations.en);
    expect(document.title).toBe(translations.en.meta.title);
    expect(document.querySelectorAll("#ld-json-clinic")).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
  it("adds canonical and og:url only when a site URL is configured", () => {
    applySeo(document, buildSiteConfig({ VITE_SITE_URL: "https://zahro.uz" }), "uz", translations.uz);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://zahro.uz/");
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://zahro.uz/");
  });
});

describe("buildJsonLd", () => {
  it("omits unknown fields", () => {
    const ld = buildJsonLd(buildSiteConfig({}), "uz", translations.uz);
    expect(ld).not.toHaveProperty("telephone");
    expect(ld).not.toHaveProperty("url");
    expect(ld.openingHours).toEqual(["Mo-Sa 09:00-20:00", "Su 10:00-17:00"]);
  });
  it("includes phone and url when configured", () => {
    const ld = buildJsonLd(buildSiteConfig({ VITE_CLINIC_PHONE: "+998712001122", VITE_SITE_URL: "https://zahro.uz" }), "uz", translations.uz);
    expect(ld.telephone).toBe("+998712001122");
    expect(ld.url).toBe("https://zahro.uz");
  });
});

describe("robots / sitemap", () => {
  it("adds the Sitemap line only with a site URL", () => {
    expect(buildRobotsTxt(null)).not.toContain("Sitemap");
    expect(buildRobotsTxt("https://zahro.uz")).toContain("Sitemap: https://zahro.uz/sitemap.xml");
    expect(buildSitemapXml("https://zahro.uz")).toContain("<loc>https://zahro.uz/</loc>");
  });
});

describe("translations", () => {
  it("has no promise of a fixed response time or WhatsApp in the error copy", () => {
    for (const l of ["uz", "ru", "en"] as const) {
      const b = translations[l].booking;
      expect(JSON.stringify(b)).not.toMatch(/15/);
      expect(b.err).not.toMatch(/whatsapp/i);
      expect(b.steps).toHaveLength(3);
    }
  });
});
