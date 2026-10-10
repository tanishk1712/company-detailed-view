import fs from "node:fs";
import path from "node:path";

/**
 * Small TTL cache with two extras that matter for a quota-limited provider:
 *  - entries are persisted to disk, so restarts don't re-spend API quota
 *  - expired entries are kept for a while and served if the provider fails
 *    ("stale-if-error"), so the page still renders when the quota runs out
 */

interface Entry {
  value: unknown;
  expiresAt: number;
  storedAt: number;
}

const CACHE_FILE = path.resolve(process.cwd(), ".cache", "cache.json");
/** How long an expired entry may still be served as a fallback */
const STALE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const store = new Map<string, Entry>();
const inFlight = new Map<string, Promise<unknown>>();
const stats = { hits: 0, misses: 0, staleServed: 0 };

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as Record<string, Entry>;
    const now = Date.now();
    for (const [key, entry] of Object.entries(raw)) {
      if (entry.expiresAt + STALE_WINDOW_MS > now) store.set(key, entry);
    }
  } catch {
    // No cache file yet, or unreadable — start empty.
  }
}

let persistTimer: NodeJS.Timeout | undefined;
function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    fs.promises
      .mkdir(path.dirname(CACHE_FILE), { recursive: true })
      .then(() => fs.promises.writeFile(CACHE_FILE, JSON.stringify(Object.fromEntries(store))))
      .catch((err) => console.warn("Cache persist failed:", err.message));
  }, 1000);
  persistTimer.unref();
}

load();

export interface CachedResult<T> {
  value: T;
  stale: boolean;
  storedAt: number;
}

/**
 * Returns the cached value for `key`, or runs `fetcher` and caches the result
 * for `ttlSeconds`. Concurrent misses share one in-flight request. If the
 * fetcher throws and an expired entry exists, the stale value is returned.
 */
export async function cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<CachedResult<T>> {
  const entry = store.get(key);
  const now = Date.now();

  if (entry && entry.expiresAt > now) {
    stats.hits++;
    return { value: entry.value as T, stale: false, storedAt: entry.storedAt };
  }

  stats.misses++;
  let pending = inFlight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = fetcher().finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }

  try {
    const value = await pending;
    const storedAt = Date.now();
    store.set(key, { value, storedAt, expiresAt: storedAt + ttlSeconds * 1000 });
    schedulePersist();
    return { value, stale: false, storedAt };
  } catch (err) {
    if (entry && entry.expiresAt + STALE_WINDOW_MS > now) {
      stats.staleServed++;
      console.warn(`Serving stale cache for "${key}":`, (err as Error).message);
      return { value: entry.value as T, stale: true, storedAt: entry.storedAt };
    }
    throw err;
  }
}

export const cacheStats = () => ({ ...stats, keys: store.size });
