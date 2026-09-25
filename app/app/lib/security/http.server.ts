type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/**
 * Fixed-window in-memory rate limiter. Per-process, which is fine for a
 * single-container deploy; swap the Map for Redis if this ever scales out.
 * Returns true when the request is allowed.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, v] of buckets) {
        if (now >= v.resetAt) buckets.delete(k);
      }
      // Still saturated: fail closed rather than let the map grow unbounded.
      if (buckets.size >= MAX_BUCKETS) return false;
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
}

/**
 * The app only listens on loopback behind nginx, so X-Real-IP (set by nginx)
 * is trusted first. Otherwise the rightmost X-Forwarded-For entry is the one
 * nginx appended; anything left of it came from the client and can be forged.
 */
export function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").pop()?.trim();
  return last ? last.slice(0, 64) : "unknown";
}

/** Returns a 429 response once a client passes `max` requests per minute on `bucket`. */
export function tooManyRequests(request: Request, bucket: string, max: number): Response | null {
  if (rateLimit(`${bucket}:${clientIp(request)}`, max, 60 * 1000)) return null;
  return new Response("Too many requests", {
    status: 429,
    headers: { "Retry-After": "60", "Content-Type": "text/plain" },
  });
}

/** True when Origin (or, failing that, Referer) matches the request host. */
export function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("Host") ?? new URL(request.url).host;
  const matchesHost = (value: string) => {
    try {
      return new URL(value).host === host;
    } catch {
      return false;
    }
  };
  const origin = request.headers.get("Origin");
  if (origin) return matchesHost(origin);
  const referer = request.headers.get("Referer");
  if (referer) return matchesHost(referer);
  return false;
}

const MAX_OFFSET = 10_000;

/** Clamps ?limit / ?offset to sane bounds for the paginated data routes. */
export function pageParams(
  url: URL,
  defaultLimit: number,
  maxLimit = 50,
): { limit: number; offset: number } {
  const rawLimit = Number(url.searchParams.get("limit"));
  const rawOffset = Number(url.searchParams.get("offset"));
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(Math.floor(rawLimit), maxLimit)
      : defaultLimit;
  const offset =
    Number.isFinite(rawOffset) && rawOffset >= 0
      ? Math.min(Math.floor(rawOffset), MAX_OFFSET)
      : 0;
  return { limit, offset };
}

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const MAX_PAGE = 500;

/** Trims, strips control characters, and caps free text from the URL. */
export function cleanText(value: string | null | undefined, maxLength: number): string {
  return (value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, maxLength);
}

/** Parses a 1 based ?page, falling back to 1 for anything invalid. */
export function pageNumber(url: URL): number {
  const raw = Number(url.searchParams.get("page"));
  return Number.isInteger(raw) && raw >= 1 ? Math.min(raw, MAX_PAGE) : 1;
}
