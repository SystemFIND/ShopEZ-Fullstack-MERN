import React from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus, Truck, RotateCcw, ShieldCheck, ChevronLeft, Heart } from "lucide-react";
import { api, money } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import Reviews, { StarRating } from "@/components/Reviews";
import { resolveImageUrl } from "@/components/ImageUploader";

export default function ProductDetail() {
    const { id } = useParams();
    const { addItem, loading: cartLoading } = useCart();
    const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
    const [product, setProduct] = React.useState(null);
    const [related, setRelated] = React.useState([]);
    const [quantity, setQuantity] = React.useState(1);
    const [activeImage, setActiveImage] = React.useState(0);
    const [notFound, setNotFound] = React.useState(false);

    React.useEffect(() => {
        setProduct(null);
        setActiveImage(0);
        setQuantity(1);
        setNotFound(false);
        api
            .get(`/products/${id}`)
            .then(({ data }) => {
                setProduct(data);
                if (data.category_id) {
                    api
                        .get("/products", { params: { category_id: data.category_id, limit: 8 } })
                        .then(({ data: items }) => setRelated(items.filter((p) => p.id !== data.id).slice(0, 4)))
                        .catch(() => {});
                }
            })
            .catch(() => setNotFound(true));
    }, [id]);

    if (notFound) {
        return (
            <div className="ez-container py-24 text-center" data-testid="product-not-found">
                <p className="ez-overline mb-3">404</p>
                <h1 className="font-heading text-3xl">Product not found</h1>
                <Link to="/products" className="ez-btn-secondary mt-8 inline-flex">Back to shop</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="ez-container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="aspect-[3/4] w-full ez-skel" />
                    <div className="space-y-4">
                        <div className="h-3 w-24 ez-skel" />
                        <div className="h-8 w-2/3 ez-skel" />
                        <div className="h-6 w-24 ez-skel" />
                        <div className="h-4 w-full ez-skel" />
                        <div className="h-4 w-5/6 ez-skel" />
                    </div>
                </div>
            </div>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image_url];

    async function handleAdd() {
        const ok = await addItem(product.id, quantity, { openDrawer: true });
        if (ok) setQuantity(1);
    }

    return (
        <div data-testid="product-detail-page">
            <div className="ez-container py-8 md:py-12">
                <Link to="/products" data-testid="back-to-products" className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-black mb-8">
                    <ChevronLeft size={14} strokeWidth={1.5} /> Back to shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                    {/* Gallery */}
                    <div>
                        <div className="aspect-[3/4] w-full bg-neutral-100 overflow-hidden mb-3">
                            <img
                                src={resolveImageUrl(images[activeImage])}
                                alt={product.name}
                                className="w-full h-full object-cover ez-fade-in"
                                key={activeImage}
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-3" data-testid="product-thumbs">
                                {images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        data-testid={`product-thumb-${idx}`}
                                        className={`w-20 aspect-[3/4] overflow-hidden border ${
                                            idx === activeImage ? "border-black" : "border-transparent"
                                        }`}
                                    >
                                        <img src={resolveImageUrl(src)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="lg:py-4">
                        {product.category_name && (
                            <p className="ez-overline mb-3" data-testid="product-category">{product.category_name}</p>
                        )}
                        <h1 className="font-heading text-3xl md:text-4xl tracking-tight font-medium" data-testid="product-name">
                            {product.name}
                        </h1>
                        {product.rating > 0 && (
                            <div className="mt-3 flex items-center gap-2" data-testid="product-rating">
                                <StarRating value={product.rating} size={14} />
                                <span className="text-xs text-neutral-500">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                        <p className="mt-4 text-2xl font-medium" data-testid="product-price">{money(product.price)}</p>
                        {product.brand && <p className="text-xs text-neutral-500 mt-1">By {product.brand}</p>}

                        <div className="ez-divider my-8" />

                        <p className="text-sm text-neutral-700 leading-relaxed" data-testid="product-description">
                            {product.description}
                        </p>

                        <div className="mt-8 space-y-5">
                            <div>
                                <p className="ez-label">Quantity</p>
                                <div className="inline-flex items-center border border-neutral-300">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        data-testid="product-qty-dec"
                                        className="p-3 hover:bg-neutral-100"
                                        aria-label="Decrease"
                                    >
                                        <Minus size={14} strokeWidth={1.5} />
                                    </button>
                                    <span className="px-4 text-sm min-w-[3rem] text-center" data-testid="product-qty-value">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        data-testid="product-qty-inc"
                                        disabled={quantity >= product.stock}
                                        className="p-3 hover:bg-neutral-100 disabled:opacity-30"
                                        aria-label="Increase"
                                    >
                                        <Plus size={14} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2" data-testid="product-stock">
                                    {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAdd}
                                    disabled={product.stock === 0 || cartLoading}
                                    data-testid="product-add-to-cart"
                                    className="ez-btn-primary flex-1 sm:flex-none sm:px-12"
                                >
                                    {product.stock === 0 ? "Sold out" : "Add to bag"}
                                </button>
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    data-testid="product-wishlist-btn"
                                    className="p-3 border border-neutral-300 hover:border-black transition-colors"
                                    aria-label="Save to wishlist"
                                >
                                    <Heart
                                        size={18}
                                        strokeWidth={1.5}
                                        className={inWishlist(product.id) ? "fill-black text-black" : "text-neutral-700"}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="ez-divider my-8" />

                        <ul className="space-y-3 text-sm text-neutral-600">
                            <li className="flex items-start gap-3">
                                <Truck size={16} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                                Free shipping on orders over $75
                            </li>
                            <li className="flex items-start gap-3">
                                <RotateCcw size={16} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                                30-day returns, no questions asked
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck size={16} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                                Secure checkout
                            </li>
                        </ul>

                        <Reviews productId={product.id} />
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section className="ez-container pt-20 pb-24">
                    <h2 className="font-heading text-2xl md:text-3xl tracking-tight font-medium mb-10">
                        You may also like
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12">
                        {related.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
