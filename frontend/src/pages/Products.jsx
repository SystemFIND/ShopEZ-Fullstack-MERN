import React from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

const SORTS = [
    { id: "newest", label: "Newest" },
    { id: "popular", label: "Popularity" },
    { id: "price_asc", label: "Price: Low to High" },
    { id: "price_desc", label: "Price: High to Low" },
];

const PAGE_SIZE = 9;

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = React.useState(null);
    const [total, setTotal] = React.useState(0);
    const [categories, setCategories] = React.useState([]);
    const [searchInput, setSearchInput] = React.useState(searchParams.get("search") || "");

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("min_price") || "";
    const maxPrice = searchParams.get("max_price") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    React.useEffect(() => {
        api.get("/categories").then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    }, []);

    React.useEffect(() => {
        setProducts(null);
        const params = { page, page_size: PAGE_SIZE };
        if (search) params.search = search;
        if (category) params.category_id = category;
        if (sort) params.sort = sort;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        Promise.all([
            api.get("/products", { params }),
            api.get("/products/count", { params: {
                ...(search ? { search } : {}),
                ...(category ? { category_id: category } : {}),
                ...(minPrice ? { min_price: minPrice } : {}),
                ...(maxPrice ? { max_price: maxPrice } : {}),
            }}),
        ])
            .then(([list, count]) => {
                setProducts(list.data);
                setTotal(count.data.total || 0);
            })
            .catch(() => {
                setProducts([]);
                setTotal(0);
            });
    }, [search, category, sort, minPrice, maxPrice, page]);

    function updateParam(key, value, resetPage = true) {
        const next = new URLSearchParams(searchParams);
        if (!value) next.delete(key);
        else next.set(key, value);
        if (resetPage) next.delete("page");
        setSearchParams(next);
        if (resetPage) window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setPage(p) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(p));
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        updateParam("search", searchInput.trim());
    }

    function clearFilters() {
        setSearchInput("");
        setSearchParams({});
    }

    const activeCount = [search, category, minPrice, maxPrice].filter(Boolean).length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="ez-container py-12 md:py-16" data-testid="products-page">
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Catalog</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Shop everything
                </h1>
                <p className="mt-3 text-sm text-neutral-600 max-w-xl">
                    Browse our full collection. Use filters to narrow down by category, price, or popularity.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 md:gap-12">
                <aside className="space-y-8" data-testid="products-sidebar">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <label className="ez-label">Search</label>
                        <div className="relative">
                            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                data-testid="products-search-input"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search products..."
                                className="ez-input pl-9"
                            />
                        </div>
                    </form>

                    <div>
                        <p className="ez-label">Category</p>
                        <div className="space-y-1.5">
                            <button
                                data-testid="filter-category-all"
                                onClick={() => updateParam("category", "")}
                                className={`block w-full text-left text-sm py-1 transition-colors ${
                                    !category ? "font-medium underline underline-offset-4" : "text-neutral-600 hover:text-black"
                                }`}
                            >
                                All
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    data-testid={`filter-category-${c.slug}`}
                                    onClick={() => updateParam("category", c.id)}
                                    className={`block w-full text-left text-sm py-1 transition-colors ${
                                        category === c.id
                                            ? "font-medium underline underline-offset-4"
                                            : "text-neutral-600 hover:text-black"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="ez-label">Price range</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                data-testid="filter-min-price"
                                placeholder="Min"
                                defaultValue={minPrice}
                                onBlur={(e) => updateParam("min_price", e.target.value)}
                                className="ez-input"
                            />
                            <span className="text-neutral-400">—</span>
                            <input
                                type="number"
                                data-testid="filter-max-price"
                                placeholder="Max"
                                defaultValue={maxPrice}
                                onBlur={(e) => updateParam("max_price", e.target.value)}
                                className="ez-input"
                            />
                        </div>
                    </div>

                    {activeCount > 0 && (
                        <button
                            onClick={clearFilters}
                            data-testid="filter-clear"
                            className="text-xs underline underline-offset-4 text-neutral-600 hover:text-black"
                        >
                            Clear all filters ({activeCount})
                        </button>
                    )}
                </aside>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-neutral-600" data-testid="products-count">
                            {products === null ? "Loading..." : `${total} ${total === 1 ? "item" : "items"}`}
                        </p>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-neutral-500 hidden sm:inline">Sort</label>
                            <select
                                data-testid="products-sort"
                                value={sort}
                                onChange={(e) => updateParam("sort", e.target.value)}
                                className="ez-input py-2 px-3 text-sm w-auto"
                            >
                                {SORTS.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {products === null ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ProductCardSkeleton key={i} index={i} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div data-testid="products-empty" className="py-24 text-center border border-neutral-200">
                            <p className="ez-overline mb-3">Nothing found</p>
                            <p className="text-sm text-neutral-600 mb-6">
                                Try adjusting your search or filters.
                            </p>
                            <button onClick={clearFilters} className="ez-btn-secondary">
                                Reset filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
                                {products.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <nav data-testid="products-pagination" className="mt-16 flex items-center justify-between gap-3 border-t border-neutral-200 pt-8">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page <= 1}
                                        data-testid="pagination-prev"
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={14} strokeWidth={1.5} />
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                data-testid={`pagination-page-${p}`}
                                                className={`w-9 h-9 text-sm transition-colors ${
                                                    p === page ? "bg-black text-white" : "hover:bg-neutral-100"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= totalPages}
                                        data-testid="pagination-next"
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight size={14} strokeWidth={1.5} />
                                    </button>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
