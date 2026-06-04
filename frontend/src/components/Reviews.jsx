import React from "react";
import { Star } from "lucide-react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function fmtDate(d) {
    try {
        return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return d;
    }
}

export function StarRating({ value = 0, size = 14, interactive = false, onChange }) {
    return (
        <div className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(i)}
                    aria-label={`${i} star${i > 1 ? "s" : ""}`}
                    className={interactive ? "cursor-pointer" : "cursor-default"}
                >
                    <Star
                        size={size}
                        strokeWidth={1.5}
                        className={i <= Math.round(value) ? "fill-black text-black" : "text-neutral-300"}
                    />
                </button>
            ))}
        </div>
    );
}

export default function Reviews({ productId }) {
    const { user } = useAuth();
    const [reviews, setReviews] = React.useState(null);
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");

    const load = React.useCallback(() => {
        api.get(`/products/${productId}/reviews`).then(({ data }) => setReviews(data)).catch(() => setReviews([]));
    }, [productId]);

    React.useEffect(() => {
        load();
    }, [load]);

    async function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await api.post(`/products/${productId}/reviews`, { rating, comment });
            setComment("");
            setRating(5);
            toast.success("Review posted");
            load();
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const userReview = reviews?.find((r) => r.user_id === user?.id);

    return (
        <section className="mt-20" data-testid="reviews-section">
            <div className="ez-divider mb-10" />
            <p className="ez-overline mb-3">Reviews</p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-tight font-medium mb-8">
                What customers say
            </h2>

            {user && user !== false ? (
                <form onSubmit={submit} className="mb-10 max-w-2xl space-y-4" data-testid="review-form">
                    <p className="ez-overline">{userReview ? "Update your review" : "Write a review"}</p>
                    <div>
                        <label className="ez-label">Your rating</label>
                        <StarRating value={rating} size={20} interactive onChange={setRating} />
                    </div>
                    <div>
                        <label className="ez-label">Your thoughts</label>
                        <textarea
                            data-testid="review-comment-input"
                            rows={3}
                            className="ez-input"
                            placeholder="What did you love? Anything to flag?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={1000}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive" data-testid="review-error">{error}</p>}
                    <button data-testid="review-submit-btn" disabled={submitting} className="ez-btn-primary">
                        {submitting ? "Posting..." : userReview ? "Update review" : "Post review"}
                    </button>
                </form>
            ) : (
                <p className="mb-10 text-sm text-neutral-600">
                    <a href="/login" className="underline">Sign in</a> to leave a review.
                </p>
            )}

            {reviews === null ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="border-t border-neutral-200 pt-4">
                            <div className="h-3 w-32 ez-skel mb-2" />
                            <div className="h-4 w-full ez-skel" />
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-sm text-neutral-500 italic" data-testid="reviews-empty">No reviews yet. Be the first to share your thoughts.</p>
            ) : (
                <ul className="divide-y divide-neutral-200 max-w-2xl">
                    {reviews.map((r) => (
                        <li key={r.id} className="py-5" data-testid={`review-${r.id}`}>
                            <div className="flex items-center justify-between gap-4">
                                <p className="font-medium text-sm">{r.user_name || "Customer"}</p>
                                <p className="text-xs text-neutral-500">{fmtDate(r.created_at)}</p>
                            </div>
                            <div className="mt-2"><StarRating value={r.rating} /></div>
                            {r.comment && <p className="mt-3 text-sm text-neutral-700 leading-relaxed">{r.comment}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
