import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children, title, action }) {
    const { user } = useAuth();
    const isAdmin = user && user.role === "admin";

    const links = [
        { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/admin/products", label: "Products", icon: Package },
        { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
        ...(isAdmin ? [
            { to: "/admin/users", label: "Users", icon: Users },
            { to: "/admin/categories", label: "Categories", icon: Tag },
        ] : []),
    ];

    return (
        <div className="ez-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
                <aside data-testid="admin-sidebar">
                    <p className="ez-overline mb-4">{isAdmin ? "Admin" : "Seller"}</p>
                    <nav className="space-y-1">
                        {links.map(({ to, label, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                data-testid={`admin-nav-${label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-neutral-700 hover:bg-neutral-100"
                                    }`
                                }
                            >
                                <Icon size={16} strokeWidth={1.5} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <section>
                    <header className="flex items-end justify-between mb-10 pb-6 border-b border-neutral-200">
                        <div>
                            <p className="ez-overline mb-2">Dashboard</p>
                            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight font-medium">
                                {title}
                            </h1>
                        </div>
                        {action}
                    </header>
                    {children}
                </section>
            </div>
        </div>
    );
}
