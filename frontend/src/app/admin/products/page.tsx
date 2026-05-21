"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  UploadCloud, 
  Save, 
  X, 
  CheckCircle2,
  Globe,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { AdminCategory, AdminProduct } from "@/lib/types";

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
  heroImageUrl: string;
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
    heroImageUrl: "",
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

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [productResults, categoryResults] = await Promise.all([
        browserApi.getAdminProducts(token),
        browserApi.getAdminCategories(token),
      ]);
      setProducts(productResults);
      setCategories(categoryResults);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    queueMicrotask(() => {
      void loadData();
    });
  }, [token, loadData]);

  const editingProduct = form.id ? products.find((p) => p.id === form.id) ?? null : null;
  const uploadedImages = editingProduct?.images ?? [];
  const updateFormField =
    <K extends keyof ProductFormState>(key: K) =>
    (value: ProductFormState[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    };

  const handlePendingImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const acceptedImages: PendingImage[] = [];
    for (const file of selectedFiles) {
      if (isSupportedImage(file) && file.size <= maximumImageBytes) {
        acceptedImages.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    if (acceptedImages.length > 0) {
      setPendingImages((current) => [...current, ...acceptedImages]);
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
      heroImageUrl: product.heroImageUrl,
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
      lowStockThreshold: product.lowStockThreshold ?? 5,
      displayOrder: product.displayOrder ?? 1,
    });
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const savedProduct = await browserApi.saveProduct(token, {
        ...form,
        heroImageUrl: form.heroImageUrl || editingProduct?.heroImageUrl || "",
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
      setSuccessMessage("Product committed successfully.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUploadedImage = async (productId: number, imageId: number) => {
    if (!token) return;
    setBusyImageId(imageId);
    try {
      await browserApi.deleteProductImage(token, productId, imageId);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyImageId(null);
    }
  };

  const adjustStock = async (product: AdminProduct) => {
    if (!token) return;
    const change = stockAdjustments[product.id] ?? 0;
    if (change === 0) return;
    try {
      await browserApi.adjustInventory(token, {
        productId: product.id,
        quantityChange: change,
        reason: "Manual adjustment",
      });
      setStockAdjustments(c => ({ ...c, [product.id]: 0 }));
      await loadData();
      setSuccessMessage(`Updated stock for ${product.name}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AdminShell title="Inventory and Catalogue">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Side: Product Form */}
        <div className="w-full lg:w-[480px] lg:flex-shrink-0">
          <form onSubmit={saveProduct} className="surface-card card-shadow sticky top-8 rounded-[2.5rem] p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-orange)]/10 text-[var(--color-orange)]">
                  {form.id ? <Edit3 size={24} /> : <Plus size={24} />}
               </div>
               <div>
                  <h2 className="text-xl font-bold text-[var(--color-blue)] text-right">
                    {form.id ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right mt-1">
                    Catalogue Entry
                  </p>
               </div>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl bg-red-50 px-5 py-3 text-xs font-bold text-red-700 flex items-center gap-2 border border-red-100">
                <X size={14} /> {error}
              </div>
            ) : null}
            {successMessage ? (
              <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700 flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 size={14} /> {successMessage}
              </div>
            ) : null}

            <div className="space-y-6 text-left">
               <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(event) => updateFormField("categoryId")(Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["name", "Product Name", "The Sparky Toy"],
                    ["slug", "URL Slug", "sparky-toy"],
                    ["sku", "SKU", "LG-SPARKY-001"],
                    ["badge", "Badge", "Best Seller"],
                    ["tagline", "Tagline", "Made to spark tiny imaginations"],
                    ["heroImageUrl", "Hero Image URL", "https://..."],
                  ].map(([key, label, placeholder]) => (
                    <div key={key} className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">{label}</label>
                       <input
                         value={String(form[key as keyof typeof form] ?? "")}
                         onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                         placeholder={placeholder}
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                       />
                    </div>
                  ))}
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["priceInr", "Price (Rs.)"],
                    ["compareAtPriceInr", "Compare At Price (Rs.)"],
                    ["sizeMm", "Size (mm)"],
                    ["stockQuantity", "Current Stock"],
                    ["lowStockThreshold", "Low Stock Threshold"],
                    ["displayOrder", "Display Order"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">{label}</label>
                       <input
                         type="number"
                         value={String(form[key as keyof typeof form] ?? "")}
                         onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                       />
                    </div>
                  ))}
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["colourway", "Colourway", "Sunrise coral and cream"],
                    ["material", "Material", "Child-safe PLA"],
                    ["finish", "Finish", "Smooth matte surface"],
                    ["shipsIn", "Ships In", "2 business days"],
                    ["madeIn", "Made In", "Tamil Nadu, India"],
                  ].map(([key, label, placeholder]) => (
                    <div key={key} className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">{label}</label>
                       <input
                         value={String(form[key as keyof typeof form] ?? "")}
                         onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                         placeholder={placeholder}
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                       />
                    </div>
                  ))}
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Short Description</label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(event) => updateFormField("shortDescription")(event.target.value)}
                    placeholder="A short storefront summary for cards and quick previews"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Full Description</label>
                  <textarea
                    value={form.fullDescription}
                    onChange={(event) => updateFormField("fullDescription")(event.target.value)}
                    placeholder="Detailed product description for the product page"
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                  />
               </div>

               <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${form.isPublished ? 'bg-[var(--color-blue)] border-[var(--color-blue)]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                       {form.isPublished && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.isPublished}
                      onChange={(event) => updateFormField("isPublished")(event.target.checked)}
                    />
                    <span className="text-sm font-bold text-[var(--color-blue)]">Publish to storefront</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${form.isFeatured ? 'bg-[var(--color-orange)] border-[var(--color-orange)]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                       {form.isFeatured && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.isFeatured}
                      onChange={(event) => updateFormField("isFeatured")(event.target.checked)}
                    />
                    <span className="text-sm font-bold text-[var(--color-blue)]">Mark as featured</span>
                  </label>
               </div>
            </div>

            {/* Image Gallery Section in Sidebar */}
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-blue)] flex items-center gap-2">
                     <ImageIcon size={16} className="text-[var(--color-orange)]" />
                     Gallery
                  </h3>
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-[var(--color-blue)] text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors">
                     <UploadCloud size={14} /> Add Images
                     <input type="file" multiple accept="image/*" onChange={handlePendingImageSelection} className="hidden" />
                  </label>
               </div>
               
               <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((img) => (
                     <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 bg-slate-50">
                        <Image src={resolveAssetUrl(img.imageUrl)} alt="" fill unoptimized className="object-cover" />
                        <button 
                           type="button"
                           disabled={busyImageId === img.id}
                           onClick={() => deleteUploadedImage(form.id!, img.id)}
                           className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:bg-slate-400/50"
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  ))}
                  {pendingImages.map((img) => (
                     <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-[var(--color-orange)] p-0.5">
                        <Image src={img.previewUrl} alt="" fill unoptimized className="object-cover rounded-md" />
                        <div className="absolute inset-0 bg-[var(--color-orange)]/20 flex items-center justify-center pointer-events-none">
                           <span className="text-[8px] font-black text-white bg-[var(--color-orange)] px-1 rounded-sm uppercase">Pending</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-blue)] py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-blue)]/20 transition-all hover:bg-[var(--color-blue)]/90 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Commit Changes"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400 hover:bg-slate-50 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Product List */}
        <div className="flex-1">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="surface-card card-shadow group flex flex-col overflow-hidden rounded-[2.5rem] border border-transparent transition-all hover:border-[var(--color-blue)]/10 bg-white">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {product.heroImageUrl ? (
                    <Image
                      src={resolveAssetUrl(product.heroImageUrl)}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                       <ImageIcon size={48} strokeWidth={1} />
                    </div>
                  )}
                  
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                     <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${product.isPublished ? "bg-white text-emerald-600" : "bg-white text-slate-400"}`}>
                        {product.isPublished ? <Globe size={10} /> : <EyeOff size={10} />}
                        {product.isPublished ? "Public" : "Draft"}
                     </span>
                     {product.stockQuantity <= product.lowStockThreshold && (
                        <span className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/20">
                           <AlertTriangle size={10} /> Low Stock
                        </span>
                     )}
                  </div>

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/20 backdrop-blur-md py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-[var(--color-blue)] transition-all font-bold"
                        >
                          <Edit3 size={14} /> Quick Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                             if (!token || !confirm(`Delete ${product.name}?`)) return;
                             try {
                                await browserApi.deleteProduct(token, product.id);
                                await loadData();
                             } catch (err) { setError(getErrorMessage(err)); }
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 backdrop-blur-md text-white hover:bg-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                </div>

                <div className="p-6 text-left">
                  <div className="flex items-start justify-between gap-3 text-left">
                     <div className="min-w-0 flex-1 text-left">
                        <h3 className="truncate text-lg font-bold text-[var(--color-blue)] group-hover:text-[var(--color-orange)] transition-colors">
                           {product.name}
                        </h3>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                           {product.categoryName} · {product.sku}
                        </p>
                     </div>
                     <p className="text-lg font-black text-[var(--color-blue)]">
                        Rs.{product.priceInr}
                     </p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                     <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                           <span>Stock Level</span>
                           <span className={product.stockQuantity <= product.lowStockThreshold ? "text-red-600 font-black" : "text-emerald-600 font-black"}>
                              {product.stockQuantity} Left
                           </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/50">
                           <div 
                              className={`h-full rounded-full transition-all duration-500 ${product.stockQuantity <= product.lowStockThreshold ? 'bg-red-600' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, (product.stockQuantity / 50) * 100)}%` }} 
                           />
                        </div>
                     </div>
                     
                     <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          value={stockAdjustments[product.id] ?? 0}
                          onChange={(e) => setStockAdjustments(c => ({ ...c, [product.id]: Number(e.target.value) }))}
                          className="w-14 rounded-lg border border-slate-100 bg-slate-50 p-1 text-center text-xs font-black text-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-orange)]/20 outline-none"
                        />
                        <button 
                           onClick={() => adjustStock(product)}
                           className="text-[8px] font-black uppercase tracking-tighter text-[var(--color-orange)] hover:underline"
                        >
                           Adjust
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
