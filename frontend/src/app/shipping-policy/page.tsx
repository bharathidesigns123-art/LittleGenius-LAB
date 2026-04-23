import { StorefrontShell } from "@/components/site/storefront-shell";

export default function ShippingPolicyPage() {
  return (
    <StorefrontShell>
      <section className="page-shell py-16">
        <h1 className="display-font text-5xl font-semibold text-[var(--color-blue)] mb-8">Shipping Policy</h1>
        
        <div className="surface-card card-shadow rounded-[2.5rem] p-8 md:p-12 space-y-8 text-[var(--color-ink-soft)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Where We Ship</h2>
            <p>LittleGenius LAB ships across India. We partner with reliable courier services (via Shiprocket) to ensure your toys arrive safely and on time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Shipping Rates</h2>
            <p className="mb-4">Enjoy <strong>FREE DELIVERY</strong> on all orders above <strong>Rs. 499</strong>.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-blue)] text-white">
                    <th className="p-4 rounded-tl-xl">Order Type</th>
                    <th className="p-4">Size Category</th>
                    <th className="p-4 rounded-tr-xl">Shipping Fee (Below Rs. 499)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="p-4 font-semibold text-[var(--color-blue)]">Ready-made Toys</td>
                    <td className="p-4">Small / Standard</td>
                    <td className="p-4">Rs. 60</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="p-4 font-semibold text-[var(--color-blue)]">Custom Orders</td>
                    <td className="p-4">Small (100mm)</td>
                    <td className="p-4">Rs. 80</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="p-4 font-semibold text-[var(--color-blue)]">Custom Orders</td>
                    <td className="p-4">Medium / Large</td>
                    <td className="p-4">Rs. 120</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Delivery Timeline</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Ready-made Toys:</strong> Shipped within 2 business days. Delivery usually takes 3-7 days depending on your location.</li>
              <li><strong>Custom Orders:</strong> These require 3D modeling and approval. Shipped within 6-7 business days after you approve the design render.</li>
              <li><strong>Location:</strong> Orders to South India usually arrive within 2-3 days of shipping. Rest of India takes 4-7 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-blue)] mb-4">Tracking Your Order</h2>
            <p>Once your toy is printed and dispatched, you will receive a tracking link via WhatsApp and Email. You can also track your order directly on our website using your Order ID.</p>
          </section>
        </div>
      </section>
    </StorefrontShell>
  );
}
