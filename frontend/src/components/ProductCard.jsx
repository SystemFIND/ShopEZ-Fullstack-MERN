import React from "react";
import { Link } from "react-router-dom";
import { money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";
import WishlistButton from "@/components/WishlistButton";
import { StarRating } from "@/components/Reviews";

export default function ProductCard({ product, index = 0 }) {
    return (
        <Link
            to={`/products/${product.id}`}
            data-testid={`product-card-${product.id}`}
            className="ez-product-card group block ez-fade-in"
            style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 mb-4">
                {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 ez-badge z-10">Low stock</span>
                )}
                {product.stock === 0 && (
                    <span className="absolute top-3 left-3 ez-badge bg-black text-white z-10">Sold out</span>
                )}
                <WishlistButton productId={product.id} className="absolute top-3 right-3 z-10" />
                <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    loading="lazy"
                    className="ez-product-image w-full h-full object-cover"
                />
            </div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    {product.category_name && (
                        <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 mb-1">
                            {product.category_name}
                        </p>
                    )}
                    <h3 className="font-heading text-base sm:text-lg font-medium leading-tight">
                        {product.name}
                    </h3>
                    {product.rating > 0 && (
                        <div className="mt-2"><StarRating value={product.rating} size={12} /></div>
                    )}
                </div>
                <p className="text-sm font-medium whitespace-nowrap">{money(product.price)}</p>
            </div>
        </Link>
    );
}

export function ProductCardSkeleton({ index = 0 }) {
    return (
        <div className="ez-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="aspect-[3/4] w-full ez-skel mb-4" />
            <div className="h-3 w-20 ez-skel mb-2" />
            <div className="h-4 w-3/4 ez-skel" />
        </div>
    );
}
