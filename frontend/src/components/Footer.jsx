import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer data-testid="footer" className="border-t border-neutral-200 mt-24">
            <div className="ez-container py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <h3 className="font-heading text-2xl tracking-tight">ShopEZ</h3>
                        <p className="mt-3 text-sm text-neutral-600 max-w-sm">
                            Modern essentials, thoughtfully designed and considered.
                            Built for the every day, made to last.
                        </p>
                    </div>
                    <div>
                        <p className="ez-overline mb-4">Shop</p>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li><Link to="/products" className="hover:text-black">All Products</Link></li>
                            <li><Link to="/products?sort=newest" className="hover:text-black">New In</Link></li>
                            <li><Link to="/products?sort=popular" className="hover:text-black">Best Sellers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="ez-overline mb-4">Account</p>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li><Link to="/login" className="hover:text-black">Sign in</Link></li>
                            <li><Link to="/register" className="hover:text-black">Create account</Link></li>
                            <li><Link to="/orders" className="hover:text-black">Orders</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-xs text-neutral-500">
                        © {new Date().getFullYear()} ShopEZ. A student project.
                    </p>
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                        Designed with care.
                    </p>
                </div>
            </div>
        </footer>
    );
}
