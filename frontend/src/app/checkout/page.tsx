"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { browserApi } from "@/lib/browser-api";
import { getCurrentUserIdentifier } from "@/lib/user-identifier";

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const shippingFee = subtotal >= 499 ? 0 : 60;
  const total = subtotal + shippingFee;

  const [form, setForm] = useState({
    customerName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "Tamil Nadu",
    country: "India",
    pincode: "",
    paymentMethod: "Razorpay",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successOrderCode, setSuccessOrderCode] = useState("");

  useEffect(() => {
    if (!successOrderCode) {
      return;
    }
    router.replace(`/orders?placed=${encodeURIComponent(successOrderCode)}`);
  }, [successOrderCode, router]);

  const orderItems = useMemo(
    () => items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Please enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = "Phone number must be 10 digits.";
    if (!/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = "Pincode must be 6 digits.";
    if (form.line1.trim().length < 6) nextErrors.line1 = "Address line 1 is too short.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.customerName.trim()) nextErrors.customerName = "Name is required.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const id = getCurrentUserIdentifier(user);

      if (form.paymentMethod === "Razorpay") {
        const payment = await browserApi.prepareRazorpayCheckout(token, {
          ...form,
          guestId: id.mode === "guest" ? id.guestId : null,
          items: orderItems,
        });

        if (typeof window === "undefined") {
          throw new Error("Payment can only be processed in a browser environment.");
        }

        const Razorpay = window.Razorpay;
        if (!Razorpay || !payment.publicKey) {
          throw new Error("Razorpay checkout is unavailable. Please try again in a moment.");
        }

        const razorpay = new Razorpay({
          key: payment.publicKey,
          amount: payment.razorpayOrder.amount,
          currency: payment.razorpayOrder.currency,
          name: "LittleGenius LAB",
          description: `Checkout ${payment.checkoutReceipt}`,
          order_id: payment.razorpayOrder.id,
          prefill: {
            name: payment.customer.customerName,
            email: payment.customer.email,
            contact: payment.customer.phone,
          },
          theme: {
            color: "#1A3C6E",
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verified = await browserApi.verifyRazorpayPayment({
                serverOrderId: payment.razorpayOrder.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              setSubmitting(false);
              router.replace(`/orders?placed=${encodeURIComponent(verified.orderCode)}`);
            } catch (verifyError) {
              setSubmitting(false);
              setError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment may have succeeded but we could not confirm your order. Please check your orders or contact support.",
              );
            }
          },
          modal: {
            ondismiss: () => setSubmitting(false),
          },
        } as Record<string, unknown>);

        razorpay.open();
        return;
      }

      const order = await browserApi.createOrder(token, {
        ...form,
        guestId: id.mode === "guest" ? id.guestId : null,
        items: orderItems,
      });

      clearCart();
      setSuccessOrderCode(order.orderCode);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not place your order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StorefrontShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="page-shell py-10">
        {items.length === 0 ? (
          <EmptyState
            title="Your checkout is empty"
            description="Add a few toys to the cart before placing an order."
            action={
              <Link href="/shop" className="site-button site-button-primary">
                Browse products
              </Link>
            }
          />
        ) : successOrderCode ? (
          <div className="surface-card card-shadow mx-auto max-w-md rounded-[1.5rem] p-8 text-center">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Redirecting to your orders…</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_360px]">
            <form id="checkout-form" onSubmit={handleSubmit} className="surface-card card-shadow rounded-[2.5rem] p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Checkout
              </p>
              <h1 className="display-font mt-2 text-4xl font-semibold text-[var(--color-blue)]">
                Shipping and payment
              </h1>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                 Delivery in 2-4 days | Secure payments via Razorpay / UPI
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-ink-soft)]">
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-2">Secure payment</span>
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-2">Made in India</span>
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-2">Safe material</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["customerName", "Full name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["pincode", "Pincode"],
                  ["city", "City"],
                  ["state", "State"],
                ].map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-[var(--color-blue)]">{label}</span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                      required
                    />
                    {fieldErrors[key] ? <span className="text-xs text-red-600">{fieldErrors[key]}</span> : null}
                  </label>
                ))}
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-[var(--color-blue)]">Address line 1</span>
                  <input
                    value={form.line1}
                    onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
                    className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                    required
                  />
                  {fieldErrors.line1 ? <span className="text-xs text-red-600">{fieldErrors.line1}</span> : null}
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-[var(--color-blue)]">Address line 2</span>
                  <input
                    value={form.line2}
                    onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
                    className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[var(--color-blue)]">Country</span>
                  <input
                    value={form.country}
                    onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                    className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[var(--color-blue)]">Payment method</span>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, paymentMethod: event.target.value }))
                    }
                    className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  >
                    <option>Razorpay</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-[var(--color-blue)]">Order notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    className="min-h-28 rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  />
                </label>
              </div>
              {error ? (
                <div className="mt-5 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}
              <button disabled={submitting} className="site-button site-button-primary mt-6 w-full">
                {submitting ? "Placing order..." : "Place My Order"}
              </button>
            </form>

            <aside className="surface-card card-shadow rounded-[2rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Order summary
              </p>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>Rs. {item.priceInr * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : `Rs. ${shippingFee}`}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-[var(--color-blue)]">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--color-ink-soft)]">
                Need help? Share your cart on WhatsApp and our team will assist with checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
      {items.length > 0 && !successOrderCode ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white/95 p-3 backdrop-blur md:hidden">
          <div className="page-shell flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--color-ink-soft)]">Payable</p>
              <p className="text-lg font-bold text-[var(--color-blue)]">Rs. {total}</p>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="site-button site-button-primary min-w-44"
            >
              {submitting ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      ) : null}
    </StorefrontShell>
  );
}
