import { describe, it, expect } from "vitest";

import { assertSafeUrl, checkUrlSafety } from "@/lib/security/ssrf";

/**
 * SSRF protection: user-supplied URLs must resolve to public http(s)
 * destinations only. Loopback, private/link-local ranges, cloud metadata
 * endpoints, and non-http schemes must be rejected before any outbound fetch.
 */

const REJECTED_URLS = [
  "http://localhost",
  "http://127.0.0.1",
  "http://169.254.169.254/latest/meta-data",
  "http://10.0.0.5",
  "http://192.168.1.1",
  "http://[::1]/",
  "http://metadata.google.internal",
  "ftp://example.com",
  "file:///etc/passwd",
] as const;

const ACCEPTED_URLS = [
  "https://example.com",
  "https://www.marlowecoffee.com/products",
] as const;

describe("assertSafeUrl", () => {
  for (const url of REJECTED_URLS) {
    it(`throws for unsafe URL: ${url}`, () => {
      expect(() => assertSafeUrl(url)).toThrow();
    });
  }

  for (const url of ACCEPTED_URLS) {
    it(`accepts safe URL: ${url}`, () => {
      expect(() => assertSafeUrl(url)).not.toThrow();
      const result = assertSafeUrl(url);
      expect(result).toBeInstanceOf(URL);
      expect(result.protocol).toBe("https:");
    });
  }
});

describe("checkUrlSafety", () => {
  for (const url of REJECTED_URLS) {
    it(`reports unsafe URL as unsafe: ${url}`, () => {
      const result = checkUrlSafety(url);
      expect(result.safe).toBe(false);
      // An unsafe result must explain why and must not hand back a URL.
      expect(typeof result.reason).toBe("string");
      expect(result.reason && result.reason.length).toBeGreaterThan(0);
    });
  }

  for (const url of ACCEPTED_URLS) {
    it(`reports safe URL as safe: ${url}`, () => {
      const result = checkUrlSafety(url);
      expect(result.safe).toBe(true);
      expect(result.url).toBeInstanceOf(URL);
      expect(result.url?.protocol).toBe("https:");
    });
  }

  it("blocks every loopback and private-range host", () => {
    for (const url of REJECTED_URLS) {
      expect(checkUrlSafety(url).safe).toBe(false);
    }
  });

  it("allows ordinary public store URLs", () => {
    for (const url of ACCEPTED_URLS) {
      expect(checkUrlSafety(url).safe).toBe(true);
    }
  });
});
