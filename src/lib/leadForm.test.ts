import { describe, expect, it } from "vitest";
import { cleanName, formatLocalPhone, formatPhone, isValidDate, isValidName, isValidPhone, toE164 } from "./leadForm";

describe("leadForm", () => {
  it("formats the phone while typing", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("9")).toBe("+998 9");
    expect(formatPhone("90123")).toBe("+998 90 123");
    expect(formatPhone("901234567")).toBe("+998 90 123 45 67");
    expect(formatPhone("90123456789999")).toBe("+998 90 123 45 67");
  });
  it("handles pasted full numbers and letters", () => {
    expect(formatPhone("+998901234567")).toBe("+998 90 123 45 67");
    expect(formatPhone("998 90 123-45-67")).toBe("+998 90 123 45 67");
    expect(formatPhone("abc")).toBe("");
    expect(toE164("+998 90 123 45 67")).toBe("+998901234567");
  });
  it("formats only the local part for the fixed +998 prefix field", () => {
    expect(formatLocalPhone("")).toBe("");
    expect(formatLocalPhone("9012")).toBe("90 12");
    expect(formatLocalPhone("90 123 45 67")).toBe("90 123 45 67");
    expect(formatLocalPhone("+998 90 123 45 67")).toBe("90 123 45 67");
    expect(formatLocalPhone("998901234567")).toBe("90 123 45 67");
  });
  it("keeps local numbers that start with 998 (operator code 99)", () => {
    expect(formatLocalPhone("998123456")).toBe("99 812 34 56");
    expect(toE164("99 812 34 56")).toBe("+998998123456");
    expect(isValidPhone("99 812 34 56")).toBe(true);
  });
  it("validates the phone", () => {
    expect(isValidPhone("+998 90 123 45 6")).toBe(false);
    expect(isValidPhone("+998 90 123 45 67")).toBe(true);
  });
  it("validates names", () => {
    expect(isValidName("A")).toBe(false);
    expect(isValidName("Ali Valiyev")).toBe(true);
    expect(isValidName("Oʻtkir Sa’dullayev")).toBe(true);
    expect(isValidName("Али Валиев")).toBe(true);
    expect(isValidName("12345")).toBe(false);
    expect(isValidName("<script>")).toBe(false);
    expect(cleanName("Ali123  <b>V")).toBe("Ali bV");
  });
  it("validates the date against the Tashkent day", () => {
    const now = new Date("2026-10-13T20:00:00Z"); // already 14 Oct in Tashkent
    expect(isValidDate("2026-10-13", now)).toBe(false);
    expect(isValidDate("2026-10-14", now)).toBe(true);
    expect(isValidDate("2027-10-14", now)).toBe(true);
    expect(isValidDate("2027-10-15", now)).toBe(false);
    expect(isValidDate("", now)).toBe(false);
  });
});

describe("spam defence helpers", () => {
  it("isTooFast flags submissions under 2s after mount", async () => {
    const { isTooFast, MIN_SUBMIT_MS } = await import("./leadForm");
    expect(isTooFast(1000, 1500)).toBe(true);
    expect(isTooFast(1000, 1000 + MIN_SUBMIT_MS - 1)).toBe(true);
    expect(isTooFast(1000, 1000 + MIN_SUBMIT_MS)).toBe(false);
  });
  it("buildLeadPayload sends E.164 phone, trimmed name and the honeypot (no extra fields)", async () => {
    const { buildLeadPayload } = await import("./leadForm");
    expect(buildLeadPayload({ name: " Ali ", phone: "90 123 45 67", website: "" })).toEqual({
      name: "Ali",
      phone: "+998901234567",
      website: "",
    });
  });
});

describe("classifyLeadError", () => {
  it("maps statuses to error kinds", async () => {
    const { classifyLeadError } = await import("./leadForm");
    expect(classifyLeadError(429)).toBe("rateLimit");
    expect(classifyLeadError(400)).toBe("validation");
    expect(classifyLeadError(undefined)).toBe("offline");
    expect(classifyLeadError(500)).toBe("generic");
    expect(classifyLeadError(403)).toBe("generic");
  });
});
