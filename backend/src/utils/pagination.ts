export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const sanitizeInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

export const parsePage = (page: unknown, pageSize: unknown) => {
  const safePage = Math.max(1, sanitizeInteger(page, 1));
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, sanitizeInteger(pageSize, DEFAULT_PAGE_SIZE)));
  const skip = (safePage - 1) * safePageSize;

  return { page: safePage, pageSize: safePageSize, skip, take: safePageSize };
};
