type AttemptRecord = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, AttemptRecord>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60_000;

const getClientIp = (value: string | string[] | undefined) => {
  if (!value) {
    return "unknown";
  }

  const raw = Array.isArray(value) ? value[0] : value;
  return raw.split(",")[0]?.trim() || "unknown";
};

const buildKey = (ip: string, username: string) => `${ip}:${username.toLowerCase()}`;

const cleanupExpired = (now: number) => {
  for (const [key, record] of attempts) {
    if (record.blockedUntil && record.blockedUntil > now) {
      continue;
    }

    if (now - record.firstAttemptAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
};

export const assertLoginAttemptAllowed = (ipHeader: string | string[] | undefined, username: string) => {
  const now = Date.now();
  cleanupExpired(now);
  const key = buildKey(getClientIp(ipHeader), username);
  const record = attempts.get(key);

  if (record?.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false as const, retryAfterSeconds };
  }

  return { allowed: true as const, key };
};

export const recordLoginFailure = (key: string) => {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || now - current.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  const count = current.count + 1;
  attempts.set(key, {
    count,
    firstAttemptAt: current.firstAttemptAt,
    blockedUntil: count >= MAX_ATTEMPTS ? now + BLOCK_MS : undefined,
  });
};

export const clearLoginFailures = (key: string) => {
  attempts.delete(key);
};
