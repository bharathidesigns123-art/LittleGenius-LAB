import { resolveRuntimeApiBaseUrl } from "@/lib/api-base-url";

/** Safe for `next/image` when the API returns no image URL. */
const FALLBACK_IMAGE = "/file.svg";

export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) {
    return FALLBACK_IMAGE;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = resolveRuntimeApiBaseUrl();
  if (!base) {
    return FALLBACK_IMAGE;
  }

  return `${base}${url}`;
}
