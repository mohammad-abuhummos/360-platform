import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { createSubscription, getProducts, type Product } from "~/lib/firestore-payments";
import { toast } from "react-hot-toast";

export type CreateSubscriptionModalPrefill = {
    recipientName?: string;
    recipientEmail?: string;
    memberId?: string;
};

type CreateSubscriptionModalProps = {
    open: boolean;
    onClose: () => void;
    clubId: string;
    prefill?: CreateSubscriptionModalPrefill;
    lockRecipient?: boolean;
    onSuccess?: () => void;
};

const DEFAULT_FORM = {
    recipientName: "",
    recipientEmail: "",
    productId: "",
    plan: "Monthly" as const,
    collectionMethod: "charge_automatically" as const,
};

export function CreateSubscriptionModal({
    open,
    onClose,
    clubId,
    prefill,
    lockRecipient = false,
    onSuccess,
}: CreateSubscriptionModalProps) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [products, setProducts] = useState<Product[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && clubId) {
            setForm({
                recipientName: prefill?.recipientName ?? "",
                recipientEmail: prefill?.recipientEmail ?? "",
                productId: "",
                plan: "Monthly",
                collectionMethod: "charge_automatically",
            });
            getProducts(clubId, { archived: false }).then(setProducts);
        }
    }, [open, clubId, prefill?.recipientName, prefill?.recipientEmail]);

    const handleSubmit = async () => {
        if (!clubId || !form.recipientName || !form.recipientEmail || !form.productId) {
            toast.error("Recipient name, email, and product are required");
            return;
        }

        const product = products.find((p) => p.id === form.productId);
        if (!product) {
            toast.error("Please select a valid product");
            return;
        }

        setSubmitting(true);
        try {
            const startAt = new Date();
            const currentPeriodEnd = new Date();

            switch (form.plan) {
                case "Monthly":
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
                    break;
                case "Quarterly":
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
                    break;
                case "Annually":
                    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
                    break;
            }

            await createSubscription({
                recipientName: form.recipientName.trim(),
                recipientEmail: form.recipientEmail.trim(),
                productId: form.productId,
                productName: product.title,
                type: "recurring",
                paidInstallments: 0,
                totalInstallments: 0,
                status: "active",
                plan: form.plan,
                collectionMethod: form.collectionMethod,
                startAt,
                currentPeriodEnd,
                clubId,
                ...(prefill?.memberId && { memberId: prefill.memberId }),
            });

            toast.success("Subscription created successfully");
            setForm(DEFAULT_FORM);
            onClose();
            onSuccess?.();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create subscription");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New Subscription</DialogTitle>
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
                            Billing Email
                        </label>
                        <Input
                            type="email"
                            value={form.recipientEmail}
                            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                            placeholder="Enter billing email"
                            readOnly={lockRecipient}
                            className={lockRecipient ? "bg-zinc-800/50" : undefined}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Product
                        </label>
                        <select
                            value={form.productId}
                            onChange={(e) => setForm({ ...form, productId: e.target.value })}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Billing Plan
                        </label>
                        <select
                            value={form.plan}
                            onChange={(e) => setForm({ ...form, plan: e.target.value as typeof form.plan })}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Annually">Annually</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Collection Method
                        </label>
                        <select
                            value={form.collectionMethod}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    collectionMethod: e.target.value as typeof form.collectionMethod,
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        >
                            <option value="charge_automatically">Charge automatically</option>
                            <option value="send_invoice">Send invoice</option>
                        </select>
                    </div>
                </div>
            </DialogBody>
            <DialogActions>
                <Button plain onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button color="amber" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Creating..." : "Create Subscription"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
