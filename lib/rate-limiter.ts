// Simple in-memory rate limiter for MVP
// NOTE: In production, use Redis or Upstash for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; retryAt?: number }> {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetAt: now + window });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, retryAt: entry.resetAt };
  }

  // Increment counter
  entry.count++;
  return { allowed: true };
}

export function formatRetryAfter(retryAt: number): string {
  const seconds = Math.ceil((retryAt - Date.now()) / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minutes`;
}

export function createRateLimitError(retryAt: number): { error: string } {
  const time = formatRetryAfter(retryAt);
  return {
    error: `You're doing that too fast. Try again in ${time}.`,
  };
}

// Rate limit configurations
export const RATE_LIMITS = {
  login: { limit: 10, window: 60 * 1000 }, // 10/min
  battleSubmit: { limit: 10, window: 60 * 1000 }, // 10/min
  postPublish: { limit: 10, window: 60 * 60 * 1000 }, // 10/hour
  vote: { limit: 60, window: 60 * 1000 }, // 60/min
  comment: { limit: 20, window: 60 * 1000 }, // 20/min
  follow: { limit: 30, window: 60 * 1000 }, // 30/min
};
