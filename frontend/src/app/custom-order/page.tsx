"use client";

import Image from "next/image";
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
      {/* Hero Section */}
      <section className="page-shell py-12">
        <div className="grid gap-8 rounded-[3rem] bg-[linear-gradient(135deg,#1a3c6e_0%,#264b82_55%,#e05c1a_180%)] p-10 text-white md:grid-cols-[1fr_1fr] items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)] mb-4">
              Made Just For You 🎨
            </p>
            <h1 className="display-font text-5xl md:text-6xl font-semibold leading-tight">
              Turn Your Memory <br /> into a Toy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80 max-w-lg">
              Send us a photo. We&apos;ll design and 3D print a one-of-a-kind figurine — of your child, your pet, or any character you love. No two are ever the same.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                ✅ Free design preview
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                ✅ 2 revisions included
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                ✅ From Rs. 800
              </span>
            </div>
          </div>
          
          <div className="rounded-[2.5rem] bg-white/10 backdrop-blur-md p-8 border border-white/10">
            <h2 className="display-font text-2xl font-bold text-[var(--color-yellow)] mb-6">
              It&apos;s Easier Than You Think ✨
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-yellow)] text-[var(--color-blue)] flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold">Share Your Photo</h4>
                  <p className="text-sm text-white/70">Upload a clear photo or describe your character idea.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-yellow)] text-[var(--color-blue)] flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold">Get a Design Preview</h4>
                  <p className="text-sm text-white/70">We send a 3D model render to your WhatsApp within 2 hours.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-yellow)] text-[var(--color-blue)] flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold">Your Toy Gets Printed</h4>
                  <p className="text-sm text-white/70">Once you approve, we print, pack, and ship it to you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="page-shell pb-20">
        <div className="surface-card card-shadow rounded-[3rem] p-8 md:p-12">
          {success ? (
            <div className="max-w-xl mx-auto text-center py-10">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="display-font text-4xl font-bold text-[var(--color-blue)] mb-4">
                We&apos;ve Got Your Request!
              </h2>
              <p className="text-lg text-[var(--color-ink-soft)] mb-8">
                Expect a WhatsApp message from us within 2 hours with your design quote.
                Your reference code is <span className="font-bold text-[var(--color-orange)]">#{success.referenceCode}</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={success.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="site-button site-button-primary"
                >
                  Continue on WhatsApp
                </a>
                <Link href="/shop" className="site-button site-button-secondary">
                  Browse Ready-Made Toys
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="display-font text-3xl font-bold text-[var(--color-blue)]">
                  Tell Us About Your Toy 🎨
                </h3>
                <p className="text-[var(--color-ink-soft)] mt-2">
                  No payment needed now. We&apos;ll confirm everything on WhatsApp first.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
                {/* Step 1: Visuals */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Upload Photo or Describe</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <div className={`border-2 border-dashed rounded-[2rem] p-8 transition-colors text-center flex flex-col items-center justify-center min-h-[200px] ${form.photoUrl ? 'border-[var(--color-orange)] bg-orange-50' : 'border-[var(--color-border)] hover:border-[var(--color-blue)]'}`}>
                        {form.photoUrl ? (
                          <>
                            <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 border-2 border-white shadow-md">
                                <Image src={resolveAssetUrl(form.photoUrl)} alt="Preview" width={320} height={320} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm font-bold text-[var(--color-orange)]">Photo Uploaded!</p>
                            <button 
                              type="button" 
                              onClick={() => setForm(c => ({...c, photoUrl: ""}))}
                              aria-label="Remove uploaded photo"
                              className="mt-2 text-xs text-red-500 underline"
                            >
                              Remove and change
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl mb-3">📸</div>
                            <p className="text-sm font-semibold text-[var(--color-blue)] mb-1">Upload Your Photo</p>
                            <p className="text-xs text-[var(--color-ink-soft)] mb-4">Front-facing works best! (JPG, PNG under 10MB)</p>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              aria-label="Upload photo"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void handleUpload(file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="site-button site-button-secondary py-2 px-6 text-xs pointer-events-none">
                              {uploading ? "Uploading..." : "Select File"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={form.characterDescription}
                      onChange={(event) => setForm(c => ({ ...c, characterDescription: event.target.value }))}
                      className="min-h-[200px] rounded-[2rem] border border-[var(--color-border)] px-6 py-5 outline-none focus:border-[var(--color-blue)] transition-colors resize-none"
                      placeholder="OR describe your character... (Hairstyle, clothes, accessories, any details we should know!)"
                    />
                  </div>
                </div>

                {/* Step 2: Customization */}
                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Customize Your Order</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Occasion 🎉</span>
                      <select
                        value={form.occasion}
                        onChange={(event) => setForm(c => ({ ...c, occasion: event.target.value }))}
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)] appearance-none bg-white"
                      >
                        <option>Birthday Gift</option>
                        <option>Anniversary Surprise</option>
                        <option>Pet Figurine</option>
                        <option>Just Because!</option>
                        <option>Corporate Gifting</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Select Size 📏</span>
                      <select
                        value={form.size}
                        onChange={(event) => setForm(c => ({ ...c, size: event.target.value }))}
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)] appearance-none bg-white"
                      >
                        <option value="Small">Small (100mm) - Rs. 800</option>
                        <option value="Medium">Medium (150mm) - Rs. 1,200</option>
                        <option value="Large">Large (200mm) - Rs. 1,600</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Base Message (Optional) 💬</span>
                      <input
                        value={form.baseMessage}
                        onChange={(event) => setForm(c => ({ ...c, baseMessage: event.target.value }))}
                        placeholder="e.g. Happy Birthday Arjun!"
                        maxLength={30}
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                    </label>
                  </div>
                </div>

                {/* Step 3: Contact */}
                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Contact Details</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Your Name</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm(c => ({ ...c, name: event.target.value }))}
                        required
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">WhatsApp Number 📱</span>
                      <input
                        value={form.whatsAppNumber}
                        onChange={(event) => setForm(c => ({ ...c, whatsAppNumber: event.target.value }))}
                        required
                        placeholder="10-digit number"
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Delivery Pincode</span>
                      <input
                        value={form.pincode}
                        onChange={(event) => setForm(c => ({ ...c, pincode: event.target.value }))}
                        required
                        placeholder="6-digit PIN"
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                    </label>
                  </div>
                </div>

                {error ? (
                  <div className="md:col-span-2 rounded-[1.5rem] bg-red-50 px-6 py-4 text-sm text-red-700 border border-red-100">
                    {error}
                  </div>
                ) : null}

                <div className="md:col-span-2 pt-6">
                  <button
                    disabled={submitting}
                    aria-label="Send custom order request"
                    className="site-button site-button-primary w-full py-4 text-lg shadow-lg shadow-orange-500/20 disabled:opacity-60"
                  >
                    {submitting ? "Sending Request..." : "Send My Request — Get a Quote in 2 Hours"}
                  </button>
                  <p className="mt-4 text-center text-sm text-[var(--color-ink-soft)]">
                    No payment needed now. We&apos;ll WhatsApp you a quote before anything is confirmed.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="page-shell pb-20">
        <div className="text-center mb-10">
          <h4 className="display-font text-2xl font-bold text-[var(--color-blue)]">
            200+ Custom Toys Made & Delivered 🎨
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: "Birthday gift for daughter", icon: "🎈" },
             { label: "Pet miniature — Retriever", icon: "🐾" },
             { label: "Anniversary couple figurine", icon: "💍" },
             { label: "Corporate gifting — 20 units", icon: "🏢" }
           ].map((item, i) => (
             <div key={i} className="surface-card rounded-[2rem] p-6 text-center border-dashed border-2">
               <div className="text-4xl mb-3">{item.icon}</div>
               <p className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-tighter">
                 {item.label}
               </p>
             </div>
           ))}
        </div>
      </section>
    </StorefrontShell>
  );
}
