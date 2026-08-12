export type RateLimitPolicy = {
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  timestamps: number[];
};

/**
 * Small process-local limiter for protected lab actions. It intentionally keeps
 * no request bodies or user data beyond a caller-provided opaque key.
 *
 * For horizontally scaled production deployments, replace this adapter with a
 * shared store (for example Redis) while retaining the same policy boundary.
 */
export function createSlidingWindowRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, Bucket>();

  function consume(key: string, policy: RateLimitPolicy) {
    const currentTime = now();
    const threshold = currentTime - policy.windowMs;
    const bucket = buckets.get(key) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      timestamp => timestamp > threshold
    );

    if (bucket.timestamps.length >= policy.maxRequests) {
      const retryAfterMs = Math.max(
        0,
        bucket.timestamps[0]! + policy.windowMs - currentTime
      );
      buckets.set(key, bucket);
      return { allowed: false as const, retryAfterMs, remaining: 0 };
    }

    bucket.timestamps.push(currentTime);
    buckets.set(key, bucket);
    return {
      allowed: true as const,
      retryAfterMs: 0,
      remaining: policy.maxRequests - bucket.timestamps.length,
    };
  }

  function reset(key?: string) {
    if (key) buckets.delete(key);
    else buckets.clear();
  }

  return { consume, reset };
}
