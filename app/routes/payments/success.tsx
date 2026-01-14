import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "../../components/button";
import { updateInvoice } from "../../lib/firestore-payments";
import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get("session_id");
  const invoiceId = searchParams.get("invoice_id");
  
  const [updating, setUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function updateInvoiceStatus() {
      if (!invoiceId) {
        setUpdating(false);
        return;
      }

      try {
        // Update invoice to paid
        await updateInvoice(invoiceId, {
          status: "paid",
          paidAt: new Date(),
          stripeSessionId: sessionId || undefined,
        });
        setUpdating(false);
      } catch (err) {
        console.error("Error updating invoice:", err);
        setError("Failed to update invoice status. Please contact support.");
        setUpdating(false);
      }
    }

    updateInvoiceStatus();
  }, [invoiceId, sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          {/* Animated Check Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
            <CheckCircleIcon className="h-14 w-14 text-white" />
          </div>

          <h1 className="mb-2 text-3xl font-bold text-zinc-900">
            Payment Successful!
          </h1>
          
          <p className="mb-6 text-zinc-600">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          {updating ? (
            <div className="mb-6 flex items-center justify-center gap-2 text-zinc-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Updating invoice status...</span>
            </div>
          ) : error ? (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-emerald-50 p-4">
              <p className="text-emerald-700">
                ✓ Invoice has been marked as <strong>paid</strong>
              </p>
            </div>
          )}

          {/* Confirmation Details */}
          {sessionId && (
            <div className="mb-6 rounded-lg bg-zinc-50 p-4 text-left">
              <p className="text-xs text-zinc-500">Transaction Reference</p>
              <p className="truncate font-mono text-sm text-zinc-700">{sessionId}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              color="emerald"
              className="w-full"
              onClick={() => navigate("/payments/invoices")}
            >
              <span className="flex items-center justify-center gap-2">
                View Invoices
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>

        {/* Stripe Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            Secured by{" "}
            <span className="font-semibold text-indigo-600">Stripe</span>
          </p>
        </div>
      </div>
    </div>
  );
}
