import React from "react";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import { api, formatApiErrorDetail } from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    async function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
            setResult(data);
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function copyToken() {
        if (result?.token) {
            navigator.clipboard.writeText(result.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    const resetUrl = result?.token ? `${window.location.origin}/reset-password?token=${result.token}` : "";

    return (
        <div className="ez-container py-16 md:py-24" data-testid="forgot-password-page">
            <div className="max-w-md mx-auto">
                <p className="ez-overline mb-3">Reset password</p>
                <h1 className="font-heading text-4xl tracking-tight font-medium">
                    Forgot your password?
                </h1>
                <p className="mt-4 text-sm text-neutral-600">
                    Enter your email and we'll generate a reset token. (Demo mode: no email sent — the token is shown below.)
                </p>

                <form onSubmit={submit} className="mt-10 space-y-5">
                    {error && <p className="p-4 border border-destructive text-sm text-destructive">{error}</p>}
                    <div>
                        <label className="ez-label">Email</label>
                        <input
                            data-testid="forgot-email-input"
                            type="email"
                            className="ez-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="forgot-submit-btn"
                        className="ez-btn-primary w-full"
                    >
                        {submitting ? "Generating..." : "Generate reset token"}
                    </button>
                </form>

                {result && (
                    <div className="mt-8 border border-neutral-200 p-5 space-y-4" data-testid="forgot-result">
                        {result.token ? (
                            <>
                                <p className="ez-overline">Reset token</p>
                                <p className="text-xs text-neutral-600">{result.message}</p>
                                <div className="border border-neutral-200 p-3 bg-neutral-50">
                                    <p className="font-mono text-xs break-all" data-testid="forgot-token">{result.token}</p>
                                </div>
                                <button onClick={copyToken} data-testid="forgot-copy-token" className="ez-btn-secondary w-full inline-flex items-center justify-center gap-2">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "Copied" : "Copy token"}
                                </button>
                                <p className="ez-overline pt-4">Or use this link</p>
                                <a
                                    href={resetUrl}
                                    data-testid="forgot-reset-link"
                                    className="block text-xs text-neutral-600 underline break-all"
                                >
                                    {resetUrl}
                                </a>
                            </>
                        ) : (
                            <p className="text-sm text-neutral-600">{result.message}</p>
                        )}
                    </div>
                )}

                <p className="mt-6 text-sm text-neutral-600">
                    Remembered it? <Link to="/login" className="underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
