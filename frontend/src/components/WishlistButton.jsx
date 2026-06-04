import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ productId, className = "" }) {
    const { has, toggle, loading } = useWishlist();
    const saved = has(productId);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(productId);
            }}
            disabled={loading}
            data-testid={`wishlist-toggle-${productId}`}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className={`inline-flex items-center justify-center w-9 h-9 bg-white/90 backdrop-blur hover:bg-white border border-neutral-200 transition-colors ${className}`}
        >
            <Heart
                size={16}
                strokeWidth={1.5}
                className={saved ? "fill-black text-black" : "text-neutral-600"}
            />
        </button>
    );
}
