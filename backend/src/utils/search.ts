const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ");

export const normalizeSearchTerm = (value: unknown, maxLength = 80) => {
  if (typeof value !== "string") {
    return "";
  }

  return normalizeWhitespace(value).slice(0, maxLength);
};

export const normalizeDigits = (value: string) => value.replace(/\D/g, "");

export const buildTextSearchVariants = (rawQuery: string) => {
  const query = normalizeSearchTerm(rawQuery);
  const digits = normalizeDigits(query);

  return {
    query,
    digits,
    hasDigits: digits.length >= 3,
    hasText: query.length >= 2,
  };
};
