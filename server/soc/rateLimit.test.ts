import { describe, expect, it } from "vitest";
import { createSlidingWindowRateLimiter } from "./rateLimit";

describe("sliding-window rate limiter", () => {
  it("allows requests up to the policy limit and then returns an accurate retry delay", () => {
    let currentTime = 1_000;
    const limiter = createSlidingWindowRateLimiter(() => currentTime);
    const policy = { maxRequests: 2, windowMs: 60_000 };

    expect(limiter.consume("analyst:7", policy)).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    currentTime += 1_000;
    expect(limiter.consume("analyst:7", policy)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    currentTime += 1_000;
    expect(limiter.consume("analyst:7", policy)).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterMs: 58_000,
    });
  });

  it("keeps callers isolated and expires requests outside the configured window", () => {
    let currentTime = 10_000;
    const limiter = createSlidingWindowRateLimiter(() => currentTime);
    const policy = { maxRequests: 1, windowMs: 1_000 };

    expect(limiter.consume("analyst:1", policy).allowed).toBe(true);
    expect(limiter.consume("analyst:2", policy).allowed).toBe(true);
    expect(limiter.consume("analyst:1", policy).allowed).toBe(false);
    currentTime += 1_001;
    expect(limiter.consume("analyst:1", policy).allowed).toBe(true);
  });
});
