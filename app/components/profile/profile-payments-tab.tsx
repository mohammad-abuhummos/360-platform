import { useState, useEffect, useCallback } from "react";
import { Subheading } from "../heading";
import { Button } from "../button";
import { Badge } from "../badge";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeader,
    TableCell,
} from "../table";
import { DocumentTextIcon, CreditCardIcon, CubeIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
    getInvoicesForProfile,
    getSubscriptionsForProfile,
    type Invoice,
    type Subscription,
} from "~/lib/firestore-payments";
import { formatCurrency, formatDate, getInvoiceStatusColor, getSubscriptionStatusColor } from "~/lib/stripe";
import { CreateInvoiceModal } from "../payments/create-invoice-modal";
import { CreateSubscriptionModal } from "../payments/create-subscription-modal";
import { Timestamp } from "firebase/firestore";

type ProfilePaymentsTabProps = {
    memberId: string;
    memberName: string;
    memberEmail?: string;
    clubId: string;
};

function getDateValue(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    if (date instanceof Timestamp) return date.toDate();
    return date instanceof Date ? date : new Date(date);
}

export function ProfilePaymentsTab({
    memberId,
    memberName,
    memberEmail,
    clubId,
}: ProfilePaymentsTabProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
    const [isCreateSubscriptionOpen, setIsCreateSubscriptionOpen] = useState(false);

    const refresh = useCallback(async () => {
        if (!clubId) return;
        setLoading(true);
        try {
            const [invResult, subResult] = await Promise.all([
                getInvoicesForProfile(clubId, { email: memberEmail, memberId }),
                getSubscriptionsForProfile(clubId, { email: memberEmail, memberId }),
            ]);
            setInvoices(invResult);
            setSubscriptions(subResult);
        } catch (err) {
            console.error("Error fetching profile payments:", err);
        } finally {
            setLoading(false);
        }
    }, [clubId, memberEmail, memberId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const profilePrefill = {
        recipientName: memberName,
        recipientEmail: memberEmail ?? "",
        memberId,
    };

    const hasEmail = Boolean(memberEmail?.trim());

    // Products = subscriptions for this user (product-centric view)
    const productRows = subscriptions.map((sub) => ({
        productName: sub.productName,
        amount: sub.productId, // We'd need to get price from product - for now show plan
        status: sub.status,
        validUntil: sub.currentPeriodEnd,
        createdAt: sub.createdAt,
        subscriptionId: sub.id,
    }));

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="size-5 text-zinc-400" />
                        <Subheading level={3} className="text-sm font-semibold text-white">
                            Invoices
                        </Subheading>
                    </div>
                    <Button
                        plain
                        className="!p-1.5 text-sm text-amber-500 hover:text-amber-400"
                        onClick={() => setIsCreateInvoiceOpen(true)}
                        disabled={!hasEmail}
                        title={!hasEmail ? "Profile needs an email to create invoices" : undefined}
                    >
                        <PlusIcon className="size-4" data-slot="icon" />
                        New
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader className="text-xs text-zinc-500">Invoice number</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Amount due</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Status</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Billed to</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Products for</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Due date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium text-white">
                                            {inv.invoiceNumber}
                                        </TableCell>
                                        <TableCell className="text-zinc-300">
                                            {formatCurrency(inv.amountDue, inv.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={getInvoiceStatusColor(inv.status) as "green" | "amber" | "zinc" | "red"}>
                                                {inv.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">{inv.recipientName}</TableCell>
                                        <TableCell className="text-zinc-400">{inv.productName || "—"}</TableCell>
                                        <TableCell className="text-zinc-400 text-sm">
                                            {formatDate(getDateValue(inv.dueDate))}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCardIcon className="size-5 text-zinc-400" />
                        <Subheading level={3} className="text-sm font-semibold text-white">
                            Subscriptions
                        </Subheading>
                    </div>
                    <Button
                        plain
                        className="!p-1.5 text-sm text-amber-500 hover:text-amber-400"
                        onClick={() => setIsCreateSubscriptionOpen(true)}
                        disabled={!hasEmail}
                        title={!hasEmail ? "Profile needs an email to create subscriptions" : undefined}
                    >
                        <PlusIcon className="size-4" data-slot="icon" />
                        New
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader className="text-xs text-zinc-500">Name</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Product</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Status</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Plan</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Billed to</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Created at</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : subscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                                        No subscriptions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscriptions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium text-white">
                                            {sub.recipientName}
                                        </TableCell>
                                        <TableCell className="text-zinc-400">{sub.productName}</TableCell>
                                        <TableCell>
                                            <Badge color={getSubscriptionStatusColor(sub.status) as "green" | "amber" | "zinc" | "red"}>
                                                {sub.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">{sub.plan}</TableCell>
                                        <TableCell className="text-zinc-400">{sub.recipientEmail}</TableCell>
                                        <TableCell className="text-zinc-400 text-sm">
                                            {formatDate(getDateValue(sub.createdAt))}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CubeIcon className="size-5 text-zinc-400" />
                        <Subheading level={3} className="text-sm font-semibold text-white">
                            Products
                        </Subheading>
                    </div>
                </div>
                <p className="mb-4 text-xs text-zinc-500">
                    Products from this profile&apos;s subscriptions
                </p>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader className="text-xs text-zinc-500">Product</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Plan</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Status</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Valid until</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Created at</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : productRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                                        No products assigned. Create a subscription to assign products.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productRows.map((row, i) => (
                                    <TableRow key={row.subscriptionId ?? i}>
                                        <TableCell className="font-medium text-white">
                                            {row.productName}
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {subscriptions[i]?.plan ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={getSubscriptionStatusColor(row.status) as "green" | "amber" | "zinc" | "red"}>
                                                {row.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">
                                            {formatDate(getDateValue(row.validUntil))}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">
                                            {formatDate(getDateValue(row.createdAt))}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <CreateInvoiceModal
                open={isCreateInvoiceOpen}
                onClose={() => setIsCreateInvoiceOpen(false)}
                clubId={clubId}
                prefill={profilePrefill}
                lockRecipient={hasEmail}
                onSuccess={refresh}
            />

            <CreateSubscriptionModal
                open={isCreateSubscriptionOpen}
                onClose={() => setIsCreateSubscriptionOpen(false)}
                clubId={clubId}
                prefill={profilePrefill}
                lockRecipient={hasEmail}
                onSuccess={refresh}
            />
        </div>
    );
}
