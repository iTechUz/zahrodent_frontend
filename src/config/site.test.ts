import { describe, expect, it } from "vitest";
import {
  DEFAULT_COORDS,
  DEFAULT_TELEGRAM_CHANNEL_URL,
  DEV_API_URL,
  PLACEHOLDER_PHONE,
  buildSiteConfig,
  parsePhone,
  resolveAddress,
} from "./site";

describe("parsePhone", () => {
  it("formats valid numbers", () => {
    expect(parsePhone("+998 71 200 11 22")).toEqual({ e164: "+998712001122", display: "+998 71 200 11 22" });
    expect(parsePhone("712001122")?.e164).toBe("+998712001122");
  });
  it("rejects the known placeholder, empty and malformed values", () => {
    expect(parsePhone(PLACEHOLDER_PHONE)).toBeNull();
    expect(parsePhone("+998 90 123 45 67")).toBeNull();
    expect(parsePhone("")).toBeNull();
    expect(parsePhone(undefined)).toBeNull();
    expect(parsePhone("12345")).toBeNull();
  });
});

describe("buildSiteConfig", () => {
  it("hides everything unconfigured and keeps safe fallbacks", () => {
    const c = buildSiteConfig({});
    expect(c.phone).toBeNull();
    expect(c.instagramUrl).toBeNull();
    expect(c.youtubeUrl).toBeNull();
    expect(c.facebookUrl).toBeNull();
    expect(c.whatsappUrl).toBeNull();
    expect(c.siteUrl).toBeNull();
    expect(c.telegramBotUrl).toBeNull(); // no fallback to the channel
    expect(c.telegramChannelUrl).toBe(DEFAULT_TELEGRAM_CHANNEL_URL);
    expect(c.coords).toEqual(DEFAULT_COORDS);
    expect(c.apiUrl).toBe("");
  });
  it("uses the dev API fallback only in dev", () => {
    expect(buildSiteConfig({ DEV: "1" }).apiUrl).toBe(DEV_API_URL);
    expect(buildSiteConfig({ DEV: "1", VITE_API_URL: "https://api.x.uz/" }).apiUrl).toBe("https://api.x.uz");
  });
  it("reads configured values and rejects invalid ones", () => {
    const c = buildSiteConfig({
      VITE_CLINIC_PHONE: "+998712001122",
      VITE_TELEGRAM_BOT_USERNAME: "@zahro_bot",
      VITE_INSTAGRAM_URL: "https://instagram.com/zahro",
      VITE_YOUTUBE_URL: "javascript:alert(1)",
      VITE_FACEBOOK_URL: "#",
      VITE_CLINIC_LAT: "41.3",
      VITE_CLINIC_LNG: "999",
      VITE_SITE_URL: "https://zahro.uz/",
    });
    expect(c.phone?.e164).toBe("+998712001122");
    expect(c.telegramBotUrl).toBe("https://t.me/zahro_bot?start=lead");
    expect(c.instagramUrl).toBe("https://instagram.com/zahro");
    expect(c.youtubeUrl).toBeNull();
    expect(c.facebookUrl).toBeNull();
    expect(c.coords).toEqual({ lat: 41.3, lng: DEFAULT_COORDS.lng });
    expect(c.siteUrl).toBe("https://zahro.uz");
  });
  it("rejects an invalid bot username", () => {
    expect(buildSiteConfig({ VITE_TELEGRAM_BOT_USERNAME: "a b" }).telegramBotUrl).toBeNull();
  });
  it("resolves the address per language with fallback", () => {
    const c = buildSiteConfig({ VITE_CLINIC_ADDRESS_RU: "ул. Тест 1" });
    expect(resolveAddress(c, "ru", "fb")).toBe("ул. Тест 1");
    expect(resolveAddress(c, "uz", "fb")).toBe("fb");
  });
});
