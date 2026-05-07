"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{
    referenceCode: string;
    whatsappUrl: string;
  } | null>(null);
  const flowSteps = ["Upload reference", "Preview rendering", "Approval", "Production & shipping"];
  const activeStep = form.photoUrl || form.characterDescription.trim().length > 8 ? 2 : 1;
  const progress = Math.round((activeStep / flowSteps.length) * 100);
  const canSubmit = useMemo(() => !uploading && !submitting, [uploading, submitting]);

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

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (!/^\d{10}$/.test(form.whatsAppNumber.trim())) nextErrors.whatsAppNumber = "Enter a valid 10-digit WhatsApp number.";
    if (!/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = "Enter a valid 6-digit pincode.";
    if (!form.photoUrl && form.characterDescription.trim().length < 12) {
      nextErrors.reference = "Upload a photo or add a detailed character description.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
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
      <section className="page-shell py-12">
        <div className="grid items-start gap-8 rounded-[3rem] bg-[linear-gradient(135deg,#1a3c6e_0%,#264b82_55%,#e05c1a_180%)] p-6 text-white md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">
              Custom Toy Studio
            </p>
            <h1 className="display-font text-5xl md:text-6xl font-semibold leading-tight">
              Turn your memory into a premium keepsake
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-white/80 md:text-lg">
              Upload a reference, approve a 3D render on WhatsApp, and receive your printed toy in 5-7 days.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
              {["Free design preview", "2 revisions included", "From Rs. 800", "Made in India"].map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">Progress tracker</p>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-[var(--color-yellow)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/80">{progress}% journey completed</p>
            <div className="mt-5 space-y-3 text-sm">
              {flowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      index + 1 <= activeStep ? "bg-[var(--color-yellow)] text-[var(--color-blue)]" : "bg-white/20 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={index + 1 <= activeStep ? "text-white" : "text-white/70"}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="surface-card card-shadow rounded-[3rem] p-8 md:p-12">
          {success ? (
            <div className="max-w-xl mx-auto text-center py-10">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="display-font text-4xl font-bold text-[var(--color-blue)] mb-4">
                We&apos;ve Got Your Request!
              </h2>
              <p className="text-lg text-[var(--color-ink-soft)] mb-8">
                Expect your first WhatsApp update in 2 hours with a design quote.
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
                  Tell us about your toy
                </h3>
                <p className="text-[var(--color-ink-soft)] mt-2">
                  No upfront payment needed. We finalize everything on WhatsApp before production.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Upload reference</h4>
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
                            <div className="text-4xl mb-3">Upload</div>
                            <p className="text-sm font-semibold text-[var(--color-blue)] mb-1">Upload Your Photo</p>
                            <p className="text-xs text-[var(--color-ink-soft)] mb-4">Front-facing works best (JPG, PNG under 10MB)</p>
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
                            <div className="site-button site-button-secondary pointer-events-none px-6 py-2 text-xs">
                              <LoadingButtonContent loading={uploading} loadingText="Uploading...">
                                Select File
                              </LoadingButtonContent>
                            </div>
                          </>
                        )}
                      </div>
                      {fieldErrors.reference ? <p className="mt-2 text-sm text-red-600">{fieldErrors.reference}</p> : null}
                    </div>

                    <textarea
                      value={form.characterDescription}
                      onChange={(event) => setForm(c => ({ ...c, characterDescription: event.target.value }))}
                      className="min-h-[200px] rounded-[2rem] border border-[var(--color-border)] px-6 py-5 outline-none focus:border-[var(--color-blue)] transition-colors resize-none"
                      placeholder="OR describe your character... (Hairstyle, clothes, accessories, any details we should know!)"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Customize Your Order</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Occasion</span>
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
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Select Size</span>
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
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Base Message (Optional)</span>
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

                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-sm">Contact Details</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Your Name</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm(c => ({ ...c, name: event.target.value }))}
                        required
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                      {fieldErrors.name ? <span className="text-xs text-red-600">{fieldErrors.name}</span> : null}
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">Email Address</span>
                      <input
                        value={form.email}
                        onChange={(event) => setForm(c => ({ ...c, email: event.target.value }))}
                        required
                        placeholder="you@example.com"
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                      {fieldErrors.email ? <span className="text-xs text-red-600">{fieldErrors.email}</span> : null}
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wide ml-2">WhatsApp Number</span>
                      <input
                        value={form.whatsAppNumber}
                        onChange={(event) => setForm(c => ({ ...c, whatsAppNumber: event.target.value }))}
                        required
                        placeholder="10-digit number"
                        className="rounded-full border border-[var(--color-border)] px-6 py-3 outline-none focus:border-[var(--color-blue)]"
                      />
                      {fieldErrors.whatsAppNumber ? <span className="text-xs text-red-600">{fieldErrors.whatsAppNumber}</span> : null}
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
                      {fieldErrors.pincode ? <span className="text-xs text-red-600">{fieldErrors.pincode}</span> : null}
                    </label>
                  </div>
                  <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-sm font-bold text-[var(--color-blue)]">WhatsApp-style status updates</p>
                    <div className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
                      <p>09:45 - Request received</p>
                      <p>11:20 - 3D preview shared</p>
                      <p>12:05 - Awaiting approval</p>
                      <p>14:30 - In production (ETA 5-7 days)</p>
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="md:col-span-2 rounded-[1.5rem] bg-red-50 px-6 py-4 text-sm text-red-700 border border-red-100">
                    {error}
                  </div>
                ) : null}

                <div className="md:col-span-2 pt-6">
                  <button
                    disabled={!canSubmit}
                    aria-label="Send custom order request"
                    className="site-button site-button-primary w-full py-4 text-lg shadow-lg shadow-orange-500/20 disabled:cursor-wait disabled:opacity-60"
                  >
                    <LoadingButtonContent loading={submitting} loadingText="Sending request...">
                      Send My Request - Get a Quote in 2 Hours
                    </LoadingButtonContent>
                  </button>
                  <p className="mt-4 text-center text-sm text-[var(--color-ink-soft)]">
                    We share quote and delivery timeline before confirming your order.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="text-center mb-10">
          <h4 className="display-font text-2xl font-bold text-[var(--color-blue)]">
            200+ custom toys made and delivered
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
