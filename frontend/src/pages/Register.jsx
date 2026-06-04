import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Register() {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = React.useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
        role: "customer",
    });
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (user && user !== false) navigate("/", { replace: true });
    }, [user, navigate]);

    function update(k, v) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        const res = await register({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
        });
        setLoading(false);
        if (res.ok) {
            toast.success("Account created");
            navigate("/", { replace: true });
        } else {
            setError(res.error);
        }
    }

    return (
        <div className="ez-container py-16 md:py-24" data-testid="register-page">
            <div className="max-w-md mx-auto">
                <p className="ez-overline mb-3">New account</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Create your account
                </h1>
                <p className="mt-4 text-sm text-neutral-600">
                    Join ShopEZ. It takes 30 seconds.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                    {error && (
                        <div data-testid="register-error" className="p-4 border border-destructive text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="ez-label">Full name</label>
                        <input
                            data-testid="register-name-input"
                            className="ez-input"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="ez-label">Email</label>
                        <input
                            data-testid="register-email-input"
                            type="email"
                            className="ez-input"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="ez-label">Password</label>
                            <input
                                data-testid="register-password-input"
                                type="password"
                                className="ez-input"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="ez-label">Confirm</label>
                            <input
                                data-testid="register-confirm-input"
                                type="password"
                                className="ez-input"
                                value={form.confirm}
                                onChange={(e) => update("confirm", e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="ez-label">Account type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: "customer", label: "Customer", desc: "Shop and buy products" },
                                { id: "seller", label: "Seller", desc: "List and manage products" },
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => update("role", r.id)}
                                    data-testid={`register-role-${r.id}`}
                                    className={`p-4 border text-left transition-colors ${
                                        form.role === r.id ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                                    }`}
                                >
                                    <p className="font-medium text-sm">{r.label}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="register-submit-btn"
                        className="ez-btn-primary w-full"
                    >
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link to="/login" data-testid="register-to-login-link" className="underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
