import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";

export default function CartPage() {
    const { cart, updateQty, removeItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const shipping = cart.subtotal > 0 ? 5.0 : 0;
    const total = cart.subtotal + shipping;

    function handleCheckout() {
        if (!user || user === false) {
            navigate("/login", { state: { from: "/checkout" } });
        } else {
            navigate("/checkout");
        }
    }

    if (cart.items.length === 0) {
        return (
            <div className="ez-container py-24 text-center" data-testid="cart-page-empty">
                <p className="ez-overline mb-3">Your bag</p>
                <h1 className="font-heading text-4xl tracking-tight font-medium mb-3">Nothing here yet</h1>
                <p className="text-sm text-neutral-600 mb-10 max-w-md mx-auto">
                    Once you find something you love, it'll appear here.
                </p>
                <Link to="/products" className="ez-btn-primary inline-flex">
                    Start shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="ez-container py-12" data-testid="cart-page">
            <Link to="/products" className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-black mb-6">
                <ChevronLeft size={14} strokeWidth={1.5} /> Continue shopping
            </Link>
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Your bag</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    {cart.total_items} {cart.total_items === 1 ? "item" : "items"}
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
                <ul className="divide-y divide-neutral-200">
                    {cart.items.map((it) => (
                        <li key={it.product_id} className="flex gap-4 sm:gap-6 py-6" data-testid={`cart-page-item-${it.product_id}`}>
                            <Link to={`/products/${it.product_id}`} className="flex-shrink-0">
                                <img src={resolveImageUrl(it.image_url)} alt={it.name} className="w-24 sm:w-32 aspect-[3/4] object-cover bg-neutral-100" />
                            </Link>
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Link to={`/products/${it.product_id}`} className="font-heading text-lg font-medium leading-tight hover:underline">
                                            {it.name}
                                        </Link>
                                        <p className="text-sm text-neutral-500 mt-1">{money(it.price)}</p>
                                    </div>
                                    <p className="text-sm font-medium whitespace-nowrap">{money(it.subtotal)}</p>
                                </div>
                                <div className="mt-auto flex items-center justify-between pt-6">
                                    <div className="inline-flex items-center border border-neutral-300">
                                        <button
                                            onClick={() => updateQty(it.product_id, Math.max(1, it.quantity - 1))}
                                            data-testid={`cart-page-dec-${it.product_id}`}
                                            className="p-2 hover:bg-neutral-100"
                                        >
                                            <Minus size={12} strokeWidth={1.5} />
                                        </button>
                                        <span className="px-4 text-sm min-w-[2.5rem] text-center">{it.quantity}</span>
                                        <button
                                            onClick={() => updateQty(it.product_id, it.quantity + 1)}
                                            disabled={it.quantity >= it.stock}
                                            data-testid={`cart-page-inc-${it.product_id}`}
                                            className="p-2 hover:bg-neutral-100 disabled:opacity-30"
                                        >
                                            <Plus size={12} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(it.product_id)}
                                        data-testid={`cart-page-remove-${it.product_id}`}
                                        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black"
                                    >
                                        <Trash2 size={12} strokeWidth={1.5} /> Remove
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <aside className="lg:sticky lg:top-24 self-start border border-neutral-200 p-6 space-y-4 h-fit">
                    <p className="ez-overline">Summary</p>
                    <div className="ez-divider" />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Subtotal</span>
                        <span data-testid="cart-page-subtotal">{money(cart.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Shipping</span>
                        <span>{money(shipping)}</span>
                    </div>
                    <div className="ez-divider" />
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-medium text-lg" data-testid="cart-page-total">{money(total)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        data-testid="cart-page-checkout-btn"
                        className="ez-btn-primary w-full"
                    >
                        Checkout
                    </button>
                    <p className="text-xs text-neutral-500 text-center">
                        Shipping & taxes calculated at next step
                    </p>
                </aside>
            </div>
        </div>
    );
}
