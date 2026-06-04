type RateLimitOptions = {
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  limited: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

const buckets = new Map<string, RateLimitEntry>()

const cleanupExpiredBuckets = (now: number) => {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

// Netlify Functions keep memory only while an instance is warm. This is a
// useful starter guard for accidental/spammy bursts, not a global abuse system.
export const checkRateLimit = (
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult => {
  const now = Date.now()
  const safeLimit = Math.max(1, limit)
  const safeWindowMs = Math.max(1000, windowMs)

  cleanupExpiredBuckets(now)

  const current = buckets.get(key)
  const entry =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + safeWindowMs
        }

  entry.count += 1
  buckets.set(key, entry)

  const remaining = Math.max(0, safeLimit - entry.count)
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))

  return {
    limited: entry.count > safeLimit,
    limit: safeLimit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds
  }
}
