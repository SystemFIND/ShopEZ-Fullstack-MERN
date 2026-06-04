import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader, { resolveImageUrl } from "@/components/ImageUploader";
import { toast } from "sonner";

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = React.useState({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category_id: "",
        image_url: "",
        images: "",
        brand: "",
    });
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(isEdit);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        api.get("/categories").then(({ data }) => setCategories(data));
        if (isEdit) {
            api.get(`/products/${id}`).then(({ data }) => {
                setForm({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    category_id: data.category_id,
                    image_url: data.image_url,
                    images: (data.images || []).join("\n"),
                    brand: data.brand || "",
                });
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id, isEdit]);

    function update(k, v) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.image_url) {
            setError("Please upload or paste a primary image.");
            return;
        }
        setSaving(true);
        setError("");
        const payload = {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
            images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        };
        try {
            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success("Product updated");
            } else {
                await api.post("/products", payload);
                toast.success("Product created");
            }
            navigate("/admin/products");
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AdminLayout title={isEdit ? "Edit product" : "New product"}>
                <div className="h-64 ez-skel" />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={isEdit ? "Edit product" : "New product"}>
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6" data-testid="product-form">
                {error && (
                    <div className="p-4 border border-destructive text-sm text-destructive" data-testid="product-form-error">
                        {error}
                    </div>
                )}

                <div>
                    <label className="ez-label">Product name</label>
                    <input data-testid="product-form-name" required className="ez-input" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>

                <div>
                    <label className="ez-label">Description</label>
                    <textarea data-testid="product-form-description" required rows={5} className="ez-input" value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="ez-label">Price (USD)</label>
                        <input data-testid="product-form-price" type="number" step="0.01" min="0" required className="ez-input" value={form.price} onChange={(e) => update("price", e.target.value)} />
                    </div>
                    <div>
                        <label className="ez-label">Stock</label>
                        <input data-testid="product-form-stock" type="number" min="0" required className="ez-input" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
                    </div>
                    <div>
                        <label className="ez-label">Brand</label>
                        <input data-testid="product-form-brand" className="ez-input" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="ez-label">Category</label>
                    <select data-testid="product-form-category" required className="ez-input" value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <ImageUploader
                        label="Primary image"
                        value={form.image_url}
                        onChange={(v) => update("image_url", v)}
                        testid="product-form-image"
                    />
                </div>

                <div>
                    <label className="ez-label">Additional image URLs (one per line — optional)</label>
                    <textarea data-testid="product-form-images" rows={3} className="ez-input" value={form.images} onChange={(e) => update("images", e.target.value)} placeholder="https://...
https://..." />
                    {form.images.split("\n").filter((s) => s.trim()).length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {form.images.split("\n").map((s) => s.trim()).filter(Boolean).map((url, idx) => (
                                <img key={idx} src={resolveImageUrl(url)} alt="" className="w-16 aspect-[3/4] object-cover bg-neutral-100" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button data-testid="product-form-submit" type="submit" disabled={saving} className="ez-btn-primary">
                        {saving ? "Saving..." : isEdit ? "Update product" : "Create product"}
                    </button>
                    <button type="button" onClick={() => navigate("/admin/products")} className="ez-btn-ghost">
                        Cancel
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
