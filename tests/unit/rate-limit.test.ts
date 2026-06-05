import { describe, it, expect, beforeEach } from "vitest";

import { rateLimit, resetRateLimits } from "@/lib/security/rate-limit";

/**
 * In-memory rate limiter: the first `limit` calls for a key succeed, the next
 * call is rejected with success:false and remaining 0, and distinct keys are
 * tracked independently. State is reset before each test for isolation.
 */

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows the first N calls under the limit", () => {
    const limit = 5;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i++) {
      const result = rateLimit("user:1", { limit, windowMs });
      expect(result.success).toBe(true);
      // After i+1 hits, there should be limit-(i+1) remaining.
      expect(result.remaining).toBe(limit - (i + 1));
    }
  });

  it("rejects the (limit + 1)-th call with success:false and remaining 0", () => {
    const limit = 3;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i++) {
      expect(rateLimit("user:2", { limit, windowMs }).success).toBe(true);
    }

    const overLimit = rateLimit("user:2", { limit, windowMs });
    expect(overLimit.success).toBe(false);
    expect(overLimit.remaining).toBe(0);
  });

  it("keeps rejecting once the limit is exhausted within the window", () => {
    const limit = 2;
    const windowMs = 60_000;

    rateLimit("user:3", { limit, windowMs });
    rateLimit("user:3", { limit, windowMs });

    const first = rateLimit("user:3", { limit, windowMs });
    const second = rateLimit("user:3", { limit, windowMs });

    expect(first.success).toBe(false);
    expect(first.remaining).toBe(0);
    expect(second.success).toBe(false);
    expect(second.remaining).toBe(0);
  });

  it("tracks different keys independently", () => {
    const limit = 2;
    const windowMs = 60_000;

    // Exhaust key A entirely.
    expect(rateLimit("ip:a", { limit, windowMs }).success).toBe(true);
    expect(rateLimit("ip:a", { limit, windowMs }).success).toBe(true);
    expect(rateLimit("ip:a", { limit, windowMs }).success).toBe(false);

    // Key B must be unaffected and start from a clean allowance.
    const b1 = rateLimit("ip:b", { limit, windowMs });
    expect(b1.success).toBe(true);
    expect(b1.remaining).toBe(limit - 1);
    expect(rateLimit("ip:b", { limit, windowMs }).success).toBe(true);
    expect(rateLimit("ip:b", { limit, windowMs }).success).toBe(false);
  });

  it("exposes a future resetAt timestamp while limiting", () => {
    const limit = 1;
    const windowMs = 60_000;
    const before = Date.now();

    rateLimit("user:reset", { limit, windowMs });
    const blocked = rateLimit("user:reset", { limit, windowMs });

    expect(blocked.success).toBe(false);
    expect(blocked.resetAt).toBeGreaterThanOrEqual(before);
  });

  it("starts fresh after resetRateLimits()", () => {
    const limit = 1;
    const windowMs = 60_000;

    expect(rateLimit("user:fresh", { limit, windowMs }).success).toBe(true);
    expect(rateLimit("user:fresh", { limit, windowMs }).success).toBe(false);

    resetRateLimits();

    // A cleared store should permit the key again.
    expect(rateLimit("user:fresh", { limit, windowMs }).success).toBe(true);
  });
});
