import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DEMOS = [
    { email: "admin@shopez.com", password: "admin123", label: "Admin" },
    { email: "seller@shopez.com", password: "seller123", label: "Seller" },
    { email: "customer@shopez.com", password: "customer123", label: "Customer" },
];

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (user && user !== false) navigate(from, { replace: true });
    }, [user, navigate, from]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await login(email.trim(), password);
        setLoading(false);
        if (res.ok) {
            toast.success("Welcome back");
            navigate(from, { replace: true });
        } else {
            setError(res.error);
        }
    }

    function fillDemo(d) {
        setEmail(d.email);
        setPassword(d.password);
    }

    return (
        <div className="ez-container py-16 md:py-24" data-testid="login-page">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <p className="ez-overline mb-3">Account</p>
                    <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                        Welcome back
                    </h1>
                    <p className="mt-4 text-sm text-neutral-600">
                        Sign in to manage orders, save items, and check out faster.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                        {error && (
                            <div data-testid="login-error" className="p-4 border border-destructive text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="ez-label">Email</label>
                            <input
                                data-testid="login-email-input"
                                type="email"
                                className="ez-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="ez-label">Password</label>
                            <input
                                data-testid="login-password-input"
                                type="password"
                                className="ez-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="login-submit-btn"
                            className="ez-btn-primary w-full"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-neutral-600">
                        <Link to="/forgot-password" data-testid="login-forgot-link" className="underline">Forgot password?</Link>
                    </p>

                    <p className="mt-6 text-sm text-neutral-600">
                        New to ShopEZ?{" "}
                        <Link to="/register" data-testid="login-to-register-link" className="underline">Create an account</Link>
                    </p>
                </div>

                <div className="max-w-md w-full mx-auto lg:mx-0 lg:border-l lg:border-neutral-200 lg:pl-16" data-testid="demo-accounts">
                    <p className="ez-overline mb-3">For evaluation</p>
                    <h2 className="font-heading text-2xl font-medium">Demo accounts</h2>
                    <p className="text-sm text-neutral-600 mt-3">
                        Try ShopEZ end-to-end with these pre-seeded accounts.
                    </p>
                    <div className="mt-6 space-y-3">
                        {DEMOS.map((d) => (
                            <button
                                key={d.label}
                                onClick={() => fillDemo(d)}
                                data-testid={`demo-account-${d.label.toLowerCase()}`}
                                className="w-full text-left p-4 border border-neutral-200 hover:border-black transition-colors"
                            >
                                <p className="ez-overline mb-2">{d.label}</p>
                                <p className="text-sm font-mono">{d.email}</p>
                                <p className="text-xs text-neutral-500 font-mono mt-1">{d.password}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
