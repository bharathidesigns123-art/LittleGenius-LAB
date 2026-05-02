const GUEST_ORDER_STORAGE_KEY = "littlegenius.guest.id";

const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function isValidGuestId(value: string) {
  return uuidRegex.test(value);
}

/** Stable guest id for order persistence (localStorage). */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(GUEST_ORDER_STORAGE_KEY);
  if (existing && isValidGuestId(existing)) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(GUEST_ORDER_STORAGE_KEY, created);
  return created;
}

export function clearGuestOrderId() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(GUEST_ORDER_STORAGE_KEY);
}

export function peekGuestOrderId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const v = window.localStorage.getItem(GUEST_ORDER_STORAGE_KEY);
  return v && isValidGuestId(v) ? v : null;
}
