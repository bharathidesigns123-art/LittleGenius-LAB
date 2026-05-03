"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  UploadCloud, 
  Save, 
  X, 
  CheckCircle2,
  ChevronRight,
  Globe
} from "lucide-react";
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
    if (!token) return;
    try {
      const result = await browserApi.getAdminCategories(token);
      setCategories(result);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const handleCategoryImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!isSupportedImage(file) || file.size > maximumImageBytes) {
      setError("Invalid image file.");
      return;
    }

    setCategoryImageFile(file);
    setError("");
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!form.id && !pendingImage) {
      setError("Please upload an image.");
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
      resetForm();
      await loadCategories();
      setSuccessMessage("Category committed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell title="Category Hierarchy">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Form */}
        <div className="w-full lg:w-[420px] lg:flex-shrink-0">
           <form onSubmit={saveCategory} className="surface-card card-shadow sticky top-8 rounded-[2.5rem] p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-8 text-left w-full">
                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
                    {form.id ? <Edit3 size={24} /> : <Plus size={24} />}
                 </div>
                 <div className="text-right">
                    <h2 className="text-xl font-black text-[var(--color-blue)] uppercase tracking-tight">
                       {form.id ? "Modify Category" : "Add Category"}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Store Architecture</p>
                 </div>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700 border border-red-100">
                  <X size={14} /> {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 border border-emerald-100">
                  <CheckCircle2 size={14} /> {successMessage}
                </div>
              )}

              <div className="space-y-4">
                 {[
                    ["name", "Display Name", "e.g. Action Figures"],
                    ["slug", "URL Slug", "action-figures"],
                    ["priceRange", "Price Label", "Starts at Rs. 499"],
                 ].map(([key, label, placeholder]) => (
                    <div key={key} className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">{label}</label>
                       <input
                         value={String(form[key as keyof typeof form] ?? "")}
                         onChange={(e) => setForm(c => ({ ...c, [key]: e.target.value }))}
                         placeholder={placeholder}
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                       />
                    </div>
                 ))}

                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(c => ({ ...c, description: e.target.value }))}
                      placeholder="Brief overview of this category..."
                      className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                    />
                 </div>

                 {/* Image Section */}
                 <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category Cover</span>
                       <label className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-[var(--color-orange)] hover:underline">
                          Change Image
                          <input type="file" onChange={handleCategoryImageSelection} className="hidden" />
                       </label>
                    </div>

                    {(pendingImage || form.imageUrl) ? (
                       <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner bg-slate-200">
                          <Image
                            src={pendingImage?.previewUrl ?? resolveAssetUrl(form.imageUrl)}
                            alt="Preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          {pendingImage && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                Pending Upload
                             </div>
                          )}
                       </div>
                    ) : (
                       <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon size={32} strokeWidth={1} />
                          <span className="text-[10px] font-black uppercase mt-2">No Image Selected</span>
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Theme Color</label>
                       <input
                         type="color"
                         value={form.themeColor}
                         onChange={(e) => setForm(c => ({ ...c, themeColor: e.target.value }))}
                         className="h-11 w-full rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
                       />
                    </div>
                    <div className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Sort Order</label>
                       <input
                         type="number"
                         value={form.sortOrder}
                         onChange={(e) => setForm(c => ({ ...c, sortOrder: Number(e.target.value) }))}
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button
                   disabled={isSaving}
                   className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-blue)] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-blue)]/20 transition-all hover:bg-[var(--color-blue)]/90"
                 >
                   <Save size={16} /> COMMIT
                 </button>
                 {form.id && (
                    <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-4 text-slate-400 hover:bg-slate-50">
                       <X size={16} />
                    </button>
                 )}
              </div>
           </form>
        </div>

        {/* Categories List */}
        <div className="flex-1 space-y-4">
           {categories.map((cat) => (
              <div key={cat.id} className="surface-card card-shadow group overflow-hidden rounded-[2rem] border border-transparent transition-all hover:border-[var(--color-blue)]/10 bg-white p-6">
                 <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-6">
                       <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-100">
                          <Image
                            src={resolveAssetUrl(cat.imageUrl)}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div 
                             className="absolute bottom-0 inset-x-0 h-1" 
                             style={{ backgroundColor: cat.themeColor }} 
                          />
                       </div>
                       <div className="min-w-0 text-left">
                          <h3 className="text-xl font-black text-[var(--color-blue)] truncate group-hover:text-[var(--color-orange)] transition-colors">
                             {cat.name}
                          </h3>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             /{cat.slug} · {cat.priceRange}
                          </p>
                          <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-1 max-w-md">{cat.description}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="flex flex-col items-end mr-4 hidden sm:flex">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order</span>
                          <span className="text-sm font-black text-[var(--color-blue)]">#{cat.sortOrder}</span>
                       </div>
                       
                       <button
                         onClick={() => {
                           setForm({ 
                             ...cat, 
                             id: cat.id,
                             sortOrder: cat.sortOrder ?? 1,
                             isActive: cat.isActive ?? true
                           });
                           setCategoryImageFile(null);
                           setError("");
                           setSuccessMessage("");
                         }}
                         className="flex h-12 items-center gap-2 rounded-xl bg-slate-100 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-blue)] transition-all hover:bg-[var(--color-blue)] hover:text-white"
                       >
                          <Edit3 size={16} /> Edit
                       </button>
                       <button
                         onClick={async () => {
                           if (!token || !confirm("Delete hierarchy entry?")) return;
                           try {
                             await browserApi.deleteCategory(token, cat.id);
                             await loadCategories();
                           } catch (err) { setError(getErrorMessage(err)); }
                         }}
                         className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white"
                       >
                          <Trash2 size={18} />
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
