"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { NominatimAddressLine1Input } from "@/components/store/NominatimAddressLine1Input";
import { EmptyState } from "@/components/ui/empty-state";
import { browserApi } from "@/lib/browser-api";
import type { Address } from "@/lib/types";
import { getCurrentUserIdentifier } from "@/lib/user-identifier";

type CheckoutForm = {
  customerName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  paymentMethod: string;
  notes: string;
};

type PostalApiResponse = {
  Status: string;
  Message?: string;
  PostOffice?: Array<{
    Name?: string;
    Block?: string;
    District?: string;
    State?: string;
  }> | null;
};

type RecentAddress = Omit<Address, "id" | "isDefault"> & {
  id: string;
  isDefault?: boolean;
};

const RECENT_ADDRESS_KEY = "littlegenius.checkout.recentAddress";

const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const inputClass =
  "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "text-sm font-bold text-[var(--color-blue)]";
const errorClass = "text-xs font-semibold text-red-600";

function emptyForm(user?: { fullName?: string; email?: string; phone?: string } | null): CheckoutForm {
  return {
    customerName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    paymentMethod: "Razorpay",
    notes: "",
  };
}

function toFormPatch(address: Address | RecentAddress): Partial<CheckoutForm> {
  return {
    customerName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    country: address.country || "India",
    pincode: address.pincode,
  };
}

function uniqueOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function readRecentAddress(): RecentAddress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(RECENT_ADDRESS_KEY);
    return raw ? (JSON.parse(raw) as RecentAddress) : null;
  } catch {
    return null;
  }
}

function saveRecentAddress(form: CheckoutForm) {
  if (typeof window === "undefined") {
    return;
  }

  const address: RecentAddress = {
    id: "recent",
    label: "Recent checkout",
    recipientName: form.customerName,
    phone: form.phone,
    line1: form.line1,
    line2: form.line2,
    city: form.city,
    state: form.state,
    country: form.country,
    pincode: form.pincode,
    isDefault: false,
  };

  window.localStorage.setItem(RECENT_ADDRESS_KEY, JSON.stringify(address));
}

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const shippingFee = subtotal >= 499 ? 0 : 60;
  const total = subtotal + shippingFee;

  const [form, setForm] = useState<CheckoutForm>(() => emptyForm(user));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successOrderCode, setSuccessOrderCode] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [pincodeStatus, setPincodeStatus] = useState("");
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [recentAddress, setRecentAddress] = useState<RecentAddress | null>(null);
  const [rememberAddress, setRememberAddress] = useState(true);
  const [locationStatus, setLocationStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setRecentAddress(readRecentAddress());
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      customerName: current.customerName || user.fullName || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!successOrderCode) {
      return;
    }
    router.replace(`/orders?placed=${encodeURIComponent(successOrderCode)}`);
  }, [successOrderCode, router]);

  useEffect(() => {
    const pincode = form.pincode.trim();
    if (pincode.length < 6) {
      setPincodeStatus("");
      setCityOptions([]);
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      return;
    }

    const controller = new AbortController();

    async function fetchPincodeDetails() {
      setIsFetchingPincode(true);
      setPincodeStatus("Finding city and state...");

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as PostalApiResponse[];
        const result = data[0];
        const postOffices = result?.PostOffice ?? [];
        const first = postOffices[0];

        if (!response.ok || result?.Status !== "Success" || !first?.State) {
          setPincodeStatus("We could not verify this pincode. Please check it once.");
          setCityOptions([]);
          setFieldErrors((current) => ({ ...current, pincode: "Enter a valid 6-digit pincode." }));
          return;
        }

        const nextCityOptions = uniqueOptions([
          ...postOffices.map((office) => office.District),
          ...postOffices.map((office) => office.Block),
          ...postOffices.map((office) => office.Name),
        ]);

        setCityOptions(nextCityOptions);
        setForm((current) => ({
          ...current,
          city: current.city && nextCityOptions.includes(current.city) ? current.city : nextCityOptions[0] ?? "",
          state: first.State ?? current.state,
          country: "India",
        }));
        setFieldErrors((current) => {
          const next = { ...current };
          delete next.pincode;
          delete next.city;
          delete next.state;
          return next;
        });
        setPincodeStatus(
          nextCityOptions.length > 1
            ? "Pincode matched. Pick the nearest city or post office."
            : "City and state filled from pincode.",
        );
      } catch (lookupError) {
        if (lookupError instanceof DOMException && lookupError.name === "AbortError") {
          return;
        }
        setPincodeStatus("Pincode lookup is unavailable. You can still enter city and state manually.");
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchingPincode(false);
        }
      }
    }

    void fetchPincodeDetails();

    return () => controller.abort();
  }, [form.pincode]);

  const savedAddresses = useMemo(() => {
    const accountAddresses = profile?.addresses ?? [];
    return recentAddress ? [recentAddress, ...accountAddresses] : accountAddresses;
  }, [profile?.addresses, recentAddress]);

  const orderItems = useMemo(
    () => items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  const updateField = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const applyAddress = (address: Address | RecentAddress) => {
    setForm((current) => ({
      ...current,
      ...toFormPatch(address),
      email: current.email,
    }));
    setCityOptions(address.city ? [address.city] : []);
    setPincodeStatus("Saved address applied.");
    setFieldErrors({});
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (form.customerName.trim().length < 2) nextErrors.customerName = "Enter the recipient name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = "Enter a 10-digit mobile number.";
    if (form.line1.trim().length < 6) nextErrors.line1 = "Add house number, street, and area.";
    if (!/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = "Enter a valid 6-digit pincode.";
    if (!form.city.trim()) nextErrors.city = "Select or enter city.";
    if (!form.state.trim()) nextErrors.state = "Select state.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lon: String(position.coords.longitude),
          });
          const response = await fetch(`/api/nominatim/reverse?${params}`);
          if (!response.ok) {
            throw new Error("Location lookup failed.");
          }
          const mapped = (await response.json()) as {
            line1?: string;
            pincode?: string;
            city?: string;
            state?: string;
          };
          setForm((current) => ({
            ...current,
            line1: mapped.line1 || current.line1,
            pincode: mapped.pincode?.slice(0, 6) || current.pincode,
            city: mapped.city || current.city,
            state: mapped.state || current.state,
            country: "India",
          }));
          if (mapped.city) {
            setCityOptions([mapped.city]);
          }
          setLocationStatus("Location filled. Add house or flat number if needed.");
        } catch {
          setLocationStatus("Could not use location. Try address search or pincode instead.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationStatus("Location permission was not granted.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
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
      if (rememberAddress) {
        saveRecentAddress(form);
        setRecentAddress(readRecentAddress());
      }

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
            color: "#06B6D4",
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
      <div className="page-shell py-10 pb-28 md:pb-10">
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
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Redirecting to your orders...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_360px]">
            <form id="checkout-form" onSubmit={handleSubmit} className="surface-card card-shadow rounded-[2rem] p-5 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Checkout
              </p>
              <h1 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)] sm:text-4xl">
                Shipping and payment
              </h1>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Faster address entry with search, pincode auto-fill, and saved addresses.
              </p>

              <section className="mt-7 rounded-[1.75rem] bg-brand-primary/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-primary-dark">
                      Step 1
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-[var(--color-blue)]">
                      Where should we deliver?
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isLocating}
                    className="site-button site-button-secondary px-5 py-2.5 text-xs"
                  >
                    {isLocating ? "Locating..." : "Use my location"}
                  </button>
                </div>
                {locationStatus ? (
                  <p className="mt-3 text-xs font-semibold text-[var(--color-ink-soft)]">{locationStatus}</p>
                ) : null}

                {savedAddresses.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                      Saved addresses
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {savedAddresses.slice(0, 4).map((address) => (
                        <button
                          type="button"
                          key={`${address.id}-${address.pincode}`}
                          onClick={() => applyAddress(address)}
                          className="rounded-2xl border border-white/80 bg-white/90 p-3 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-brand-card"
                        >
                          <span className="font-bold text-[var(--color-blue)]">
                            {address.label || (address.isDefault ? "Default address" : "Saved address")}
                          </span>
                          <span className="mt-1 block truncate text-xs text-[var(--color-ink-soft)]">
                            {address.line1}, {address.city} - {address.pincode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Recipient name</span>
                  <input
                    value={form.customerName}
                    onChange={(event) => updateField("customerName", event.target.value)}
                    className={inputClass}
                    placeholder="Full name on the package"
                    autoComplete="name"
                    required
                  />
                  {fieldErrors.customerName ? <span className={errorClass}>{fieldErrors.customerName}</span> : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Mobile number</span>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={inputClass}
                    placeholder="10-digit WhatsApp/mobile"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                  />
                  {fieldErrors.phone ? <span className={errorClass}>{fieldErrors.phone}</span> : null}
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className={labelClass}>Email</span>
                  <input
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={inputClass}
                    placeholder="order updates will be sent here"
                    type="email"
                    autoComplete="email"
                    required
                  />
                  {fieldErrors.email ? <span className={errorClass}>{fieldErrors.email}</span> : null}
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className={labelClass}>Search address or enter house details</span>
                  <NominatimAddressLine1Input
                    value={form.line1}
                    onChange={(line1) => updateField("line1", line1)}
                    onPick={(mapped) => {
                      setForm((current) => ({
                        ...current,
                        line1: mapped.line1,
                        ...(mapped.pincode.length === 6 ? { pincode: mapped.pincode } : {}),
                        ...(mapped.city ? { city: mapped.city } : {}),
                        ...(mapped.state ? { state: mapped.state } : {}),
                        country: "India",
                      }));
                      if (mapped.city) {
                        setCityOptions([mapped.city]);
                      }
                      setFieldErrors((current) => {
                        const next = { ...current };
                        delete next.line1;
                        delete next.pincode;
                        delete next.city;
                        delete next.state;
                        return next;
                      });
                    }}
                    inputClassName={inputClass}
                    required
                  />
                  <span className="text-xs text-[var(--color-ink-soft)]">
                    Try society, street, area, or landmark. Add flat/house number after selecting.
                  </span>
                  {fieldErrors.line1 ? <span className={errorClass}>{fieldErrors.line1}</span> : null}
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className={labelClass}>Flat, house, landmark</span>
                  <input
                    value={form.line2}
                    onChange={(event) => updateField("line2", event.target.value)}
                    className={inputClass}
                    placeholder="Flat 4B, near main gate, landmark"
                    autoComplete="address-line2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Pincode</span>
                  <div className="relative">
                    <input
                      value={form.pincode}
                      onChange={(event) => updateField("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`${inputClass} pr-24`}
                      placeholder="600001"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      required
                    />
                    {isFetchingPincode ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-primary-dark">
                        Checking
                      </span>
                    ) : null}
                  </div>
                  {pincodeStatus ? <span className="text-xs font-semibold text-[var(--color-ink-soft)]">{pincodeStatus}</span> : null}
                  {fieldErrors.pincode ? <span className={errorClass}>{fieldErrors.pincode}</span> : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>City / post office</span>
                  {cityOptions.length > 1 ? (
                    <select
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className={inputClass}
                      autoComplete="address-level2"
                      required
                    >
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className={inputClass}
                      placeholder="Auto-filled from pincode"
                      autoComplete="address-level2"
                      required
                    />
                  )}
                  {fieldErrors.city ? <span className={errorClass}>{fieldErrors.city}</span> : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>State</span>
                  <select
                    value={form.state}
                    onChange={(event) => updateField("state", event.target.value)}
                    className={inputClass}
                    autoComplete="address-level1"
                    required
                  >
                    <option value="">Select state</option>
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.state ? <span className={errorClass}>{fieldErrors.state}</span> : null}
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Country</span>
                  <input value={form.country} className={inputClass} readOnly autoComplete="country-name" />
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Payment method</span>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) => updateField("paymentMethod", event.target.value)}
                    className={inputClass}
                  >
                    <option>Razorpay</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className={labelClass}>Order notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    className={`${inputClass} min-h-24`}
                    placeholder="Delivery instructions, preferred time, or gift note"
                  />
                </label>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-semibold text-[var(--color-ink-soft)]">
                <input
                  type="checkbox"
                  checked={rememberAddress}
                  onChange={(event) => setRememberAddress(event.target.checked)}
                  className="mt-1 size-4 accent-brand-primary"
                />
                Save this address on this device for faster checkout next time.
              </label>

              {error ? (
                <div className="mt-5 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <button disabled={submitting || isFetchingPincode} className="site-button site-button-primary mt-6 w-full">
                {submitting ? "Placing order..." : "Place My Order"}
              </button>
            </form>

            <aside className="surface-card card-shadow h-fit rounded-[2rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Order summary
              </p>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {item.name} x {item.quantity}
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
              disabled={submitting || isFetchingPincode}
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
