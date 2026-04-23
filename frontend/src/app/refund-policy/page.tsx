import { StorefrontShell } from "@/components/site/storefront-shell";

export default function RefundPolicyPage() {
  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <h1 className="display-font text-5xl font-semibold text-[var(--color-blue)] mb-8">Refund & Cancellation</h1>
        
        <div className="surface-card card-shadow rounded-[2.5rem] p-8 md:p-12 space-y-8 text-[var(--color-ink-soft)] leading-relaxed">
          <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h2 className="text-xl font-bold text-[var(--color-orange)] mb-2">Special Note for Custom Orders</h2>
            <p className="text-sm">Because custom figurines are designed and printed specifically from your photos, <strong>they cannot be cancelled or refunded once the 3D printing process has begun.</strong> We offer 2 free design revisions at the modeling stage to ensure you love the look before we hit &quot;Print&quot;.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Cancellations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Ready-made Toys:</strong> You can cancel your order within 12 hours of placing it, as long as it hasn&apos;t been dispatched.</li>
              <li><strong>Custom Orders:</strong> You can cancel and receive a full refund <strong>only before</strong> our designers start the 3D modeling process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Returns & Replacements</h2>
            <p className="mb-4">We take great care in packaging our toys, but if your item arrives damaged or defective, we will fix it!</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Please record an <strong>unboxing video</strong> as proof of damage.</li>
              <li>Notify us via WhatsApp or Email within <strong>48 hours</strong> of delivery.</li>
              <li>If the damage is verified, we will send a free replacement of the same product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Refunds</h2>
            <p>If a refund is approved (due to cancellation or non-serviceability), it will be processed to your original payment method within 5-7 business days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Questions?</h2>
            <p>If you have any doubts about your order, please chat with us on WhatsApp before purchasing. We are happy to help!</p>
          </section>
        </div>
      </section>
    </StorefrontShell>
  );
}
