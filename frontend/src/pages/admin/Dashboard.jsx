import React from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { api, money } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";

function StatCard({ icon: Icon, label, value, testid }) {
    return (
        <div data-testid={testid} className="ez-card">
            <div className="flex items-center justify-between">
                <p className="ez-overline">{label}</p>
                <Icon size={18} strokeWidth={1.5} className="text-neutral-400" />
            </div>
            <p className="mt-4 font-heading text-3xl tracking-tight font-medium">{value}</p>
        </div>
    );
}

function fmtDate(d) {
    try {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return d;
    }
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = React.useState(null);
    const [recent, setRecent] = React.useState([]);

    React.useEffect(() => {
        api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => setStats({}));
        api.get("/admin/orders").then(({ data }) => setRecent(data.slice(0, 5))).catch(() => setRecent([]));
    }, []);

    return (
        <AdminLayout title={`Welcome, ${user?.name?.split(" ")[0] || "back"}`}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats === null ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="ez-card">
                            <div className="h-3 w-20 ez-skel mb-4" />
                            <div className="h-8 w-24 ez-skel" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard icon={DollarSign} testid="stat-revenue" label="Revenue" value={money(stats.revenue || 0)} />
                        <StatCard icon={ShoppingBag} testid="stat-orders" label="Orders" value={stats.total_orders || 0} />
                        <StatCard icon={Package} testid="stat-products" label="Products" value={stats.total_products || 0} />
                        <StatCard icon={Users} testid="stat-customers" label="Customers" value={stats.total_customers || 0} />
                        <StatCard icon={TrendingUp} testid="stat-recent" label="Last 7 days" value={stats.recent_orders || 0} />
                        <StatCard icon={AlertCircle} testid="stat-lowstock" label="Low stock" value={stats.low_stock || 0} />
                    </>
                )}
            </div>

            <section className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <p className="ez-overline">Recent orders</p>
                    <Link to="/admin/orders" className="text-xs underline">View all</Link>
                </div>
                {recent.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-12 text-center border border-neutral-200">No orders yet.</p>
                ) : (
                    <div className="border border-neutral-200">
                        <table className="w-full text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50">
                                <tr className="text-left">
                                    <th className="px-4 py-3 ez-overline">Order</th>
                                    <th className="px-4 py-3 ez-overline">Customer</th>
                                    <th className="px-4 py-3 ez-overline">Date</th>
                                    <th className="px-4 py-3 ez-overline">Status</th>
                                    <th className="px-4 py-3 ez-overline text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((o) => (
                                    <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-4 py-4 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                                        <td className="px-4 py-4">{o.user_name || o.user_email}</td>
                                        <td className="px-4 py-4 text-neutral-500">{fmtDate(o.created_at)}</td>
                                        <td className="px-4 py-4"><span className="ez-badge capitalize">{o.status}</span></td>
                                        <td className="px-4 py-4 text-right font-medium">{money(o.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
