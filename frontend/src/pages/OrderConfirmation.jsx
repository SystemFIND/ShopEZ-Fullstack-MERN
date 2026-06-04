import React from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Package, Truck } from "lucide-react";
import { api, money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";
import { toast } from "sonner";

const PAYMENT_LABELS = {
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    e_wallet: "E-Wallet",
};

function fmtDate(d) {
    try {
        return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    } catch {
        return d;
    }
}

export default function OrderConfirmation() {
    const { id } = useParams();
    const [order, setOrder] = React.useState(null);
    const [notFound, setNotFound] = React.useState(false);
    const [cancelling, setCancelling] = React.useState(false);

    const load = React.useCallback(() => {
        api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => setNotFound(true));
    }, [id]);

    React.useEffect(() => {
        load();
    }, [load]);

    async function cancelOrder() {
        if (!window.confirm("Cancel this order? Stock will be returned.")) return;
        setCancelling(true);
        try {
            await api.post(`/orders/${id}/cancel`);
            toast.success("Order cancelled");
            load();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Could not cancel");
        } finally {
            setCancelling(false);
        }
    }

    if (notFound) {
        return (
            <div className="ez-container py-24 text-center" data-testid="order-not-found">
                <h1 className="font-heading text-3xl">Order not found</h1>
                <Link to="/orders" className="ez-btn-secondary mt-8 inline-flex">My orders</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="ez-container py-12">
                <div className="h-8 w-48 ez-skel mb-3" />
                <div className="h-4 w-64 ez-skel" />
            </div>
        );
    }

    return (
        <div className="ez-container py-12 md:py-16" data-testid="order-confirmation-page">
            <div className="max-w-3xl">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-6">
                    <Check size={20} strokeWidth={1.5} />
                </div>
                <p className="ez-overline mb-3">Thank you</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Order confirmed
                </h1>
                <p className="mt-4 text-sm text-neutral-600">
                    We've received your order. A confirmation email is on its way.
                </p>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-neutral-200 p-5">
                        <p className="ez-overline mb-2">Order #</p>
                        <p className="font-mono text-sm" data-testid="order-conf-id">{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="border border-neutral-200 p-5">
                        <p className="ez-overline mb-2">Placed</p>
                        <p className="text-sm">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="border border-neutral-200 p-5">
                        <p className="ez-overline mb-2">Status</p>
                        <p className="text-sm capitalize" data-testid="order-conf-status">{order.status}</p>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-neutral-200 p-6">
                        <p className="ez-overline mb-3">Shipping to</p>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            {order.address.full_name}<br />
                            {order.address.line1}<br />
                            {order.address.city}, {order.address.state} {order.address.postal_code}<br />
                            {order.address.country}<br />
                            {order.address.phone}
                        </p>
                    </div>
                    <div className="border border-neutral-200 p-6">
                        <p className="ez-overline mb-3">Payment</p>
                        <p className="text-sm text-neutral-700" data-testid="order-conf-payment">
                            {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                        </p>
                        {order.notes && (
                            <>
                                <p className="ez-overline mt-5 mb-2">Notes</p>
                                <p className="text-xs text-neutral-600">{order.notes}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-12">
                    <p className="ez-overline mb-4">Your items</p>
                    <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                        {order.items.map((it) => (
                            <li key={it.product_id} className="flex gap-4 py-4">
                                <img src={resolveImageUrl(it.image_url)} alt={it.name} className="w-16 aspect-[3/4] object-cover bg-neutral-100" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{it.name}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Qty {it.quantity} · {money(it.price)}</p>
                                </div>
                                <p className="text-sm font-medium">{money(it.subtotal)}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-8 space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span><span>{money(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                        <span>Shipping</span><span>{money(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-3 border-t border-neutral-200">
                        <span>Total</span><span data-testid="order-conf-total">{money(order.total)}</span>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-3">
                    <Link to="/products" className="ez-btn-primary">Continue shopping</Link>
                    <Link to="/orders" data-testid="order-conf-to-orders" className="ez-btn-secondary">View all orders</Link>
                    {(order.status === "pending" || order.status === "processing") && (
                        <button
                            onClick={cancelOrder}
                            disabled={cancelling}
                            data-testid="order-conf-cancel"
                            className="ez-btn-ghost text-red-600 hover:text-red-800"
                        >
                            {cancelling ? "Cancelling..." : "Cancel order"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
