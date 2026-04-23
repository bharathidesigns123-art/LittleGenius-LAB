"use client";

import Link from "next/link";
import { useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import { resolveAssetUrl } from "@/lib/asset-url";

export default function CustomOrderPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    whatsAppNumber: user?.phone ?? "",
    occasion: "Birthday Gift",
    size: "Medium",
    colorPreference: "Pastel tones",
    characterDescription: "",
    photoUrl: "",
    baseMessage: "",
    pincode: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    referenceCode: string;
    whatsappUrl: string;
  } | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "custom-orders");
      const result = await browserApi.uploadImage(formData);
      setForm((current) => ({ ...current, photoUrl: result.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await browserApi.createCustomOrder(token, form);
      setSuccess({
        referenceCode: result.referenceCode,
        whatsappUrl: result.whatsappUrl,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StorefrontShell>
      <section className="page-shell py-10">
        <div className="grid gap-8 rounded-[2.5rem] bg-[linear-gradient(135deg,#1a3c6e_0%,#264b82_55%,#f5c400_180%)] p-8 text-white md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-white/12 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">
              It&apos;s easier than you think
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/85">
              <p>1. Upload a clear photo or describe your character.</p>
              <p>2. We send a design preview to WhatsApp.</p>
              <p>3. Once approved, we print, pack, and ship.</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">
              Turn your memory into a toy
            </p>
            <h1 className="display-font mt-3 text-5xl font-semibold">
              Custom orders with upload, review, and admin follow-up built in
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/80">
              This page now submits real custom order requests to the backend and supports uploaded reference images using the local file storage pipeline.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="surface-card card-shadow rounded-[2.5rem] p-8">
          {success ? (
            <div className="rounded-[2rem] bg-[var(--color-surface)] p-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Request Received
              </p>
              <h2 className="display-font mt-3 text-4xl font-semibold text-[var(--color-blue)]">
                We&apos;ve got your idea
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                Your reference code is <strong>{success.referenceCode}</strong>. Use WhatsApp for quick follow-up or keep browsing the ready-made collection.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={success.whatsappUrl} className="site-button site-button-primary">
                  Continue on WhatsApp
                </a>
                <Link href="/shop" className="site-button site-button-secondary">
                  Browse ready-made toys
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Your name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">WhatsApp number</span>
                <input
                  value={form.whatsAppNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, whatsAppNumber: event.target.value }))
                  }
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Occasion</span>
                <select
                  value={form.occasion}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, occasion: event.target.value }))
                  }
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                >
                  <option>Birthday Gift</option>
                  <option>Pet Figurine</option>
                  <option>Anniversary Surprise</option>
                  <option>Just Because</option>
                  <option>Corporate Gifting</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Size</span>
                <select
                  value={form.size}
                  onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Color preference</span>
                <input
                  value={form.colorPreference}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, colorPreference: event.target.value }))
                  }
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Upload photo</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                  }}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-blue)] file:px-4 file:py-2 file:text-white"
                />
                {uploading ? <span className="text-sm text-[var(--color-ink-soft)]">Uploading image...</span> : null}
                {form.photoUrl ? (
                  <span className="text-sm font-semibold text-[var(--color-orange)]">
                    Uploaded: {resolveAssetUrl(form.photoUrl)}
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Character description</span>
                <textarea
                  value={form.characterDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      characterDescription: event.target.value,
                    }))
                  }
                  className="min-h-32 rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                  placeholder="Tell us about hairstyle, clothes, accessories, pose, and little details we should capture."
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Base message</span>
                <input
                  value={form.baseMessage}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, baseMessage: event.target.value }))
                  }
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Delivery pincode</span>
                <input
                  value={form.pincode}
                  onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
              </label>
              {error ? (
                <div className="md:col-span-2 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div className="md:col-span-2">
                <button
                  disabled={submitting}
                  className="site-button site-button-primary w-full disabled:opacity-60"
                >
                  {submitting ? "Sending request..." : "Send My Request - Get a Quote in 2 Hours"}
                </button>
                <p className="mt-3 text-center text-sm text-[var(--color-ink-soft)]">
                  No payment needed now. Your request is stored in the backend and visible inside the admin panel immediately.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </StorefrontShell>
  );
}
