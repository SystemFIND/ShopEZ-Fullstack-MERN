import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = React.useState(params.get("token") || "");
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/auth/reset-password", { token, new_password: password });
            toast.success("Password updated. You can sign in.");
            navigate("/login");
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="ez-container py-16 md:py-24" data-testid="reset-password-page">
            <div className="max-w-md mx-auto">
                <p className="ez-overline mb-3">Reset password</p>
                <h1 className="font-heading text-4xl tracking-tight font-medium">
                    Set a new password
                </h1>
                <p className="mt-4 text-sm text-neutral-600">
                    Paste your token below and choose a new password.
                </p>

                <form onSubmit={submit} className="mt-10 space-y-5">
                    {error && (
                        <p className="p-4 border border-destructive text-sm text-destructive" data-testid="reset-error">
                            {error}
                        </p>
                    )}
                    <div>
                        <label className="ez-label">Reset token</label>
                        <input
                            data-testid="reset-token-input"
                            className="ez-input font-mono text-xs"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="ez-label">New password</label>
                        <input
                            data-testid="reset-password-input"
                            type="password"
                            className="ez-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="ez-label">Confirm password</label>
                        <input
                            data-testid="reset-confirm-input"
                            type="password"
                            className="ez-input"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="reset-submit-btn"
                        className="ez-btn-primary w-full"
                    >
                        {submitting ? "Updating..." : "Reset password"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-neutral-600">
                    <Link to="/login" className="underline">Back to sign in</Link>
                </p>
            </div>
        </div>
    );
}
