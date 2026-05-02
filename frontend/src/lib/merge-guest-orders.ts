import { browserApi } from "@/lib/browser-api";
import { clearGuestOrderId, peekGuestOrderId } from "@/lib/guest-order-storage";

/** Attach guest checkout history to the authenticated account; idempotent on the server. */
export async function mergeGuestOrdersAfterAuth(token: string): Promise<void> {
  const guestId = peekGuestOrderId();
  if (!guestId) {
    return;
  }

  try {
    await browserApi.mergeGuestOrders(token, guestId);
    clearGuestOrderId();
  } catch {
    // Keep guestId so a retry can happen (e.g. offline).
  }
}
