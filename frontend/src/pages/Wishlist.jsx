import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

export default function Wishlist() {
    const { items, ids, refresh } = useWishlist();

    React.useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loading = ids.length > 0 && items.length === 0;

    return (
        <div className="ez-container py-12" data-testid="wishlist-page">
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Saved for later</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Your wishlist
                </h1>
                <p className="mt-3 text-sm text-neutral-600">
                    {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
            </header>

            {ids.length === 0 ? (
                <div data-testid="wishlist-empty" className="py-16 text-center border border-neutral-200">
                    <p className="ez-overline mb-3">Empty</p>
                    <p className="text-sm text-neutral-600 mb-6">
                        Tap the heart on any product to save it for later.
                    </p>
                    <Link to="/products" className="ez-btn-primary inline-flex">Browse products</Link>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12">
                    {Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12">
                    {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
            )}
        </div>
    );
}
