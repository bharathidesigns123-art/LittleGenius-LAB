"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { AdminCategory, AdminProduct, ProductImage } from "@/lib/types";

type ProductFormState = {
  id?: number;
  categoryId: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  priceInr: number;
  compareAtPriceInr: string | number;
  badge: string;
  colourway: string;
  material: string;
  finish: string;
  shipsIn: string;
  madeIn: string;
  tagline: string;
  isFeatured: boolean;
  isPublished: boolean;
  sizeMm: number;
  stockQuantity: number;
  lowStockThreshold: number;
  displayOrder: number;
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const maximumImageBytes = 8 * 1024 * 1024;

function createEmptyProduct(categoryId = 1): ProductFormState {
  return {
    categoryId,
    name: "",
    slug: "",
    sku: "",
    shortDescription: "",
    fullDescription: "",
    priceInr: 0,
    compareAtPriceInr: "",
    badge: "",
    colourway: "",
    material: "Child-safe PLA",
    finish: "Smooth matte surface",
    shipsIn: "2 business days",
    madeIn: "Tamil Nadu, India",
    tagline: "",
    isFeatured: false,
    isPublished: true,
    sizeMm: 100,
    stockQuantity: 0,
    lowStockThreshold: 5,
    displayOrder: 1,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function revokePendingImages(images: PendingImage[]) {
  for (const image of images) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
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

type ImagePreviewCardProps = {
  src: string;
  alt: string;
  badge: string;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDelete?: () => void;
  disableMoveLeft?: boolean;
  disableMoveRight?: boolean;
  disabled?: boolean;
};

function ImagePreviewCard({
  src,
  alt,
  badge,
  onMoveLeft,
  onMoveRight,
  onDelete,
  disableMoveLeft,
  disableMoveRight,
  disabled,
}: ImagePreviewCardProps) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-3">
      <div className="overflow-hidden rounded-[1.2rem] bg-[var(--color-surface)]">
        <Image
          src={src}
          alt={alt}
          width={320}
          height={320}
          unoptimized
          className="h-36 w-full object-cover"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--color-blue)]">
          {badge}
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          {onMoveLeft ? (
            <button
              type="button"
              onClick={onMoveLeft}
              disabled={disabled || disableMoveLeft}
              className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-blue)] disabled:opacity-50"
            >
              Left
            </button>
          ) : null}
          {onMoveRight ? (
            <button
              type="button"
              onClick={onMoveRight}
              disabled={disabled || disableMoveRight}
              className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-blue)] disabled:opacity-50"
            >
              Right
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<ProductFormState>(() => createEmptyProduct());
  const [stockAdjustments, setStockAdjustments] = useState<Record<number, number>>({});
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);
  const pendingImagesRef = useRef<PendingImage[]>([]);

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(
    () => () => {
      revokePendingImages(pendingImagesRef.current);
    },
    [],
  );

  const clearPendingImages = () => {
    revokePendingImages(pendingImagesRef.current);
    pendingImagesRef.current = [];
    setPendingImages([]);
  };

  const resetForm = () => {
    clearPendingImages();
    setForm(createEmptyProduct(categories[0]?.id ?? 1));
  };

  const loadData = async () => {
    if (!token) {
      return;
    }

    try {
      const [productResults, categoryResults] = await Promise.all([
        browserApi.getAdminProducts(token),
        browserApi.getAdminCategories(token),
      ]);

      setProducts(productResults);
      setCategories(categoryResults);
      setError("");
      setForm((current) => {
        if (current.id || categoryResults.some((category) => category.id === current.categoryId)) {
          return current;
        }

        return {
          ...current,
          categoryId: categoryResults[0]?.id ?? current.categoryId,
        };
      });
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
        const [productResults, categoryResults] = await Promise.all([
          browserApi.getAdminProducts(token),
          browserApi.getAdminCategories(token),
        ]);

        if (!isActive) {
          return;
        }

        setProducts(productResults);
        setCategories(categoryResults);
        setError("");
        setForm((current) => {
          if (current.id || categoryResults.some((category) => category.id === current.categoryId)) {
            return current;
          }

          return {
            ...current,
            categoryId: categoryResults[0]?.id ?? current.categoryId,
          };
        });
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

  const editingProduct = form.id
    ? products.find((product) => product.id === form.id) ?? null
    : null;
  const uploadedImages = editingProduct?.images ?? [];

  const handlePendingImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const acceptedImages: PendingImage[] = [];
    let validationMessage = "";

    for (const file of selectedFiles) {
      if (!isSupportedImage(file)) {
        validationMessage = "Only JPG, PNG, and WEBP images are supported.";
        continue;
      }

      if (file.size > maximumImageBytes) {
        validationMessage = "Each image must be 8 MB or smaller.";
        continue;
      }

      acceptedImages.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (acceptedImages.length > 0) {
      setPendingImages((current) => [...current, ...acceptedImages]);
      setSuccessMessage(
        form.id
          ? "Images selected. Save or upload actions are ready."
          : "Images selected. They will upload automatically once the product is created.",
      );
    }

    if (validationMessage) {
      setError(validationMessage);
    } else {
      setError("");
    }

    event.target.value = "";
  };

  const handleEditProduct = (product: AdminProduct) => {
    clearPendingImages();
    setError("");
    setSuccessMessage("");
    setForm({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      priceInr: product.priceInr,
      compareAtPriceInr: product.compareAtPriceInr ?? "",
      badge: product.badge,
      colourway: product.colourway,
      material: product.material,
      finish: product.finish,
      shipsIn: product.shipsIn,
      madeIn: product.madeIn,
      tagline: product.tagline,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
      sizeMm: product.sizeMm,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      displayOrder: product.displayOrder,
    });
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const savedProduct = await browserApi.saveProduct(token, {
        ...form,
        heroImageUrl: editingProduct?.heroImageUrl ?? "",
        priceInr: Number(form.priceInr),
        compareAtPriceInr: form.compareAtPriceInr ? Number(form.compareAtPriceInr) : null,
        sizeMm: Number(form.sizeMm),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        displayOrder: Number(form.displayOrder),
      });

      const filesToUpload = pendingImages.map((image) => image.file);
      if (filesToUpload.length > 0) {
        await browserApi.uploadProductImages(token, savedProduct.id, filesToUpload);
      }

      resetForm();
      await loadData();
      setSuccessMessage(
        filesToUpload.length > 0
          ? "Product saved and images uploaded."
          : form.id
            ? "Product updated."
            : "Product created.",
      );
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const movePendingImage = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pendingImages.length) {
      return;
    }

    setPendingImages((current) => moveItem(current, index, targetIndex));
  };

  const removePendingImage = (index: number) => {
    setPendingImages((current) => {
      const image = current[index];
      if (!image) {
        return current;
      }

      URL.revokeObjectURL(image.previewUrl);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const moveUploadedImage = async (
    productId: number,
    images: ProductImage[],
    index: number,
    direction: number,
  ) => {
    if (!token) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const reorderedImages = moveItem(images, index, targetIndex);
    setBusyImageId(images[index]?.id ?? null);
    setError("");
    setSuccessMessage("");

    try {
      await browserApi.reorderProductImages(
        token,
        productId,
        reorderedImages.map((image) => image.id),
      );
      await loadData();
      setSuccessMessage("Product image order updated.");
    } catch (moveError) {
      setError(getErrorMessage(moveError));
    } finally {
      setBusyImageId(null);
    }
  };

  const deleteUploadedImage = async (productId: number, imageId: number) => {
    if (!token) {
      return;
    }

    setBusyImageId(imageId);
    setError("");
    setSuccessMessage("");

    try {
      await browserApi.deleteProductImage(token, productId, imageId);
      await loadData();
      setSuccessMessage("Product image deleted.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusyImageId(null);
    }
  };

  return (
    <AdminShell title="Products and inventory">
      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <form onSubmit={saveProduct} className="surface-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-[var(--color-blue)]">
            {form.id ? "Edit product" : "Add product"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">
            Manage catalogue details and attach gallery images through the Azure upload flow.
          </p>

          {error ? (
            <div className="mt-4 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {successMessage ? (
            <div className="mt-4 rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: Number(event.target.value) }))
              }
              className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {[
              ["name", "Name"],
              ["slug", "Slug"],
              ["sku", "SKU"],
              ["badge", "Badge"],
              ["colourway", "Colourway"],
              ["material", "Material"],
              ["finish", "Finish"],
              ["shipsIn", "Ships in"],
              ["madeIn", "Made in"],
              ["tagline", "Tagline"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={String(form[key as keyof typeof form] ?? "")}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                placeholder={label}
                className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              />
            ))}
            <textarea
              value={form.shortDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, shortDescription: event.target.value }))
              }
              placeholder="Short description"
              className="min-h-24 rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            />
            <textarea
              value={form.fullDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullDescription: event.target.value }))
              }
              placeholder="Full description"
              className="min-h-32 rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["priceInr", "Price"],
                ["compareAtPriceInr", "Compare at price"],
                ["sizeMm", "Size (mm)"],
                ["stockQuantity", "Stock"],
                ["lowStockThreshold", "Low stock threshold"],
                ["displayOrder", "Display order"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  type="number"
                  value={String(form[key as keyof typeof form] ?? "")}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={label}
                  className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-blue)]">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isFeatured: event.target.checked }))
                }
              />
              Featured product
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-blue)]">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isPublished: event.target.checked }))
                }
              />
              Published
            </label>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-blue)]">Product gallery</h3>
                <p className="mt-1 text-sm leading-7 text-[var(--color-ink-soft)]">
                  Upload JPG, PNG, or WEBP files. Images are validated on the server and resized for a
                  consistent storefront gallery.
                </p>
              </div>
              <label className="site-button site-button-secondary cursor-pointer text-center">
                Choose images
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePendingImageSelection}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-orange)]">
              Minimum 400x400 pixels, maximum 8 MB, recommended square or near-square photos.
            </p>

            {pendingImages.length > 0 ? (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[var(--color-blue)]">Pending uploads</h4>
                  <button
                    type="button"
                    onClick={clearPendingImages}
                    className="text-sm font-semibold text-[var(--color-orange)]"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {pendingImages.map((image, index) => (
                    <ImagePreviewCard
                      key={image.id}
                      src={image.previewUrl}
                      alt={`${form.name || "New product"} pending image ${index + 1}`}
                      badge={`Pending ${index + 1}`}
                      onMoveLeft={() => movePendingImage(index, -1)}
                      onMoveRight={() => movePendingImage(index, 1)}
                      onDelete={() => removePendingImage(index)}
                      disableMoveLeft={index === 0}
                      disableMoveRight={index === pendingImages.length - 1}
                      disabled={isSaving}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {form.id ? (
              uploadedImages.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-[var(--color-blue)]">Uploaded images</h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {uploadedImages.map((image, index) => (
                      <ImagePreviewCard
                        key={image.id}
                        src={resolveAssetUrl(image.imageUrl)}
                        alt={`${form.name || editingProduct?.name || "Product"} uploaded image ${index + 1}`}
                        badge={index === 0 ? "Primary image" : `Image ${index + 1}`}
                        onMoveLeft={() => moveUploadedImage(form.id!, uploadedImages, index, -1)}
                        onMoveRight={() => moveUploadedImage(form.id!, uploadedImages, index, 1)}
                        onDelete={() => deleteUploadedImage(form.id!, image.id)}
                        disableMoveLeft={index === 0}
                        disableMoveRight={index === uploadedImages.length - 1}
                        disabled={busyImageId === image.id}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                  Add uploaded images to create this product gallery.
                </p>
              )
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                You can select images now. They will upload automatically after the new product is created.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={isSaving}
              className="site-button site-button-primary w-full disabled:opacity-60"
            >
              {isSaving ? "Saving..." : form.id ? "Update product" : "Create product"}
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
          {products.map((product) => (
            <div key={product.id} className="surface-card rounded-[2rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  {product.heroImageUrl ? (
                    <div className="hidden h-20 w-20 overflow-hidden rounded-[1.2rem] bg-[var(--color-surface)] sm:block">
                      <Image
                        src={resolveAssetUrl(product.heroImageUrl)}
                        alt={product.name}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-blue)]">{product.name}</h3>
                    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                      {product.categoryName} - SKU {product.sku}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-orange)]">
                      Rs. {product.priceInr} - Stock {product.stockQuantity}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-blue)]">
                      {product.imageCount > 0
                        ? `${product.imageCount} uploaded image${product.imageCount === 1 ? "" : "s"}`
                        : "No uploaded images yet"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditProduct(product)}
                    className="site-button site-button-secondary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token) {
                        return;
                      }

                      setError("");
                      setSuccessMessage("");

                      try {
                        await browserApi.deleteProduct(token, product.id);
                        if (form.id === product.id) {
                          resetForm();
                        }
                        await loadData();
                        setSuccessMessage("Product deleted.");
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
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  value={stockAdjustments[product.id] ?? 0}
                  onChange={(event) =>
                    setStockAdjustments((current) => ({
                      ...current,
                      [product.id]: Number(event.target.value),
                    }))
                  }
                  className="w-28 rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) {
                      return;
                    }

                    setError("");
                    setSuccessMessage("");

                    try {
                      await browserApi.adjustInventory(token, {
                        productId: product.id,
                        quantityChange: stockAdjustments[product.id] ?? 0,
                        reason: "Admin manual update",
                      });
                      setStockAdjustments((current) => ({ ...current, [product.id]: 0 }));
                      await loadData();
                      setSuccessMessage("Inventory updated.");
                    } catch (inventoryError) {
                      setError(getErrorMessage(inventoryError));
                    }
                  }}
                  className="site-button site-button-secondary"
                >
                  Adjust stock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
