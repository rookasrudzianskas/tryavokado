import { describe, it, expect } from "vitest";
import {
  encryptSecret,
  decryptSecret,
  encryptJson,
  decryptJson,
  maskSecret,
  safeEqual,
} from "@/lib/crypto/encryption";

describe("encryption: encryptSecret / decryptSecret", () => {
  it("round-trips a plain ASCII secret", () => {
    const plaintext = "meta-access-token-abc123";
    const ciphertext = encryptSecret(plaintext);
    expect(decryptSecret(ciphertext)).toBe(plaintext);
  });

  it("round-trips an empty string", () => {
    const ciphertext = encryptSecret("");
    expect(decryptSecret(ciphertext)).toBe("");
  });

  it("round-trips a unicode secret", () => {
    const plaintext = "café — naïve 🥑 Ωμέγα 你好 ключ";
    const ciphertext = encryptSecret(plaintext);
    expect(decryptSecret(ciphertext)).toBe(plaintext);
  });

  it("produces ciphertext that differs from plaintext", () => {
    const plaintext = "shopify-secret-value";
    const ciphertext = encryptSecret(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext.includes(plaintext)).toBe(false);
  });

  it("prefixes the payload with the v1. version tag", () => {
    const ciphertext = encryptSecret("anything");
    expect(ciphertext.startsWith("v1.")).toBe(true);
    expect(ciphertext.split(".")).toHaveLength(4);
  });

  it("produces a unique ciphertext per call (random IV)", () => {
    const plaintext = "same-input-twice";
    const a = encryptSecret(plaintext);
    const b = encryptSecret(plaintext);
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe(plaintext);
    expect(decryptSecret(b)).toBe(plaintext);
  });

  it("rejects a malformed payload", () => {
    expect(() => decryptSecret("not-a-valid-payload")).toThrow();
    expect(() => decryptSecret("v2.a.b.c")).toThrow(/Malformed/);
  });

  it("rejects a tampered ciphertext (auth tag mismatch)", () => {
    const ciphertext = encryptSecret("integrity-protected");
    const parts = ciphertext.split(".");
    // Flip the last byte group of the ciphertext segment.
    parts[2] = Buffer.from("tampered-data").toString("base64");
    expect(() => decryptSecret(parts.join("."))).toThrow();
  });
});

describe("encryption: encryptJson / decryptJson", () => {
  it("round-trips a structured object", () => {
    const value = {
      accessToken: "tok_123",
      scopes: ["read_products", "read_orders"],
      expiresAt: 1735689600,
      nested: { refresh: "rt_456", active: true },
    };
    const ciphertext = encryptJson(value);
    expect(decryptJson<typeof value>(ciphertext)).toEqual(value);
  });

  it("round-trips primitive and array values", () => {
    expect(decryptJson<number>(encryptJson(42))).toBe(42);
    expect(decryptJson<string>(encryptJson("hello"))).toBe("hello");
    expect(decryptJson<boolean>(encryptJson(false))).toBe(false);
    expect(decryptJson<null>(encryptJson(null))).toBeNull();
    expect(decryptJson<number[]>(encryptJson([1, 2, 3]))).toEqual([1, 2, 3]);
  });

  it("encryptJson output is a v1. payload that hides the values", () => {
    const ciphertext = encryptJson({ secret: "do-not-leak" });
    expect(ciphertext.startsWith("v1.")).toBe(true);
    expect(ciphertext.includes("do-not-leak")).toBe(false);
  });
});

describe("encryption: maskSecret", () => {
  it("hides all but the last 4 characters", () => {
    const masked = maskSecret("sk_live_1234567890abcd");
    expect(masked.endsWith("abcd")).toBe(true);
    expect(masked.includes("sk_live")).toBe(false);
    expect(masked).toMatch(/^•+abcd$/);
  });

  it("keeps a configurable number of visible characters", () => {
    const masked = maskSecret("abcdefghij", 2);
    expect(masked.endsWith("ij")).toBe(true);
    expect(masked.includes("abcdefgh")).toBe(false);
  });

  it("fully masks short secrets and handles empty input", () => {
    expect(maskSecret("ab")).toBe("••");
    expect(maskSecret("abcd")).toBe("••••");
    expect(maskSecret("")).toBe("");
  });
});

describe("encryption: safeEqual", () => {
  it("returns true for identical strings", () => {
    expect(safeEqual("signature-xyz", "signature-xyz")).toBe(true);
    expect(safeEqual("", "")).toBe(true);
  });

  it("returns false for differing strings", () => {
    expect(safeEqual("signature-xyz", "signature-abc")).toBe(false);
  });

  it("returns false for differing lengths without throwing", () => {
    expect(safeEqual("short", "longer-value")).toBe(false);
  });
});
