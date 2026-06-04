import React from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Building2, Wallet, Check } from "lucide-react";
import { api, formatApiErrorDetail, money } from "@/lib/api";
import { resolveImageUrl } from "@/components/ImageUploader";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const STEPS = ["Address", "Payment", "Review"];

const PAYMENT_METHODS = [
    { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives." },
    { id: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "Transfer to our account. We confirm in 24h." },
    { id: "e_wallet", label: "E-Wallet", icon: Wallet, desc: "Mobile wallet payment." },
];

export default function Checkout() {
    const { cart, refresh } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = React.useState(0);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");

    const [address, setAddress] = React.useState({
        full_name: user?.name || "",
        phone: user?.phone || "",
        line1: user?.address || "",
        city: "",
        state: "",
        postal_code: "",
        country: "United States",
    });
    const [paymentMethod, setPaymentMethod] = React.useState("cod");
    const [notes, setNotes] = React.useState("");

    React.useEffect(() => {
        if (cart && cart.items.length === 0 && !submitting) {
            navigate("/cart");
        }
    }, [cart, submitting, navigate]);

    function update(field, value) {
        setAddress((a) => ({ ...a, [field]: value }));
    }

    function validateAddress() {
        const req = ["full_name", "phone", "line1", "city", "state", "postal_code"];
        for (const k of req) {
            if (!address[k] || String(address[k]).trim() === "") {
                setError("Please fill all required fields.");
                return false;
            }
        }
        setError("");
        return true;
    }

    async function placeOrder() {
        setSubmitting(true);
        setError("");
        try {
            const { data } = await api.post("/orders/checkout", {
                address,
                payment_method: paymentMethod,
                notes,
            });
            toast.success("Order placed successfully");
            await refresh();
            navigate(`/order-confirmation/${data.id}`);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
            toast.error("Could not place order");
        } finally {
            setSubmitting(false);
        }
    }

    const shipping = cart.subtotal > 0 ? 5.0 : 0;
    const total = cart.subtotal + shipping;

    return (
        <div className="ez-container py-12" data-testid="checkout-page">
            <header className="mb-10 pb-6 border-b border-neutral-200">
                <p className="ez-overline mb-3">Checkout</p>
                <h1 className="font-heading text-4xl md:text-5xl tracking-tight font-medium">
                    Almost there
                </h1>
            </header>

            {/* Stepper */}
            <div className="mb-12 flex items-center gap-6" data-testid="checkout-stepper">
                {STEPS.map((label, idx) => (
                    <div key={label} className="flex items-center gap-3 flex-1">
                        <div className={`flex items-center gap-2 ${idx === step ? "text-black" : idx < step ? "text-black" : "text-neutral-400"}`}>
                            <span className={`w-6 h-6 inline-flex items-center justify-center text-xs border ${
                                idx === step ? "bg-black text-white border-black" : idx < step ? "bg-black text-white border-black" : "border-neutral-300"
                            }`}>
                                {idx < step ? <Check size={12} strokeWidth={2} /> : idx + 1}
                            </span>
                            <span className="ez-overline">{label}</span>
                        </div>
                        {idx < STEPS.length - 1 && <div className={`flex-1 h-px ${idx < step ? "bg-black" : "bg-neutral-200"}`} />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
                <div>
                    {error && (
                        <div data-testid="checkout-error" className="mb-6 p-4 border border-destructive text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {step === 0 && (
                        <div className="space-y-5" data-testid="checkout-step-address">
                            <p className="ez-overline">Shipping address</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="ez-label">Full name</label>
                                    <input data-testid="checkout-input-name" className="ez-input" value={address.full_name} onChange={(e) => update("full_name", e.target.value)} />
                                </div>
                                <div>
                                    <label className="ez-label">Phone</label>
                                    <input data-testid="checkout-input-phone" className="ez-input" value={address.phone} onChange={(e) => update("phone", e.target.value)} />
                                </div>
                                <div>
                                    <label className="ez-label">Country</label>
                                    <input data-testid="checkout-input-country" className="ez-input" value={address.country} onChange={(e) => update("country", e.target.value)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="ez-label">Street address</label>
                                    <input data-testid="checkout-input-line1" className="ez-input" value={address.line1} onChange={(e) => update("line1", e.target.value)} />
                                </div>
                                <div>
                                    <label className="ez-label">City</label>
                                    <input data-testid="checkout-input-city" className="ez-input" value={address.city} onChange={(e) => update("city", e.target.value)} />
                                </div>
                                <div>
                                    <label className="ez-label">State / Region</label>
                                    <input data-testid="checkout-input-state" className="ez-input" value={address.state} onChange={(e) => update("state", e.target.value)} />
                                </div>
                                <div>
                                    <label className="ez-label">Postal code</label>
                                    <input data-testid="checkout-input-postal" className="ez-input" value={address.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    data-testid="checkout-next-payment"
                                    onClick={() => validateAddress() && setStep(1)}
                                    className="ez-btn-primary"
                                >
                                    Continue to payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-5" data-testid="checkout-step-payment">
                            <p className="ez-overline">Payment method</p>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    const selected = paymentMethod === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setPaymentMethod(m.id)}
                                            data-testid={`checkout-payment-${m.id}`}
                                            className={`w-full text-left p-5 border flex items-start gap-4 transition-colors ${
                                                selected ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                                            }`}
                                        >
                                            <Icon size={20} strokeWidth={1.5} className="mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{m.label}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{m.desc}</p>
                                            </div>
                                            <span className={`w-4 h-4 border ${selected ? "bg-black border-black" : "border-neutral-300"} flex items-center justify-center`}>
                                                {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div>
                                <label className="ez-label">Order notes (optional)</label>
                                <textarea
                                    data-testid="checkout-notes"
                                    className="ez-input min-h-[80px]"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Delivery instructions..."
                                />
                            </div>
                            <div className="pt-4 flex justify-between">
                                <button data-testid="checkout-back-address" onClick={() => setStep(0)} className="ez-btn-ghost">
                                    Back
                                </button>
                                <button data-testid="checkout-next-review" onClick={() => setStep(2)} className="ez-btn-primary">
                                    Review order
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6" data-testid="checkout-step-review">
                            <p className="ez-overline">Review your order</p>

                            <div className="border border-neutral-200 p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Shipping to</p>
                                    <button onClick={() => setStep(0)} className="text-xs underline">Edit</button>
                                </div>
                                <p className="text-sm text-neutral-600">
                                    {address.full_name}<br />
                                    {address.line1}<br />
                                    {address.city}, {address.state} {address.postal_code}<br />
                                    {address.country} · {address.phone}
                                </p>
                            </div>

                            <div className="border border-neutral-200 p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Payment</p>
                                    <button onClick={() => setStep(1)} className="text-xs underline">Edit</button>
                                </div>
                                <p className="text-sm text-neutral-600">
                                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-3">Items ({cart.total_items})</p>
                                <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                                    {cart.items.map((it) => (
                                        <li key={it.product_id} className="flex gap-3 py-3 text-sm">
                                            <img src={resolveImageUrl(it.image_url)} alt="" className="w-14 aspect-[3/4] object-cover bg-neutral-100" />
                                            <div className="flex-1">
                                                <p className="font-medium">{it.name}</p>
                                                <p className="text-xs text-neutral-500 mt-1">Qty {it.quantity}</p>
                                            </div>
                                            <p>{money(it.subtotal)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <button data-testid="checkout-back-payment" onClick={() => setStep(1)} className="ez-btn-ghost">
                                    Back
                                </button>
                                <button
                                    onClick={placeOrder}
                                    disabled={submitting}
                                    data-testid="checkout-place-order-btn"
                                    className="ez-btn-primary"
                                >
                                    {submitting ? "Placing..." : "Place order"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <aside className="lg:sticky lg:top-24 self-start border border-neutral-200 p-6 space-y-4 h-fit">
                    <p className="ez-overline">Summary</p>
                    <div className="ez-divider" />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Items ({cart.total_items})</span>
                        <span>{money(cart.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Shipping</span>
                        <span>{money(shipping)}</span>
                    </div>
                    <div className="ez-divider" />
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-medium text-lg" data-testid="checkout-summary-total">{money(total)}</span>
                    </div>
                </aside>
            </div>
        </div>
    );
}
