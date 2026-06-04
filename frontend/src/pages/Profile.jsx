import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = React.useState({ name: "", phone: "", address: "" });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (user && user !== false) {
            setForm({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
            });
        }
    }, [user]);

    if (!user || user === false) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(form);
            toast.success("Profile updated");
        } catch {
            toast.error("Could not update profile");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="ez-container py-12" data-testid="profile-page">
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Account</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    {user.name}
                </h1>
                <p className="mt-3 text-sm text-neutral-500">{user.email} · <span className="ez-badge">{user.role}</span></p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <p className="ez-overline">Profile details</p>
                    <div>
                        <label className="ez-label">Full name</label>
                        <input
                            data-testid="profile-name-input"
                            className="ez-input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="ez-label">Phone</label>
                        <input
                            data-testid="profile-phone-input"
                            className="ez-input"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="ez-label">Default address</label>
                        <textarea
                            data-testid="profile-address-input"
                            className="ez-input min-h-[100px]"
                            rows={3}
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                    </div>
                    <button data-testid="profile-save-btn" disabled={saving} className="ez-btn-primary">
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </form>

                <aside className="space-y-3">
                    <p className="ez-overline">Quick links</p>
                    <Link to="/orders" data-testid="profile-link-orders" className="block border border-neutral-200 p-4 hover:border-black transition-colors">
                        <p className="text-sm font-medium">Your orders</p>
                        <p className="text-xs text-neutral-500 mt-1">Track recent purchases</p>
                    </Link>
                    <Link to="/wishlist" data-testid="profile-link-wishlist" className="block border border-neutral-200 p-4 hover:border-black transition-colors">
                        <p className="text-sm font-medium">Wishlist</p>
                        <p className="text-xs text-neutral-500 mt-1">Items saved for later</p>
                    </Link>
                    {(user.role === "admin" || user.role === "seller") && (
                        <Link to="/admin" data-testid="profile-link-admin" className="block border border-neutral-200 p-4 hover:border-black transition-colors">
                            <p className="text-sm font-medium">Dashboard</p>
                            <p className="text-xs text-neutral-500 mt-1">Manage products & orders</p>
                        </Link>
                    )}
                </aside>
            </div>
        </div>
    );
}
