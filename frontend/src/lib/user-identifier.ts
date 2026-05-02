import type { AuthUser } from "@/lib/types";
import { getOrCreateGuestId } from "@/lib/guest-order-storage";

export type CurrentUserIdentifier =
  | { mode: "user"; userId: number }
  | { mode: "guest"; guestId: string };

/**
 * Use for checkout and order APIs: authenticated users get userId from JWT on the server;
 * guests must send guestId with each request.
 */
export function getCurrentUserIdentifier(user: AuthUser | null | undefined): CurrentUserIdentifier {
  if (user?.id != null) {
    return { mode: "user", userId: user.id };
  }
  return { mode: "guest", guestId: getOrCreateGuestId() };
}
