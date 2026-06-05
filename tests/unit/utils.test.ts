import { describe, it, expect } from "vitest";
import {
  slugify,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatCompact,
  initialsFromName,
  truncate,
  clamp,
  nonEmpty,
} from "@/lib/utils";

describe("utils: slugify", () => {
  it("slugifies a brand name with punctuation and casing", () => {
    expect(slugify("Marlowe Coffee Co.")).toBe("marlowe-coffee-co");
  });

  it("strips punctuation and lowercases", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("Ünïcödé & symbols #1")).toBe("unicode-symbols-1");
  });

  it("collapses whitespace, underscores, and dashes into single hyphens", () => {
    expect(slugify("a   b___c--d")).toBe("a-b-c-d");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Spaced Out--  ")).toBe("spaced-out");
  });

  it("preserves existing numbers", () => {
    expect(slugify("Campaign 2025 v2")).toBe("campaign-2025-v2");
  });
});

describe("utils: formatCurrency", () => {
  it("formats a whole value in euros by default with no decimals", () => {
    const result = formatCurrency(49);
    expect(result).toContain("€49");
    expect(result).not.toContain(".00");
  });

  it("includes cents for fractional values", () => {
    expect(formatCurrency(49.5)).toContain("€49.50");
  });

  it("honours other supported currencies", () => {
    expect(formatCurrency(10, "EUR")).toContain("€10");
    expect(formatCurrency(10, "GBP")).toContain("£10");
  });

  it("falls back gracefully for an unknown currency code", () => {
    const result = formatCurrency(12.3, "ZZZ");
    expect(result).toContain("ZZZ");
    expect(result).toContain("12.30");
  });
});

describe("utils: formatPercent", () => {
  it("renders a ratio as a one-decimal percentage", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
  });

  it("respects a custom fraction-digit count", () => {
    expect(formatPercent(0.1234, 2)).toBe("12.34%");
    expect(formatPercent(0.5, 0)).toBe("50%");
  });
});

describe("utils: formatNumber / formatCompact", () => {
  it("formats numbers with grouping by default", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("compacts large numbers", () => {
    expect(formatCompact(1200)).toBe("1.2K");
    expect(formatCompact(3_400_000)).toBe("3.4M");
  });
});

describe("utils: initialsFromName", () => {
  it("returns the first letters of the first two words, uppercased", () => {
    expect(initialsFromName("Rokas Demo")).toBe("RD");
  });

  it("uppercases a single-word name to a single initial", () => {
    expect(initialsFromName("avokado")).toBe("A");
  });

  it("uses only the first two words for longer names", () => {
    expect(initialsFromName("Mary Jane Watson")).toBe("MJ");
  });

  it("returns a placeholder for empty or nullish input", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName(undefined)).toBe("?");
    expect(initialsFromName(null)).toBe("?");
  });
});

describe("utils: truncate", () => {
  it("leaves short strings unchanged", () => {
    expect(truncate("short text", 120)).toBe("short text");
  });

  it("returns the input unchanged when exactly at the limit", () => {
    const text = "exactly-ten";
    expect(truncate(text, text.length)).toBe(text);
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    const result = truncate("abcdefghij", 5);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result).toBe("abcd…");
  });
});

describe("utils: clamp & nonEmpty", () => {
  it("clamps a value into the inclusive range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("returns the fallback only for null or undefined", () => {
    expect(nonEmpty("value", "fallback")).toBe("value");
    expect(nonEmpty(0, 99)).toBe(0);
    expect(nonEmpty(null, "fallback")).toBe("fallback");
    expect(nonEmpty(undefined, "fallback")).toBe("fallback");
  });
});
