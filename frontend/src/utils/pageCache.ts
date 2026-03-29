type CacheEnvelope<T> = {
  data: T;
  expiresAt: number;
};

const readEnvelope = <T,>(key: string): CacheEnvelope<T> | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const readCachedPageData = <T,>(key: string) => readEnvelope<T>(key)?.data ?? null;

export const writeCachedPageData = <T,>(key: string, data: T, ttlMs = 60_000) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CacheEnvelope<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
  };

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures so the page continues working normally.
  }
};
