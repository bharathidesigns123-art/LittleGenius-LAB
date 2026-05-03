"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
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

const inputClass =
  "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[var(--color-blue)]/10 disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "text-sm font-semibold text-[var(--color-blue)]";
const errorClass = "text-xs font-medium text-red-600";

export function ShippingAddressForm({ defaultValues, onSubmit }: ShippingAddressFormProps) {
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

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
      phoneNumber: "",
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

  const submitAddress = async (values: ShippingAddressFormValues) => {
    await onSubmit?.(values);
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
          <span className={labelClass}>Phone Number</span>
          <input
            {...register("phoneNumber", {
              onChange: (event) => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
            className={inputClass}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
          />
          {errors.phoneNumber ? <span className={errorClass}>{errors.phoneNumber.message}</span> : null}
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

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Address Line 1</span>
          <input
            {...register("addressLine1")}
            className={inputClass}
            placeholder="House no, street, area"
            autoComplete="address-line1"
          />
          {errors.addressLine1 ? <span className={errorClass}>{errors.addressLine1.message}</span> : null}
        </label>

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
