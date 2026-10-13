import { describe, expect, it } from "vitest";
import { cleanName, formatPhone, isValidDate, isValidName, isValidPhone, toE164 } from "./leadForm";

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
