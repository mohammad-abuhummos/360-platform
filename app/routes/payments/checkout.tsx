import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../../components/button";
import { formatCurrency, convertToSupportedCurrency } from "../../lib/stripe";
import {
    CreditCardIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    ExclamationCircleIcon,
    ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();

    const invoiceId = searchParams.get("invoiceId");
    const originalAmount = parseFloat(searchParams.get("amount") || "0");
    const originalCurrency = searchParams.get("currency") || "USD";
    const invoiceNumber = searchParams.get("invoiceNumber") || "";
    const email = searchParams.get("email") || "";
    const product = searchParams.get("product") || "Invoice Payment";

    // Convert currency if not supported by Stripe
    const conversion = useMemo(() => {
        return convertToSupportedCurrency(originalAmount, originalCurrency);
    }, [originalAmount, originalCurrency]);

    const amount = conversion.amount;
    const currency = conversion.currency.toUpperCase();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStripeCheckout = async () => {
        if (!invoiceId) {
            setError("Invalid invoice");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Call our API to create a Stripe Checkout Session
            // Use converted amount and currency for Stripe
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    invoiceId,
                    amount: conversion.amount,
                    currency: conversion.currency,
                    invoiceNumber,
                    customerEmail: email,
                    productName: conversion.converted
                        ? `${product} (converted from ${conversion.originalCurrency} ${conversion.originalAmount})`
                        : product,
                    successUrl: `${window.location.origin}/payments/success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
                    cancelUrl: `${window.location.origin}/payments/invoices`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned from server");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            setError(err instanceof Error ? err.message : "Failed to start checkout");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                        <CreditCardIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">Secure Payment</h1>
                    <p className="text-zinc-600">Complete your payment for invoice {invoiceNumber}</p>
                </div>

                {/* Payment Card */}
                <div className="rounded-2xl bg-white p-8 shadow-xl">
                    {/* Invoice Summary */}
                    <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <p className="text-sm opacity-80">Amount to pay</p>
                        <p className="text-4xl font-bold">{formatCurrency(amount, currency)}</p>
                        <p className="mt-2 text-sm opacity-80">{product}</p>
                    </div>

                    {/* Currency Conversion Notice */}
                    {conversion.converted && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg bg-amber-50 p-4">
                            <ArrowsRightLeftIcon className="h-5 w-5 text-amber-600" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800">Currency Converted</p>
                                <p className="text-amber-700">
                                    Original: {formatCurrency(conversion.originalAmount!, conversion.originalCurrency!)} →
                                    Charged: {formatCurrency(amount, currency)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    <div className="mb-6 space-y-3 rounded-lg bg-zinc-50 p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Invoice Number</span>
                            <span className="font-medium text-zinc-900">{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Email</span>
                            <span className="font-medium text-zinc-900">{email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Description</span>
                            <span className="font-medium text-zinc-900">{product}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            <ExclamationCircleIcon className="h-5 w-5" />
                            {error}
                        </div>
                    )}

                    {/* Pay Button */}
                    <Button
                        color="blue"
                        className="w-full py-4 text-lg font-semibold"
                        onClick={handleStripeCheckout}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Redirecting to Stripe...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <LockClosedIcon className="h-5 w-5" />
                                Pay with Stripe
                            </span>
                        )}
                    </Button>

                    {/* What happens next */}
                    <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
                        You'll be redirected to Stripe's secure checkout page to complete your payment.
                    </div>

                    {/* Security Footer */}
                    <div className="mt-6 flex items-center justify-center gap-4 border-t border-zinc-100 pt-6">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                            <span>Secure</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <LockClosedIcon className="h-4 w-4 text-emerald-500" />
                            <span>256-bit SSL</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-zinc-600">Powered by</span>
                            <svg className="h-6" viewBox="0 0 60 25" fill="none">
                                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM41.04 20.29c-1.14 0-2.24-.4-2.82-1.15l-.05 5.08-4.2.89V5.83h3.73l.14 1.16c.68-.89 1.86-1.39 3.06-1.39 2.92 0 5.07 2.68 5.07 7.15 0 4.95-2.11 7.54-4.93 7.54zm-.74-10.82c-1.04 0-1.78.57-2.03 1.17v5.38c.26.62.99 1.17 2.01 1.17 1.54 0 2.22-1.72 2.22-3.85 0-2.11-.66-3.87-2.2-3.87zM28.6 5.83h4.2v14.03h-4.2V5.83zm0-5.08L32.8 0v3.52h-4.2V.75zm-5.06 0v19.07l-4.2.89V.75h4.2zm-5.9 5.08v14.03h-3.73l-.14-1.17c-.67.9-1.89 1.4-3.18 1.4-3.07 0-5.11-2.67-5.11-7.15 0-4.98 2.09-7.54 5.01-7.54 1.15 0 2.27.46 2.92 1.28V5.83h4.23zm-4.21 8.82V9.26c-.25-.62-1-1.17-2.05-1.17-1.53 0-2.23 1.75-2.23 3.87 0 2.1.69 3.85 2.21 3.85 1.04 0 1.82-.57 2.07-1.16zM0 12.63c0-4.98 2.83-7.1 5.68-7.1 1.7 0 3.16.55 4.22 1.48l-1.25 3.04c-.91-.72-1.79-.99-2.59-.99-1.4 0-2.03 1.07-2.03 3.4 0 2.35.62 3.42 2.02 3.42.79 0 1.73-.27 2.64-1l1.24 3.05c-1.07.92-2.53 1.47-4.23 1.47C2.76 19.4 0 17.26 0 12.63z" fill="#6772E5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Test Mode Info */}
                <div className="mt-4 rounded-lg bg-amber-50 p-4 text-center">
                    <p className="text-sm text-amber-800">
                        <strong>Test Mode:</strong> Use Stripe test cards like{" "}
                        <code className="rounded bg-amber-100 px-1.5 py-0.5">4242 4242 4242 4242</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
