"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
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

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<typeof emptyCategory & { id?: number }>({ ...emptyCategory });

  const loadCategories = async () => {
    if (!token) {
      return;
    }
    const result = await browserApi.getAdminCategories(token);
    setCategories(result);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;
    const hydrate = async () => {
      const result = await browserApi.getAdminCategories(token);
      if (isActive) {
        setCategories(result);
      }
    };
    void hydrate();

    return () => {
      isActive = false;
    };
  }, [token]);

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    await browserApi.saveCategory(token, form);
    setForm({ ...emptyCategory });
    await loadCategories();
  };

  return (
    <AdminShell title="Category management">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={saveCategory} className="surface-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-[var(--color-blue)]">
            {form.id ? "Edit category" : "Add category"}
          </h2>
          <div className="mt-5 space-y-3">
            {[
              ["name", "Name"],
              ["slug", "Slug"],
              ["priceRange", "Price range"],
              ["themeColor", "Theme color"],
              ["imageUrl", "Image URL"],
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
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
              }
              placeholder="Sort order"
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
            />
            <button className="site-button site-button-primary w-full">
              {form.id ? "Update category" : "Create category"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="surface-card rounded-[2rem] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-blue)]">{category.name}</h3>
                  <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{category.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
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
                      })
                    }
                    className="site-button site-button-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!token) {
                        return;
                      }
                      await browserApi.deleteCategory(token, category.id);
                      await loadCategories();
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
