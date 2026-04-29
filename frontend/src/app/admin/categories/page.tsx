"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { resolveAssetUrl } from "@/lib/asset-url";
import { browserApi } from "@/lib/browser-api";
import type { AdminCategory } from "@/lib/types";

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  priceRange: "",
  themeColor: "#1A3C6E",
  imageUrl: "",
  sortOrder: 1,
  isActive: true,
};

const maximumImageBytes = 8 * 1024 * 1024;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isSupportedImage(file: File): boolean {
  const normalizedName = file.name.toLowerCase();
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp" ||
    normalizedName.endsWith(".jpg") ||
    normalizedName.endsWith(".jpeg") ||
    normalizedName.endsWith(".png") ||
    normalizedName.endsWith(".webp")
  );
}

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<typeof emptyCategory & { id?: number }>({ ...emptyCategory });
  const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const pendingPreviewRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (pendingPreviewRef.current) {
        URL.revokeObjectURL(pendingPreviewRef.current);
      }
    },
    [],
  );

  const setCategoryImageFile = (file: File | null) => {
    if (pendingPreviewRef.current) {
      URL.revokeObjectURL(pendingPreviewRef.current);
      pendingPreviewRef.current = null;
    }

    if (!file) {
      setPendingImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    pendingPreviewRef.current = previewUrl;
    setPendingImage({ file, previewUrl });
  };

  const resetForm = () => {
    setForm({ ...emptyCategory });
    setCategoryImageFile(null);
  };

  const loadCategories = async () => {
    if (!token) {
      return;
    }

    try {
      const result = await browserApi.getAdminCategories(token);
      setCategories(result);
      setError("");
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;
    const hydrate = async () => {
      try {
        const result = await browserApi.getAdminCategories(token);
        if (isActive) {
          setCategories(result);
          setError("");
        }
      } catch (loadError) {
        if (isActive) {
          setError(getErrorMessage(loadError));
        }
      }
    };
    void hydrate();

    return () => {
      isActive = false;
    };
  }, [token]);

  const handleCategoryImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isSupportedImage(file)) {
      setError("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    if (file.size > maximumImageBytes) {
      setError("Category image must be 8 MB or smaller.");
      return;
    }

    setCategoryImageFile(file);
    setError("");
    setSuccessMessage("Category image selected.");
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!form.id && !pendingImage) {
      setError("Upload a category image before creating the category.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const imageUrl = pendingImage
        ? await browserApi.uploadCategoryImage(token, pendingImage.file)
        : form.imageUrl;

      await browserApi.saveCategory(token, {
        ...form,
        imageUrl,
        sortOrder: Number(form.sortOrder),
      });
      const wasEditing = Boolean(form.id);
      resetForm();
      await loadCategories();
      setSuccessMessage(wasEditing ? "Category updated." : "Category created.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell title="Category management">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={saveCategory} className="surface-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-[var(--color-blue)]">
            {form.id ? "Edit category" : "Add category"}
          </h2>

          {error ? (
            <div className="mt-4 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {successMessage ? (
            <div className="mt-4 rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {[
              ["name", "Name"],
              ["slug", "Slug"],
              ["priceRange", "Price range"],
              ["themeColor", "Theme color"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={String(form[key as keyof typeof form] ?? "")}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                placeholder={label}
                className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              />
            ))}
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="min-h-28 w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            />

            <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-blue)]">Category image</h3>
                  <p className="mt-1 text-sm leading-7 text-[var(--color-ink-soft)]">
                    Upload a JPG, PNG, or WEBP image through Blob Storage.
                  </p>
                </div>
                <label className="site-button site-button-secondary cursor-pointer text-center">
                  Choose image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCategoryImageSelection}
                    className="hidden"
                  />
                </label>
              </div>

              {pendingImage || form.imageUrl ? (
                <div className="mt-4 max-w-xs rounded-[1.4rem] border border-[var(--color-border)] bg-white p-3">
                  <Image
                    src={pendingImage?.previewUrl ?? resolveAssetUrl(form.imageUrl)}
                    alt={`${form.name || "Category"} image preview`}
                    width={320}
                    height={220}
                    unoptimized
                    className="h-36 w-full rounded-[1rem] object-cover"
                  />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
                    {pendingImage ? "Ready to upload" : "Current image"}
                  </p>
                </div>
              ) : null}
            </div>

            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
              }
              placeholder="Sort order"
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            />
            <button disabled={isSaving} className="site-button site-button-primary w-full disabled:opacity-60">
              {isSaving ? "Saving..." : form.id ? "Update category" : "Create category"}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="site-button site-button-secondary w-full disabled:opacity-60"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="surface-card rounded-[2rem] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  {category.imageUrl ? (
                    <div className="hidden h-20 w-20 overflow-hidden rounded-[1.2rem] bg-[var(--color-surface)] sm:block">
                      <Image
                        src={resolveAssetUrl(category.imageUrl)}
                        alt={category.name}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-blue)]">{category.name}</h3>
                    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setForm({
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                        priceRange: category.priceRange,
                        themeColor: category.themeColor,
                        imageUrl: category.imageUrl,
                        sortOrder: category.sortOrder ?? 1,
                        isActive: category.isActive ?? true,
                      });
                      setCategoryImageFile(null);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="site-button site-button-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!token) {
                        return;
                      }

                      setError("");
                      setSuccessMessage("");

                      try {
                        await browserApi.deleteCategory(token, category.id);
                        if (form.id === category.id) {
                          resetForm();
                        }
                        await loadCategories();
                        setSuccessMessage("Category deleted.");
                      } catch (deleteError) {
                        setError(getErrorMessage(deleteError));
                      }
                    }}
                    className="site-button bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
