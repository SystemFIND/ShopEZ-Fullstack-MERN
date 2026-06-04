import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";

export default function CartDrawer() {
    const { cart, drawerOpen, setDrawerOpen, updateQty, removeItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [drawerOpen]);

    if (!drawerOpen) return null;

    function handleCheckout() {
        setDrawerOpen(false);
        if (!user || user === false) {
            navigate("/login", { state: { from: "/checkout" } });
        } else {
            navigate("/checkout");
        }
    }

    return (
        <div className="fixed inset-0 z-50" data-testid="cart-drawer">
            <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close cart"
            />
            <aside className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white border-l border-neutral-200 flex flex-col shadow-sm">
                <header className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div>
                        <p className="ez-overline">Your bag</p>
                        <p className="text-sm text-neutral-500 mt-1">
                            {cart.total_items} {cart.total_items === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <button
                        data-testid="cart-drawer-close"
                        onClick={() => setDrawerOpen(false)}
                        className="p-2 hover:bg-neutral-100"
                        aria-label="Close"
                    >
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {cart.items.length === 0 ? (
                        <div className="p-8 text-center" data-testid="cart-empty">
                            <p className="ez-overline mb-3">Empty</p>
                            <p className="text-sm text-neutral-600 mb-6">
                                Your bag is waiting for something good.
                            </p>
                            <Link
                                to="/products"
                                onClick={() => setDrawerOpen(false)}
                                className="ez-btn-primary"
                                data-testid="cart-drawer-shop-btn"
                            >
                                Shop products
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-200">
                            {cart.items.map((it) => (
                                <li key={it.product_id} className="flex gap-4 p-6" data-testid={`cart-item-${it.product_id}`}>
                                    <Link
                                        to={`/products/${it.product_id}`}
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex-shrink-0"
                                    >
                                        <img
                                            src={resolveImageUrl(it.image_url)}
                                            alt={it.name}
                                            className="w-20 h-24 object-cover bg-neutral-100"
                                        />
                                    </Link>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                to={`/products/${it.product_id}`}
                                                onClick={() => setDrawerOpen(false)}
                                                className="text-sm font-medium leading-tight hover:underline"
                                            >
                                                {it.name}
                                            </Link>
                                            <button
                                                onClick={() => removeItem(it.product_id)}
                                                data-testid={`cart-item-remove-${it.product_id}`}
                                                className="p-1 text-neutral-500 hover:text-black"
                                                aria-label="Remove"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">{money(it.price)}</p>
                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <div className="inline-flex items-center border border-neutral-300">
                                                <button
                                                    onClick={() => updateQty(it.product_id, Math.max(1, it.quantity - 1))}
                                                    data-testid={`cart-item-dec-${it.product_id}`}
                                                    className="p-2 hover:bg-neutral-100"
                                                    aria-label="Decrease"
                                                >
                                                    <Minus size={12} strokeWidth={1.5} />
                                                </button>
                                                <span className="px-3 text-sm min-w-[2rem] text-center">{it.quantity}</span>
                                                <button
                                                    onClick={() => updateQty(it.product_id, it.quantity + 1)}
                                                    data-testid={`cart-item-inc-${it.product_id}`}
                                                    disabled={it.quantity >= it.stock}
                                                    className="p-2 hover:bg-neutral-100 disabled:opacity-30"
                                                    aria-label="Increase"
                                                >
                                                    <Plus size={12} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-medium">{money(it.subtotal)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cart.items.length > 0 && (
                    <footer className="border-t border-neutral-200 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="ez-overline">Subtotal</p>
                            <p className="font-medium" data-testid="cart-subtotal">{money(cart.subtotal)}</p>
                        </div>
                        <p className="text-xs text-neutral-500">Shipping calculated at checkout.</p>
                        <button
                            onClick={handleCheckout}
                            data-testid="cart-drawer-checkout-btn"
                            className="ez-btn-primary w-full"
                        >
                            Checkout
                        </button>
                        <Link
                            to="/cart"
                            onClick={() => setDrawerOpen(false)}
                            data-testid="cart-drawer-view-cart"
                            className="block text-center text-xs underline text-neutral-600 hover:text-black"
                        >
                            View full cart
                        </Link>
                    </footer>
                )}
            </aside>
        </div>
    );
}
