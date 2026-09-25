type Entry = { expires: number; value: Promise<unknown> };

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 300;
const entries = new Map<string, Entry>();

/**
 * Short in-memory cache for public, rarely changing reads. Concurrent callers
 * share one in-flight request, and a null result (error or not found) is never
 * kept, so a failed read is retried on the next request.
 */
export function cached<T>(key: string, load: () => Promise<T | null>): Promise<T | null> {
  const now = Date.now();
  const hit = entries.get(key);
  if (hit && hit.expires > now) return hit.value as Promise<T | null>;

  if (entries.size >= MAX_ENTRIES) {
    for (const [k, v] of entries) if (v.expires <= now) entries.delete(k);
    if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value as string);
  }

  const value = load().then(
    (result) => {
      if (result === null) entries.delete(key);
      return result;
    },
    (error: unknown) => {
      entries.delete(key);
      throw error;
    },
  );
  entries.set(key, { expires: now + TTL_MS, value });
  return value;
}
