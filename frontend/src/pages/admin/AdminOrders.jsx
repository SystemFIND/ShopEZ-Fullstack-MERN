import React from "react";
import { api, money } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function fmtDate(d) {
    try {
        return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    } catch {
        return d;
    }
}

export default function AdminOrders() {
    const [orders, setOrders] = React.useState(null);
    const [filter, setFilter] = React.useState("all");
    const [expanded, setExpanded] = React.useState(null);

    React.useEffect(() => {
        load();
    }, []);

    function load() {
        api.get("/admin/orders").then(({ data }) => setOrders(data));
    }

    async function updateStatus(id, status) {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            toast.success("Status updated");
            load();
        } catch {
            toast.error("Failed to update");
        }
    }

    const filtered = (orders || []).filter((o) => filter === "all" || o.status === filter);

    return (
        <AdminLayout title="Orders">
            <div className="mb-6 flex flex-wrap items-center gap-2">
                {["all", ...STATUSES].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        data-testid={`admin-orders-filter-${s}`}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
                            filter === s ? "bg-black text-white border-black" : "border-neutral-300 hover:border-black"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {orders === null ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 ez-skel" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center border border-neutral-200">
                    <p className="text-sm text-neutral-600">No orders match this filter.</p>
                </div>
            ) : (
                <div className="border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr className="text-left">
                                <th className="px-4 py-3 ez-overline">Order</th>
                                <th className="px-4 py-3 ez-overline">Customer</th>
                                <th className="px-4 py-3 ez-overline">Date</th>
                                <th className="px-4 py-3 ez-overline">Payment</th>
                                <th className="px-4 py-3 ez-overline">Total</th>
                                <th className="px-4 py-3 ez-overline">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o) => (
                                <React.Fragment key={o.id}>
                                    <tr
                                        className="border-b border-neutral-100 last:border-0 cursor-pointer hover:bg-neutral-50"
                                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                                        data-testid={`admin-order-row-${o.id}`}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{o.user_name}</p>
                                            <p className="text-xs text-neutral-500">{o.user_email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                                        <td className="px-4 py-3 text-xs uppercase">{o.payment_method.replace("_", " ")}</td>
                                        <td className="px-4 py-3 font-medium">{money(o.total)}</td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                data-testid={`admin-order-status-${o.id}`}
                                                value={o.status}
                                                onChange={(e) => updateStatus(o.id, e.target.value)}
                                                className="ez-input py-1 px-2 text-xs"
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    {expanded === o.id && (
                                        <tr className="bg-neutral-50">
                                            <td colSpan={6} className="px-4 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="ez-overline mb-2">Items</p>
                                                        <ul className="space-y-2">
                                                            {o.items.map((it) => (
                                                                <li key={it.product_id} className="flex justify-between gap-3 text-xs">
                                                                    <span>{it.name} × {it.quantity}</span>
                                                                    <span className="text-neutral-500">{money(it.subtotal)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p className="ez-overline mb-2">Shipping address</p>
                                                        <p className="text-xs text-neutral-600 leading-relaxed">
                                                            {o.address.full_name}<br />
                                                            {o.address.line1}<br />
                                                            {o.address.city}, {o.address.state} {o.address.postal_code}<br />
                                                            {o.address.country}<br />
                                                            {o.address.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
