/**
 * A minimal in-memory sliding-window rate limiter.
 *
 * This is suitable for local development and single-instance usage only: the
 * counters live in this module's memory, so they are NOT shared across
 * processes, server instances, or serverless invocations, and they reset on
 * restart. In production, back this with a shared store such as Redis or
 * Upstash (e.g. @upstash/ratelimit) so limits hold across the whole fleet.
 */

export interface RateLimitResult {
  /** Whether this request is within the limit. */
  success: boolean;
  /** Requests still allowed in the current window (never negative). */
  remaining: number;
  /** Epoch millisecond timestamp at which the current window expires. */
  resetAt: number;
}

interface WindowState {
  /** Timestamps (epoch ms) of hits within the current window. */
  hits: number[];
  /** Epoch ms when the oldest tracked hit expires; used for pruning. */
  expiresAt: number;
}

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60_000;

const buckets = new Map<string, WindowState>();

/**
 * Remove buckets whose entire window has elapsed. Called opportunistically on
 * each request so the map cannot grow without bound from one-off keys.
 */
function pruneExpired(now: number): void {
  for (const [key, state] of buckets) {
    if (state.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Record a hit for `key` and report whether it is within the limit.
 *
 * Uses a true sliding window: only hits newer than `windowMs` count toward the
 * limit, so there is no burst at fixed window boundaries.
 *
 * @param key  Stable identifier to rate-limit on (e.g. `ip:1.2.3.4`, `user:42`).
 * @param opts `limit` (default 60) and `windowMs` (default 60000).
 */
export function rateLimit(
  key: string,
  opts: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const limit = opts.limit ?? DEFAULT_LIMIT;
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();
  const windowStart = now - windowMs;

  pruneExpired(now);

  const existing = buckets.get(key);
  // Drop hits that have aged out of the sliding window.
  const hits = (existing?.hits ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (hits.length >= limit) {
    // Over the limit: do not record this hit. The window resets once the
    // oldest tracked hit ages out.
    const oldest = hits[0] ?? now;
    const resetAt = oldest + windowMs;
    buckets.set(key, { hits, expiresAt: resetAt });
    return { success: false, remaining: 0, resetAt };
  }

  hits.push(now);
  const resetAt = hits[0] + windowMs;
  buckets.set(key, { hits, expiresAt: resetAt });

  return {
    success: true,
    remaining: Math.max(0, limit - hits.length),
    resetAt,
  };
}

/**
 * Clear all rate-limit state. Intended for tests that need a clean slate
 * between cases.
 */
export function resetRateLimits(): void {
  buckets.clear();
}
