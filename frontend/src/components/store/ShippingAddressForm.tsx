"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { NominatimSearchHit } from "@/lib/nominatim-address";
import { mapNominatimHitToIndianAddress } from "@/lib/nominatim-address";

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().trim().email("Enter a valid email address"),
  addressLine1: z.string().trim().min(5, "Address line 1 is required"),
  addressLine2: z.string().trim().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

type ShippingAddressFormProps = {
  defaultValues?: Partial<ShippingAddressFormValues>;
  onSubmit?: (values: ShippingAddressFormValues) => void | Promise<void>;
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

const DEBOUNCE_MS = 500;

export type { NominatimSearchHit } from "@/lib/nominatim-address";

const inputClass =
  "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[var(--color-blue)]/10 disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "text-sm font-semibold text-[var(--color-blue)]";
const errorClass = "text-xs font-medium text-red-600";

export function ShippingAddressForm({ defaultValues, onSubmit }: ShippingAddressFormProps) {
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimSearchHit[]>([]);
  const [addressSuggestLoading, setAddressSuggestLoading] = useState(false);
  const [addressSuggestOpen, setAddressSuggestOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const blurCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
      city: "",
      state: "",
      ...defaultValues,
    },
  });

  const pincode = useWatch({ control, name: "pincode" });

  const clearBlurTimer = () => {
    if (blurCloseTimer.current) {
      clearTimeout(blurCloseTimer.current);
      blurCloseTimer.current = null;
    }
  };

  const fetchSuggestions = useCallback(async (term: string) => {
    const q = term.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setAddressSuggestLoading(false);
      return;
    }

    suggestionAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionAbortRef.current = controller;

    setAddressSuggestLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch(`/api/nominatim/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await response.json()) as NominatimSearchHit[];
      if (!controller.signal.aborted) {
        setSuggestions(Array.isArray(data) ? data : []);
        setHighlightIndex(-1);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) {
        setAddressSuggestLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const normalizedPincode = pincode?.trim() ?? "";

    if (normalizedPincode.length !== 6) {
      queueMicrotask(() => setIsFetchingPincode(false));
      setValue("city", "", { shouldDirty: true, shouldValidate: true });
      setValue("state", "", { shouldDirty: true, shouldValidate: true });
      if (normalizedPincode.length < 6) {
        clearErrors("pincode");
      }
      return;
    }

    const controller = new AbortController();

    async function fetchPincodeDetails() {
      setIsFetchingPincode(true);

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${normalizedPincode}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as PostalApiResponse[];
        const result = data[0];
        const postOffice = result?.PostOffice?.[0];

        if (!response.ok || result?.Status !== "Success" || !postOffice?.State) {
          setValue("city", "", { shouldDirty: true, shouldValidate: true });
          setValue("state", "", { shouldDirty: true, shouldValidate: true });
          setError("pincode", { type: "manual", message: "Invalid Pincode" });
          return;
        }

        setValue("city", postOffice.District || postOffice.Block || postOffice.Name || "", {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("state", postOffice.State, { shouldDirty: true, shouldValidate: true });
        clearErrors("pincode");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setValue("city", "", { shouldDirty: true, shouldValidate: true });
        setValue("state", "", { shouldDirty: true, shouldValidate: true });
        setError("pincode", { type: "manual", message: "Invalid Pincode" });
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchingPincode(false);
        }
      }
    }

    fetchPincodeDetails();

    return () => controller.abort();
  }, [clearErrors, pincode, setError, setValue]);

  useEffect(() => {
    return () => {
      clearBlurTimer();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      suggestionAbortRef.current?.abort();
    };
  }, []);

  const submitAddress = async (values: ShippingAddressFormValues) => {
    await onSubmit?.(values);
  };

  const applySuggestion = (hit: NominatimSearchHit) => {
    const mapped = mapNominatimHitToIndianAddress(hit);
    setValue("addressLine1", mapped.line1, { shouldDirty: true, shouldValidate: true });
    if (mapped.pincode.length === 6) {
      setValue("pincode", mapped.pincode, { shouldDirty: true, shouldValidate: true });
    }
    if (mapped.city) {
      setValue("city", mapped.city, { shouldDirty: true, shouldValidate: true });
    }
    if (mapped.state) {
      setValue("state", mapped.state, { shouldDirty: true, shouldValidate: true });
    }
    clearErrors(["addressLine1", "pincode", "city", "state"]);
    setSuggestions([]);
    setAddressSuggestOpen(false);
    setHighlightIndex(-1);
    suggestionAbortRef.current?.abort();
    setAddressSuggestLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(submitAddress)} className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Full Name</span>
          <input
            {...register("fullName")}
            className={inputClass}
            placeholder="Enter your full name"
            autoComplete="name"
          />
          {errors.fullName ? <span className={errorClass}>{errors.fullName.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Phone</span>
          <input
            {...register("phone", {
              onChange: (event) => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
            className={inputClass}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
          />
          {errors.phone ? <span className={errorClass}>{errors.phone.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Email</span>
          <input
            {...register("email")}
            className={inputClass}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
          {errors.email ? <span className={errorClass}>{errors.email.message}</span> : null}
        </label>

        <div className="relative z-20 md:col-span-2">
          <span className={labelClass}>Address Line 1</span>
          <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Start typing for India-wide address suggestions (OpenStreetMap).</p>
          <Controller
            name="addressLine1"
            control={control}
            render={({ field }) => (
              <div className="relative mt-2">
                <input
                  {...field}
                  className={inputClass}
                  placeholder="House no, street, area — search as you type"
                  autoComplete="street-address"
                  aria-expanded={addressSuggestOpen}
                  aria-controls="address-suggest-list"
                  aria-activedescendant={
                    highlightIndex >= 0 ? `address-suggest-${highlightIndex}` : undefined
                  }
                  onChange={(event) => {
                    field.onChange(event);
                    const next = event.target.value;
                    setAddressSuggestOpen(true);
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    debounceTimerRef.current = setTimeout(() => {
                      void fetchSuggestions(next);
                    }, DEBOUNCE_MS);
                  }}
                  onFocus={() => {
                    clearBlurTimer();
                    setAddressSuggestOpen(true);
                    const q = field.value?.trim() ?? "";
                    if (q.length >= 3) {
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                      }
                      debounceTimerRef.current = setTimeout(() => {
                        void fetchSuggestions(q);
                      }, DEBOUNCE_MS);
                    }
                  }}
                  onBlur={() => {
                    blurCloseTimer.current = setTimeout(() => {
                      setAddressSuggestOpen(false);
                      setHighlightIndex(-1);
                    }, 180);
                  }}
                  onKeyDown={(event) => {
                    if (!addressSuggestOpen || suggestions.length === 0) {
                      return;
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setHighlightIndex((i) => Math.max(i - 1, 0));
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      const pick =
                        highlightIndex >= 0 ? suggestions[highlightIndex] : suggestions[0];
                      if (pick) {
                        applySuggestion(pick);
                      }
                    } else if (event.key === "Escape") {
                      setAddressSuggestOpen(false);
                      setHighlightIndex(-1);
                    }
                  }}
                />

                {addressSuggestOpen && (addressSuggestLoading || suggestions.length > 0) ? (
                  <ul
                    id="address-suggest-list"
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-[var(--color-border)] bg-white py-2 shadow-xl shadow-slate-900/10"
                  >
                    {addressSuggestLoading ? (
                      <li className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
                        <span
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-blue)]/25 border-t-[var(--color-blue)]"
                          aria-hidden
                        />
                        Loading suggestions…
                      </li>
                    ) : null}
                    {!addressSuggestLoading &&
                      suggestions.map((hit, index) => (
                        <li key={`${hit.display_name}-${index}`} role="presentation">
                          <button
                            type="button"
                            role="option"
                            id={`address-suggest-${index}`}
                            aria-selected={highlightIndex === index}
                            className={`w-full px-4 py-3 text-left text-sm leading-snug transition hover:bg-[var(--color-surface)] ${
                              highlightIndex === index ? "bg-[var(--color-surface)]" : ""
                            }`}
                            onMouseEnter={() => setHighlightIndex(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applySuggestion(hit)}
                          >
                            {hit.display_name}
                          </button>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </div>
            )}
          />
          {errors.addressLine1 ? <span className={errorClass}>{errors.addressLine1.message}</span> : null}
        </div>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Address Line 2</span>
          <input
            {...register("addressLine2")}
            className={inputClass}
            placeholder="Landmark, apartment, or delivery note"
            autoComplete="address-line2"
          />
          {errors.addressLine2 ? <span className={errorClass}>{errors.addressLine2.message}</span> : null}
        </label>

        <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Pincode</span>
            <div className="relative">
              <input
                {...register("pincode", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
                  },
                })}
                className={`${inputClass} pr-24`}
                placeholder="6-digit pincode"
                inputMode="numeric"
                autoComplete="postal-code"
              />
              {isFetchingPincode ? (
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs font-semibold text-[var(--color-blue)]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-blue)]/25 border-t-[var(--color-blue)]" />
                  Fetching
                </span>
              ) : null}
            </div>
            {errors.pincode ? <span className={errorClass}>{errors.pincode.message}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>City</span>
            <input
              {...register("city")}
              className={inputClass}
              placeholder="Auto-filled"
              readOnly
              autoComplete="address-level2"
            />
            {errors.city ? <span className={errorClass}>{errors.city.message}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>State</span>
            <input
              {...register("state")}
              className={inputClass}
              placeholder="Auto-filled"
              readOnly
              autoComplete="address-level1"
            />
            {errors.state ? <span className={errorClass}>{errors.state.message}</span> : null}
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isFetchingPincode || isSubmitting || !isValid}
        className="mt-6 w-full rounded-2xl bg-[var(--color-orange)] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-orange)]/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        {isSubmitting ? "Saving Address..." : "Continue to Payment"}
      </button>
    </form>
  );
}

export default ShippingAddressForm;
