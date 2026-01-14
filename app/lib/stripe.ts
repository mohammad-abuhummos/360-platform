import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SpOwC8g14HXcp42ECaFN5SULqBXDa8HQafVndiTayjsBUkgiErdu04E81IslLf2DVEyXhxB2jVuUd5RwZdaSXUj005VwmKpon';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
}

// Generate a payment link for an invoice
// Note: In production, you'd create this via Stripe API on the server
// For now, we'll use Stripe Payment Links or Checkout Sessions
export function generatePaymentLink(invoiceId: string, amount: number, currency: string, recipientEmail: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    // This creates a link that will redirect to a payment page
    // In production, you'd create a Stripe Checkout Session on the server
    return `${baseUrl}/pay/${invoiceId}?amount=${amount}&currency=${currency}&email=${encodeURIComponent(recipientEmail)}`;
}

// Create checkout session redirect (client-side)
export async function redirectToCheckout(
    invoiceId: string,
    amount: number,
    currency: string,
    invoiceNumber: string,
    recipientEmail: string,
    productName?: string
): Promise<void> {
    const stripe = await getStripe();
    if (!stripe) {
        throw new Error('Stripe failed to load');
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // For client-side only, we'll redirect to a custom payment page
    // In production, you'd create a Checkout Session via your backend
    const paymentUrl = `${baseUrl}/payments/checkout?` + new URLSearchParams({
        invoiceId,
        amount: amount.toString(),
        currency,
        invoiceNumber,
        email: recipientEmail,
        product: productName || 'Invoice Payment',
    }).toString();

    window.location.href = paymentUrl;
}

// Invoice number generator
export function generateInvoiceNumber(prefix = 'INV'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// Format currency
export function formatCurrency(amount: number, currency = 'JOD'): string {
    return new Intl.NumberFormat('en-JO', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

// Format date
export function formatDate(date: Date | { toDate: () => Date } | string | null | undefined): string {
    if (!date) return '-';

    let d: Date;
    if (typeof date === 'string') {
        d = new Date(date);
    } else if ('toDate' in date && typeof date.toDate === 'function') {
        d = date.toDate();
    } else {
        d = date as Date;
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Calculate days until due
export function daysUntilDue(dueDate: Date | { toDate: () => Date }): number {
    const due = 'toDate' in dueDate && typeof dueDate.toDate === 'function'
        ? dueDate.toDate()
        : dueDate as Date;
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Status color mapping
export function getInvoiceStatusColor(status: string): string {
    switch (status) {
        case 'paid':
            return 'green';
        case 'open':
            return 'blue';
        case 'past_due':
            return 'orange';
        case 'uncollectible':
            return 'red';
        case 'void':
            return 'zinc';
        case 'draft':
            return 'zinc';
        default:
            return 'zinc';
    }
}

export function getSubscriptionStatusColor(status: string): string {
    switch (status) {
        case 'active':
            return 'green';
        case 'trialing':
            return 'blue';
        case 'past_due':
            return 'orange';
        case 'canceled':
            return 'red';
        case 'unpaid':
            return 'red';
        case 'incomplete':
            return 'yellow';
        case 'paused':
            return 'zinc';
        default:
            return 'zinc';
    }
}
