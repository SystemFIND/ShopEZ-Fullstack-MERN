import React from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { api, money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminProducts() {
    const { user } = useAuth();
    const [products, setProducts] = React.useState(null);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        load();
    }, []);

    function load() {
        api.get("/products", { params: { limit: 200 } }).then(({ data }) => setProducts(data));
    }

    async function handleDelete(p) {
        if (!window.confirm(`Delete "${p.name}"?`)) return;
        try {
            await api.delete(`/products/${p.id}`);
            toast.success("Product deleted");
            load();
        } catch {
            toast.error("Could not delete");
        }
    }

    const filtered = (products || []).filter((p) => {
        if (user?.role === "seller" && p.seller_id !== user.id) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <AdminLayout
            title="Products"
            action={
                <Link to="/admin/products/new" data-testid="admin-products-new-btn" className="ez-btn-primary inline-flex items-center gap-2">
                    <Plus size={14} strokeWidth={1.5} /> New product
                </Link>
            }
        >
            <div className="mb-6">
                <input
                    type="text"
                    data-testid="admin-products-search"
                    placeholder="Search products..."
                    className="ez-input max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {products === null ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 ez-skel" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center border border-neutral-200">
                    <p className="ez-overline mb-3">Nothing here</p>
                    <p className="text-sm text-neutral-600 mb-6">
                        {user?.role === "seller" ? "You haven't added any products yet." : "No products found."}
                    </p>
                    <Link to="/admin/products/new" className="ez-btn-primary inline-flex">Add your first product</Link>
                </div>
            ) : (
                <div className="border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr className="text-left">
                                <th className="px-4 py-3 ez-overline">Product</th>
                                <th className="px-4 py-3 ez-overline">Category</th>
                                <th className="px-4 py-3 ez-overline">Stock</th>
                                <th className="px-4 py-3 ez-overline">Price</th>
                                <th className="px-4 py-3 ez-overline text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} className="border-b border-neutral-100 last:border-0" data-testid={`admin-product-row-${p.id}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={resolveImageUrl(p.image_url)} alt={p.name} className="w-10 aspect-[3/4] object-cover bg-neutral-100" />
                                            <div>
                                                <p className="font-medium">{p.name}</p>
                                                <p className="text-xs text-neutral-500">{p.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-600">{p.category_name || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : ""}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{money(p.price)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <Link
                                                to={`/admin/products/${p.id}/edit`}
                                                data-testid={`admin-product-edit-${p.id}`}
                                                className="p-2 hover:bg-neutral-100"
                                                title="Edit"
                                            >
                                                <Edit size={14} strokeWidth={1.5} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p)}
                                                data-testid={`admin-product-delete-${p.id}`}
                                                className="p-2 hover:bg-neutral-100 text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
