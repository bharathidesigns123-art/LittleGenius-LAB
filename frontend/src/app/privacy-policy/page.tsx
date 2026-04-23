import { StorefrontShell } from "@/components/site/storefront-shell";

export default function PrivacyPolicyPage() {
  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <h1 className="display-font text-5xl font-semibold text-[var(--color-blue)] mb-8">Privacy Policy</h1>
        
        <div className="surface-card card-shadow rounded-[2.5rem] p-8 md:p-12 space-y-8 text-[var(--color-ink-soft)] leading-relaxed">
          <p>Last updated: April 23, 2026</p>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, place an order, or submit a custom order request. This includes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Contact Information:</strong> Name, Email, WhatsApp Number, Shipping Address.</li>
              <li><strong>Custom Order Data:</strong> Photos and character descriptions you upload for 3D modeling.</li>
              <li><strong>Payment Data:</strong> Payment processing is handled by Razorpay. We do not store your credit card or UPI details on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">2. How We Use Your Data</h2>
            <p>We use your data to process orders, communicate design previews via WhatsApp, and improve our 3D printing services. Your custom photos are used <strong>only</strong> for creating your specific 3D model and are stored securely.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">3. Children&apos;s Privacy</h2>
            <p>LittleGenius LAB creates toys for children, but our services are intended for use by parents and adults. We do not knowingly collect personal information from children without parental consent. If a parent provides a child&apos;s photo for a custom figurine, that photo is treated with the highest level of privacy and security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">4. Sharing of Information</h2>
            <p>We share your shipping address with our logistics partners (e.g., Shiprocket) to deliver your order. We do not sell or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">5. Your Rights</h2>
            <p>You can request to view, update, or delete your personal data by contacting us at hello@littlegeniuslab.in.</p>
          </section>
        </div>
      </section>
    </StorefrontShell>
  );
}
