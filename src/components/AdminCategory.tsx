"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckIcon,
  Loader2Icon,
  PencilIcon,
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
    loadCategories();
  }, [loadCategories]);

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
        <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl">Categories</h1>
        <p className="text-xs text-white/40 sm:text-sm">
          Manage labels used to classify encrypted mail. Changes apply for all users.
        </p>
      </div>

      <section className="rounded-2xl bg-white/10 p-5 shadow-sm sm:p-5">
        <h2 className="text-xs font-medium text-white sm:text-sm">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="category-name" className="text-white/70">Name</Label>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Category Name"
                className="h-9 px-2.5 text-sm text-white bg-white/10 border-0 placeholder:text-white/30 focus:ring-0 sm:h-10 sm:px-3"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-description" className="text-white/70">
                Description <span className="font-normal text-white/30">(optional)</span>
              </Label>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What belongs in this category?"
                rows={2}
                className="w-full resize-none rounded-xl border-0 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-0 sm:px-3 sm:py-2 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              className="bg-white/10 hover:bg-white hover:text-black rounded-xl"
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              {editingId ? "Save" : "Add"}
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm} disabled={saving} className="bg-white/10 rounded-xl hover:text-white text-white/70 hover:bg-red-600">
                <XIcon className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white/10 sm:py-2 p-2 shadow-sm">
        <div className="border-b border-white/10 px-3 py-2.5 sm:px-6 sm:py-4">
          <h2 className="text-xs font-medium text-white sm:text-sm">All categories</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-white sm:py-12 sm:text-sm">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-center text-xs text-white sm:px-6 sm:py-12 sm:text-sm">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-white/10">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-[10px] text-white sm:px-6 sm:py-3.5 sm:text-xs">Name</TableHead>
                  <TableHead className="hidden px-4 py-3 text-[10px] text-white md:table-cell sm:px-6 sm:py-3.5 sm:text-xs">Description</TableHead>
                  <TableHead className="w-24 px-4 py-3 text-right text-[10px] text-white sm:w-32 sm:px-6 sm:py-3.5 sm:text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className={`border-b border-white/10 transition-colors ${editingId === cat.id ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                  >
                    <TableCell className="max-w-[52vw] truncate px-4 py-3 text-xs font-medium text-white sm:max-w-none sm:px-6 sm:py-4 sm:text-sm">{cat.name}</TableCell>
                    <TableCell className="hidden max-w-xs truncate px-4 py-3 text-xs text-white/50 md:table-cell sm:px-6 sm:py-4 sm:text-sm">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right sm:px-6 sm:py-4">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-white/50 rounded-lg hover:text-white hover:bg-blue-600 border-0 px-2.5 py-1"
                          onClick={() => startEdit(cat)}
                          aria-label={`Edit ${cat.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-white/50 rounded-lg hover:text-white hover:bg-red-600 border-0 px-2.5 py-1"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDelete(cat.id, cat.name)}
                          aria-label={`Delete ${cat.name}`}
                        >
                          {deletingId === cat.id ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="">Delete</div>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
