import React from "react";
import { Edit, Trash2, Plus, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
    const [cats, setCats] = React.useState(null);
    const [creating, setCreating] = React.useState(false);
    const [form, setForm] = React.useState({ name: "", slug: "", description: "" });
    const [editingId, setEditingId] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ name: "", slug: "", description: "" });

    React.useEffect(() => { load(); }, []);

    function load() {
        api.get("/categories").then(({ data }) => setCats(data));
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await api.post("/categories", {
                name: form.name,
                slug: form.slug || slugify(form.name),
                description: form.description,
            });
            toast.success("Category created");
            setForm({ name: "", slug: "", description: "" });
            setCreating(false);
            load();
        } catch (e) {
            toast.error("Could not create");
        }
    }

    async function handleUpdate(id) {
        try {
            await api.put(`/categories/${id}`, editForm);
            toast.success("Category updated");
            setEditingId(null);
            load();
        } catch {
            toast.error("Could not update");
        }
    }

    async function handleDelete(c) {
        if (!window.confirm(`Delete category "${c.name}"?`)) return;
        try {
            await api.delete(`/categories/${c.id}`);
            toast.success("Category deleted");
            load();
        } catch {
            toast.error("Could not delete");
        }
    }

    function startEdit(c) {
        setEditingId(c.id);
        setEditForm({ name: c.name, slug: c.slug, description: c.description || "" });
    }

    return (
        <AdminLayout
            title="Categories"
            action={
                <button
                    onClick={() => setCreating((v) => !v)}
                    data-testid="admin-category-new-btn"
                    className="ez-btn-primary inline-flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={1.5} /> {creating ? "Close" : "New category"}
                </button>
            }
        >
            {creating && (
                <form onSubmit={handleCreate} className="mb-8 border border-neutral-200 p-5 space-y-3" data-testid="admin-category-form">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input data-testid="cat-form-name" placeholder="Name" required className="ez-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input data-testid="cat-form-slug" placeholder="Slug (optional)" className="ez-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                        <input placeholder="Description (optional)" className="ez-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <button data-testid="cat-form-submit" type="submit" className="ez-btn-primary">Add category</button>
                </form>
            )}

            {cats === null ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 ez-skel" />)}</div>
            ) : cats.length === 0 ? (
                <p className="text-sm text-neutral-500 py-12 text-center border border-neutral-200">No categories yet.</p>
            ) : (
                <div className="border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr className="text-left">
                                <th className="px-4 py-3 ez-overline">Name</th>
                                <th className="px-4 py-3 ez-overline">Slug</th>
                                <th className="px-4 py-3 ez-overline">Description</th>
                                <th className="px-4 py-3 ez-overline text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cats.map((c) => (
                                <tr key={c.id} className="border-b border-neutral-100 last:border-0" data-testid={`cat-row-${c.id}`}>
                                    {editingId === c.id ? (
                                        <>
                                            <td className="px-4 py-3"><input className="ez-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                                            <td className="px-4 py-3"><input className="ez-input" value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} /></td>
                                            <td className="px-4 py-3"><input className="ez-input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleUpdate(c.id)} className="p-2 hover:bg-neutral-100"><Check size={14} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-2 hover:bg-neutral-100"><X size={14} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium">{c.name}</td>
                                            <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{c.slug}</td>
                                            <td className="px-4 py-3 text-neutral-600">{c.description || "—"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => startEdit(c)} data-testid={`cat-edit-${c.id}`} className="p-2 hover:bg-neutral-100"><Edit size={14} strokeWidth={1.5} /></button>
                                                <button onClick={() => handleDelete(c)} data-testid={`cat-delete-${c.id}`} className="p-2 hover:bg-neutral-100 text-red-600"><Trash2 size={14} strokeWidth={1.5} /></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
