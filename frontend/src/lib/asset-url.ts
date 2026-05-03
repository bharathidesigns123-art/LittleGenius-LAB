function resolvePublicApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    "";
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return process.env.NODE_ENV !== "production" ? "http://localhost:5252" : "";
}

const AZURE_SAS_TOKEN = "sp=r&st=2026-05-02T08:03:14Z&se=2027-05-02T16:18:14Z&spr=https&sv=2025-11-05&sr=c&sig=fPP2PyVN7IMeTRhkVrBV8F6rG1n%2FCCzCnVHB7S5Q0pI%3D";

/** Safe for `next/image` when the API returns no image URL. */
const FALLBACK_IMAGE = "/file.svg";

export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) {
    return FALLBACK_IMAGE;
  }

  // If it's already an absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // If it's an Azure Blob Storage URL, we want to ensure it uses the latest SAS token
    if (url.includes("blob.core.windows.net")) {
      // Strip any existing query string (expired SAS tokens)
      const cleanUrl = url.split("?")[0];
      // Append the new valid SAS token
      return `${cleanUrl}?${AZURE_SAS_TOKEN}`;
    }
    return url;
  }

  const base = resolvePublicApiBaseUrl();
  if (!base) {
    return FALLBACK_IMAGE;
  }

  return `${base}${url}`;
}
