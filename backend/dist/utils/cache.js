"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheStats = void 0;
exports.cached = cached;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const CACHE_FILE = node_path_1.default.resolve(process.cwd(), ".cache", "cache.json");
/** How long an expired entry may still be served as a fallback */
const STALE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const store = new Map();
const inFlight = new Map();
const stats = { hits: 0, misses: 0, staleServed: 0 };
function load() {
    try {
        const raw = JSON.parse(node_fs_1.default.readFileSync(CACHE_FILE, "utf8"));
        const now = Date.now();
        for (const [key, entry] of Object.entries(raw)) {
            if (entry.expiresAt + STALE_WINDOW_MS > now)
                store.set(key, entry);
        }
    }
    catch {
        // No cache file yet, or unreadable — start empty.
    }
}
let persistTimer;
function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        node_fs_1.default.promises
            .mkdir(node_path_1.default.dirname(CACHE_FILE), { recursive: true })
            .then(() => node_fs_1.default.promises.writeFile(CACHE_FILE, JSON.stringify(Object.fromEntries(store))))
            .catch((err) => console.warn("Cache persist failed:", err.message));
    }, 1000);
    persistTimer.unref();
}
load();
/**
 * Returns the cached value for `key`, or runs `fetcher` and caches the result
 * for `ttlSeconds`. Concurrent misses share one in-flight request. If the
 * fetcher throws and an expired entry exists, the stale value is returned.
 */
async function cached(key, ttlSeconds, fetcher) {
    const entry = store.get(key);
    const now = Date.now();
    if (entry && entry.expiresAt > now) {
        stats.hits++;
        return { value: entry.value, stale: false, storedAt: entry.storedAt };
    }
    stats.misses++;
    let pending = inFlight.get(key);
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
    }
    catch (err) {
        if (entry && entry.expiresAt + STALE_WINDOW_MS > now) {
            stats.staleServed++;
            console.warn(`Serving stale cache for "${key}":`, err.message);
            return { value: entry.value, stale: true, storedAt: entry.storedAt };
        }
        throw err;
    }
}
const cacheStats = () => ({ ...stats, keys: store.size });
exports.cacheStats = cacheStats;
//# sourceMappingURL=cache.js.map