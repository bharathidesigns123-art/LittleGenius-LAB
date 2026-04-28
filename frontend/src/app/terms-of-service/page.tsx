import { StorefrontShell } from "@/components/site/storefront-shell";

export default function TermsOfServicePage() {
  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <h1 className="display-font text-5xl font-semibold text-[var(--color-blue)] mb-8">Terms of Service</h1>
        
        <div className="surface-card card-shadow rounded-[2.5rem] p-8 md:p-12 space-y-8 text-[var(--color-ink-soft)] leading-relaxed">
          <p>By using the LittleGenius LAB website, you agree to the following terms and conditions.</p>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">1. Use of Service</h2>
            <p>LittleGenius LAB provides 3D printed products and custom design services. All designs, photos, and content on this website are the property of LittleGenius LAB unless otherwise stated.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">2. Product Accuracy</h2>
            <p>We strive to display our 3D printed toys as accurately as possible. However, due to the nature of 3D printing and screen variations, slight differences in color, texture, and finish may occur.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">3. Custom Orders</h2>
            <p>For custom orders, you warrant that you have the right to provide the photos uploaded to our system. LittleGenius LAB reserves the right to refuse orders that contain offensive or inappropriate content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">4. Payments</h2>
            <p>All prices are in Indian Rupees (INR). Payments must be made in full (or as a confirmed advance for custom orders) before production begins. We use Razorpay for secure payments.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">5. Limitation of Liability</h2>
            <p>LittleGenius LAB is not liable for any indirect or incidental damages resulting from the use of our products. Our toys are made of child-safe PLA, but parental supervision is always recommended during play.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">6. Governing Law</h2>
            <p>These terms are governed by the laws of India and any disputes will be subject to the jurisdiction of the courts in Tamil Nadu.</p>
          </section>
        </div>
      </section>
    </StorefrontShell>
  );
}
