const utcOffsetPattern = /(Z|[+-]\d{2}:?\d{2})$/i;

export function parseUtcDate(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const normalized = utcOffsetPattern.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatUtcDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-IN",
) {
  const date = parseUtcDate(value);
  return date ? date.toLocaleDateString(locale, options) : "";
}

export function formatUtcDateTime(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-IN",
) {
  const date = parseUtcDate(value);
  return date ? date.toLocaleString(locale, options) : "";
}
