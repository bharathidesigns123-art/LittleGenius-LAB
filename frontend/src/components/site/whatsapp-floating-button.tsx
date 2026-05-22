import { MessageCircle } from "lucide-react";
import { defaultWhatsAppUrl } from "@/lib/commerce-content";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={defaultWhatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[9.2rem] right-3 z-50 inline-flex h-13 w-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_20px_42px_rgba(18,52,88,0.24)] transition hover:-translate-y-0.5 md:bottom-6 md:right-6 md:h-auto md:w-auto md:gap-2 md:px-5 md:py-3"
      aria-label="Chat with LittleGenius LAB on WhatsApp"
    >
      <MessageCircle size={21} aria-hidden="true" />
      <span className="hidden text-sm font-bold md:inline">WhatsApp help</span>
    </a>
  );
}
