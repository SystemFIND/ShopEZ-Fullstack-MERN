import React from "react";
import { Link } from "react-router-dom";
import { api, money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";
import { toast } from "sonner";

const STATUS_STYLES = {
    pending: "bg-neutral-100 text-neutral-900",
    processing: "bg-blue-50 text-blue-900",
    shipped: "bg-amber-50 text-amber-900",
    delivered: "bg-green-50 text-green-900",
    cancelled: "bg-red-50 text-red-900",
};

function fmtDate(d) {
    try {
        return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return d;
    }
}

export default function OrderHistory() {
    const [orders, setOrders] = React.useState(null);
    const [cancelling, setCancelling] = React.useState(null);

    const load = React.useCallback(() => {
        api.get("/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    async function cancelOrder(id) {
        if (!window.confirm("Cancel this order? Stock will be returned.")) return;
        setCancelling(id);
        try {
            await api.post(`/orders/${id}/cancel`);
            toast.success("Order cancelled");
            load();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Could not cancel");
        } finally {
            setCancelling(null);
        }
    }

    return (
        <div className="ez-container py-12" data-testid="orders-page">
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Your orders</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Order history
                </h1>
            </header>

            {orders === null ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-neutral-200 p-6">
                            <div className="h-4 w-32 ez-skel mb-3" />
                            <div className="h-6 w-48 ez-skel" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div data-testid="orders-empty" className="py-16 text-center border border-neutral-200">
                    <p className="ez-overline mb-3">Nothing yet</p>
                    <p className="text-sm text-neutral-600 mb-6">You haven't placed any orders yet.</p>
                    <Link to="/products" className="ez-btn-primary inline-flex">Start shopping</Link>
                </div>
            ) : (
                <div className="relative pl-6">
                    <div className="absolute left-[6px] top-2 bottom-2 w-px bg-neutral-200" />
                    <ul className="space-y-6">
                        {orders.map((o) => (
                            <li key={o.id} className="relative" data-testid={`order-${o.id}`}>
                                <span className="absolute -left-[22px] top-6 w-3 h-3 bg-black border-2 border-white" />
                                <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-neutral-500">
                                                Order placed {fmtDate(o.created_at)}
                                            </p>
                                            <p className="font-medium text-sm mt-1">#{o.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`ez-badge ${STATUS_STYLES[o.status] || ""}`}>{o.status}</span>
                                            <p className="text-sm font-medium">{money(o.total)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-center gap-3">
                                        {o.items.slice(0, 4).map((it) => (
                                            <img
                                                key={it.product_id}
                                                src={resolveImageUrl(it.image_url)}
                                                alt={it.name}
                                                className="w-16 aspect-[3/4] object-cover bg-neutral-100"
                                            />
                                        ))}
                                        {o.items.length > 4 && (
                                            <span className="text-xs text-neutral-500">+{o.items.length - 4} more</span>
                                        )}
                                    </div>
                                    <div className="mt-5 flex items-center gap-4">
                                        <Link
                                            to={`/order-confirmation/${o.id}`}
                                            data-testid={`order-view-${o.id}`}
                                            className="inline-block text-xs underline underline-offset-4"
                                        >
                                            View details
                                        </Link>
                                        {(o.status === "pending" || o.status === "processing") && (
                                            <button
                                                onClick={() => cancelOrder(o.id)}
                                                disabled={cancelling === o.id}
                                                data-testid={`order-cancel-${o.id}`}
                                                className="text-xs underline underline-offset-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                                {cancelling === o.id ? "Cancelling..." : "Cancel order"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
