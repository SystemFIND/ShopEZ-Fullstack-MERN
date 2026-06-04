import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

export default function Home() {
    const [featured, setFeatured] = React.useState(null);
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        api.get("/products/featured").then(({ data }) => setFeatured(data)).catch(() => setFeatured([]));
        api.get("/categories").then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    }, []);

    return (
        <div data-testid="home-page">
            {/* Hero - split layout, image right, text left */}
            <section className="ez-container pt-12 md:pt-20 pb-16 md:pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="ez-fade-in">
                        <p className="ez-overline mb-6">Spring Collection 2026</p>
                        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[0.95] font-medium tracking-tight">
                            Modern essentials.
                            <br />
                            <span className="text-neutral-400">Considered design.</span>
                        </h1>
                        <p className="mt-8 text-base text-neutral-600 max-w-md leading-relaxed">
                            Thoughtfully made pieces for the every day. Honest pricing,
                            transparent sourcing, and quality that lasts beyond a season.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-3">
                            <Link to="/products" data-testid="home-hero-shop-btn" className="ez-btn-primary group">
                                Shop the collection
                                <ArrowRight size={16} strokeWidth={1.5} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/products?sort=newest" data-testid="home-hero-new-btn" className="ez-btn-secondary">
                                New arrivals
                            </Link>
                        </div>
                    </div>
                    <div className="ez-fade-in" style={{ animationDelay: "120ms" }}>
                        <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                            <img
                                src="https://images.pexels.com/photos/7871182/pexels-photo-7871182.jpeg"
                                alt="ShopEZ Spring Collection"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Value props */}
            <section className="border-y border-neutral-200 bg-neutral-50">
                <div className="ez-container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { icon: Sparkles, t: "Thoughtfully Made", d: "Crafted with care, designed to last." },
                            { icon: Truck, t: "Free Shipping over $75", d: "Fast, carbon-neutral delivery." },
                            { icon: ShieldCheck, t: "30-Day Returns", d: "If it doesn't feel right, send it back." },
                        ].map(({ icon: Icon, t, d }) => (
                            <div key={t} className="flex items-start gap-4">
                                <Icon size={22} strokeWidth={1.5} className="mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-heading text-base font-medium">{t}</p>
                                    <p className="text-sm text-neutral-600 mt-1">{d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="ez-container py-20 md:py-24">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="ez-overline mb-3">Browse</p>
                            <h2 className="font-heading text-3xl md:text-4xl tracking-tight font-medium">
                                Shop by category
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                        {categories.map((c) => (
                            <Link
                                key={c.id}
                                to={`/products?category=${c.id}`}
                                data-testid={`home-category-${c.slug}`}
                                className="group block aspect-square bg-neutral-100 relative overflow-hidden"
                            >
                                {c.image_url && (
                                    <img
                                        src={c.image_url}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 flex items-end p-5 bg-gradient-to-t from-black/10 to-transparent">
                                    <h3 className="font-heading text-lg font-medium tracking-tight">{c.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured products */}
            <section className="ez-container pb-24">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="ez-overline mb-3">This Week</p>
                        <h2 className="font-heading text-3xl md:text-4xl tracking-tight font-medium">
                            Most loved
                        </h2>
                    </div>
                    <Link to="/products" data-testid="home-view-all" className="hidden sm:inline-flex items-center gap-1 text-sm hover:underline">
                        View all <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
                    {featured === null
                        ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)
                        : featured.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
            </section>
        </div>
    );
}