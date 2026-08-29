"use client";

import { useCallback, useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckIcon,
  Edit2Icon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "@/lib/toast";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

const emptyForm = { name: "", description: "" };

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/category/admin");
      const data = await res.json();
      if (data.ok) {
        setItems(data.categories ?? []);
      } else {
        toast.error(data.error || "Failed to load categories");
      }
    } catch {
      toast.error("Could not load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchCats() {
      try {
        const res = await fetch("/api/category/admin");
        const data = await res.json();
        if (!ignore) {
          if (data.ok) {
            setItems(data.categories ?? []);
          } else {
            toast.error(data.error || "Failed to load categories");
          }
        }
      } catch {
        if (!ignore) toast.error("Could not load categories");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCats();
    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    try {
      const url = editingId
        ? `/api/category/admin/${editingId}`
        : "/api/category/admin";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(editingId ? "Category updated" : "Category created");
        resetForm();
        await loadCategories();
      } else {
        toast.error(data.error || "Request failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/category/admin/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        toast.success("Category deleted");
        if (editingId === id) resetForm();
        await loadCategories();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto sm:mt-0 mt-10 max-w-3xl px-4 sm:px-6 py-4 sm:py-0 space-y-4 sm:space-y-8">
      <div className="space-y-0.5 sm:space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-black sm:text-2xl">Categories</h1>
        <p className="text-xs text-black/50 sm:text-sm">
          Manage labels used to classify encrypted mail. Changes apply for all users.
        </p>
      </div>

      <section className="rounded-4xl bg-white border p-5 shadow-sm sm:p-5">
        <h2 className="text-xs font-medium text-black sm:text-sm">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="category-name" className="text-black/70">Name</Label>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Category Name"
                className="h-9 px-2.5 text-sm text-black bg-transparent! border-0 placeholder:text-black/50 focus:ring-0 sm:h-10 sm:px-3"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-description" className="text-black/70">
                Description <span className="font-normal text-black/50">(optional)</span>
              </Label>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What belongs in this category?"
                rows={2}
                className="w-full resize-none rounded-xl bg-transparent! border-0 px-2.5 py-1.5 text-xs text-black placeholder:text-black/50 outline-0 sm:px-3 sm:py-2 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CustomButton
              type="submit"
              color={editingId ? "green" : "red"}
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <CheckIcon className="h-4 w-4 sm:block hidden" />
              ) : (
                <PlusIcon className="h-4 w-4 sm:block hidden" />
              )}
              <span>{editingId ? "Save" : "Add"}</span>
            </CustomButton>
            {editingId && (
              <CustomButton
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                <XIcon className="h-4 w-4 sm:block hidden" />
                <span>Cancel</span>
              </CustomButton>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-black">
            All categories
          </h2>
          <span className="text-[11px] sm:text-xs text-black/50 font-mono">
            {items.length} {items.length === 1 ? "Category" : "Categories"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-black sm:py-12 sm:text-sm">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] p-6 text-center text-xs text-black sm:text-sm">
            No categories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {items.map((cat) => (
              <div
                key={cat.id}
                className={`overflow-hidden rounded-3xl bg-white border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-200 p-3.5 sm:px-5 sm:py-3 flex items-center justify-between gap-3 text-black ${
                  editingId === cat.id ? "bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-black truncate">
                      {cat.name}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] sm:text-xs text-black/50 truncate mt-0.5">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <CustomButton
                    size="xs"
                    color="blue"
                    onClick={() => startEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2Icon className="h-3 w-3 sm:block hidden" />
                    <span>Edit</span>
                  </CustomButton>
                  <CustomButton
                    size="xs"
                    color="red"
                    disabled={deletingId === cat.id}
                    onClick={() => handleDelete(cat.id, cat.name)}
                    aria-label={`Delete ${cat.name}`}
                  >
                    {deletingId === cat.id ? (
                      <Loader2Icon className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2Icon className="h-3 w-3 sm:block hidden" />
                    )}
                    <span>Delete</span>
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
