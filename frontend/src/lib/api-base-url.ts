const PLACEHOLDER_PATTERNS = [/^YOUR_/i, /YOUR_/i, /^\[REDACTED\]$/i];

function normalizeApiBaseUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function resolveApiBaseUrl(): string | null {
  return (
    normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    normalizeApiBaseUrl(process.env.API_BASE_URL) ??
    null
  );
}

export function resolveRuntimeApiBaseUrl(): string | null {
  return resolveApiBaseUrl() ?? (process.env.NODE_ENV !== "production" ? "http://localhost:5252" : null);
}
