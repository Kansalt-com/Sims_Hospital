type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const isFresh = (entry: CacheEntry<unknown> | undefined, now: number) =>
  Boolean(entry && entry.expiresAt > now);

export const getCache = <T>(key: string) => {
  const existing = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (!isFresh(existing, now)) {
    if (existing) {
      store.delete(key);
    }
    return undefined;
  }

  return existing?.value;
};

export const setCache = <T>(key: string, value: T, ttlMs: number) => {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
};

export const getOrSetCache = async <T>(key: string, ttlMs: number, factory: () => Promise<T>) => {
  const cached = getCache<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const next = factory()
    .then((value) => setCache(key, value, ttlMs))
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, next);
  return next;
};

export const clearCache = (prefix?: string) => {
  if (!prefix) {
    store.clear();
    inflight.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }

  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) {
      inflight.delete(key);
    }
  }
};
