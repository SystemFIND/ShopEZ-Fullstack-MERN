import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LayoutDashboard, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart, setDrawerOpen } = useCart();
    const { ids: wishlistIds } = useWishlist();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [accountOpen, setAccountOpen] = React.useState(false);
    const accountRef = React.useRef(null);
    const location = useLocation();

    React.useEffect(() => {
        function onClick(e) {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    React.useEffect(() => {
        setMobileOpen(false);
        setAccountOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { label: "Shop", to: "/products" },
        { label: "New In", to: "/products?sort=newest" },
        { label: "Best Sellers", to: "/products?sort=popular" },
    ];

    return (
        <header
            data-testid="navbar"
            className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200"
        >
            <div className="ez-container">
                <div className="flex h-16 items-center justify-between gap-6">
                    {/* Left: mobile menu + logo */}
                    <div className="flex items-center gap-3">
                        <button
                            data-testid="nav-mobile-toggle"
                            className="md:hidden p-2 -ml-2"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                        </button>
                        <Link
                            to="/"
                            data-testid="nav-logo"
                            className="font-heading text-xl sm:text-2xl font-semibold tracking-tight"
                        >
                            ShopEZ
                        </Link>
                    </div>

                    {/* Center nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((l) => (
                            <Link
                                key={l.label}
                                to={l.to}
                                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                                className="text-sm tracking-wide text-neutral-700 hover:text-black transition-colors"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            data-testid="nav-search-btn"
                            onClick={() => navigate("/products")}
                            className="p-2 hover:bg-neutral-100 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={18} strokeWidth={1.5} />
                        </button>

                        {user && user !== false && (
                            <Link
                                to="/wishlist"
                                data-testid="nav-wishlist-btn"
                                className="relative p-2 hover:bg-neutral-100 transition-colors hidden sm:inline-flex"
                                aria-label="Wishlist"
                            >
                                <Heart size={18} strokeWidth={1.5} />
                                {wishlistIds.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                                        {wishlistIds.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user && user !== false ? (
                            <div className="relative" ref={accountRef}>
                                <button
                                    data-testid="nav-account-btn"
                                    onClick={() => setAccountOpen((v) => !v)}
                                    className="p-2 hover:bg-neutral-100 transition-colors"
                                    aria-label="Account"
                                >
                                    <User size={18} strokeWidth={1.5} />
                                </button>
                                {accountOpen && (
                                    <div
                                        data-testid="nav-account-menu"
                                        className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 shadow-sm"
                                    >
                                        <div className="p-4 border-b border-neutral-200">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                            <span className="ez-badge mt-2">{user.role}</span>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" data-testid="nav-link-profile" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                                                Profile
                                            </Link>
                                            <Link to="/orders" data-testid="nav-link-orders" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                                                Orders
                                            </Link>
                                            <Link to="/wishlist" data-testid="nav-link-wishlist" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                                                Wishlist {wishlistIds.length > 0 && <span className="text-neutral-500">({wishlistIds.length})</span>}
                                            </Link>
                                            {(user.role === "admin" || user.role === "seller") && (
                                                <Link
                                                    to="/admin"
                                                    data-testid="nav-link-admin"
                                                    className="block px-4 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2"
                                                >
                                                    <LayoutDashboard size={14} strokeWidth={1.5} /> Dashboard
                                                </Link>
                                            )}
                                            <button
                                                data-testid="nav-logout-btn"
                                                onClick={() => {
                                                    logout();
                                                    navigate("/");
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                data-testid="nav-login-btn"
                                className="hidden sm:inline-flex items-center px-3 py-2 text-sm hover:bg-neutral-100"
                            >
                                Sign in
                            </Link>
                        )}

                        <button
                            data-testid="nav-cart-btn"
                            onClick={() => setDrawerOpen(true)}
                            className="relative p-2 hover:bg-neutral-100 transition-colors"
                            aria-label="Cart"
                        >
                            <ShoppingBag size={18} strokeWidth={1.5} />
                            {cart.total_items > 0 && (
                                <span
                                    data-testid="nav-cart-count"
                                    className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center"
                                >
                                    {cart.total_items}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div data-testid="nav-mobile-menu" className="md:hidden py-4 border-t border-neutral-200">
                        {navLinks.map((l) => (
                            <Link
                                key={l.label}
                                to={l.to}
                                className="block py-2 text-sm"
                            >
                                {l.label}
                            </Link>
                        ))}
                        {!user || user === false ? (
                            <Link to="/login" className="block py-2 text-sm">
                                Sign in
                            </Link>
                        ) : null}
                    </div>
                )}
            </div>
        </header>
    );
}
