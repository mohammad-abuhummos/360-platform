import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { createInvoice } from "~/lib/firestore-payments";
import { generateInvoiceNumber } from "~/lib/stripe";
import { toast } from "react-hot-toast";

export type CreateInvoiceModalPrefill = {
    recipientName?: string;
    recipientEmail?: string;
    memberId?: string;
};

type CreateInvoiceModalProps = {
    open: boolean;
    onClose: () => void;
    clubId: string;
    prefill?: CreateInvoiceModalPrefill;
    lockRecipient?: boolean;
    onSuccess?: () => void;
};

const DEFAULT_FORM = {
    recipientName: "",
    recipientEmail: "",
    amountDue: 0,
    terms: "30 days",
    notes: "",
};

export function CreateInvoiceModal({
    open,
    onClose,
    clubId,
    prefill,
    lockRecipient = false,
    onSuccess,
}: CreateInvoiceModalProps) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({
                recipientName: prefill?.recipientName ?? "",
                recipientEmail: prefill?.recipientEmail ?? "",
                amountDue: 0,
                terms: "30 days",
                notes: "",
            });
        }
    }, [open, prefill?.recipientName, prefill?.recipientEmail]);

    const handleSubmit = async () => {
        if (!clubId || !form.recipientName || !form.recipientEmail) {
            toast.error("Recipient name and email are required");
            return;
        }

        setSubmitting(true);
        try {
            const dueDate = new Date();
            const daysMatch = form.terms.match(/(\d+)/);
            const days = daysMatch ? parseInt(daysMatch[1]) : 30;
            dueDate.setDate(dueDate.getDate() + days);

            await createInvoice({
                recipientName: form.recipientName.trim(),
                recipientEmail: form.recipientEmail.trim(),
                amountDue: form.amountDue,
                currency: "USD",
                invoiceNumber: generateInvoiceNumber("UATLHQZ"),
                status: "open",
                terms: form.terms,
                dueDate,
                type: "invoice",
                clubId,
                notes: form.notes || undefined,
                ...(prefill?.memberId && { memberId: prefill.memberId }),
            });

            toast.success("Invoice created successfully");
            setForm(DEFAULT_FORM);
            onClose();
            onSuccess?.();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create invoice");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogBody>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Recipient Name
                        </label>
                        <Input
                            type="text"
                            value={form.recipientName}
                            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                            placeholder="Enter recipient name"
                            readOnly={lockRecipient}
                            className={lockRecipient ? "bg-zinc-800/50" : undefined}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={form.recipientEmail}
                            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                            placeholder="Enter email address"
                            readOnly={lockRecipient}
                            className={lockRecipient ? "bg-zinc-800/50" : undefined}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Amount Due (USD)
                        </label>
                        <Input
                            type="number"
                            value={form.amountDue || ""}
                            onChange={(e) => setForm({ ...form, amountDue: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Payment Terms
                        </label>
                        <select
                            value={form.terms}
                            onChange={(e) => setForm({ ...form, terms: e.target.value })}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        >
                            <option value="7 days">7 days</option>
                            <option value="14 days">14 days</option>
                            <option value="30 days">30 days</option>
                            <option value="60 days">60 days</option>
                            <option value="90 days">90 days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Notes (optional)
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            rows={3}
                            placeholder="Add any notes..."
                        />
                    </div>
                </div>
            </DialogBody>
            <DialogActions>
                <Button plain onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button color="amber" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Creating..." : "Create Invoice"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
