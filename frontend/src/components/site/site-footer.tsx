import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-blue)] text-white">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="display-font text-2xl font-semibold">LittleGenius LAB</p>
          <p className="mt-3 text-sm leading-7 text-white/80">
            3D printed toys and custom figurines crafted in Tamil Nadu for playful homes across India.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">Shop</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/85">
            <Link href="/shop/animals">Animals</Link>
            <Link href="/shop/robots">Robots</Link>
            <Link href="/shop/chibi">Chibi</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">Support</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/85">
            <Link href="/custom-order">Custom Orders</Link>
            <Link href="/track-order">Track Order</Link>
            <Link href="/account">Account</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">Connect</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/85">
            <a href="https://wa.me/919876543210">WhatsApp</a>
            <a href="mailto:hello@littlegeniuslab.in">hello@littlegeniuslab.in</a>
            <span>India-wide shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
