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
// This creates a link that redirects to the checkout page, which then creates a Stripe session
export function generatePaymentLink(invoiceId: string, amount: number, currency: string, recipientEmail: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/payments/checkout?` + new URLSearchParams({
        invoiceId,
        amount: amount.toString(),
        currency,
        email: recipientEmail,
    }).toString();
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

// Supported currencies for Stripe checkout
const STRIPE_SUPPORTED_CURRENCIES = [
    'usd', 'aed', 'afn', 'all', 'amd', 'ang', 'aoa', 'ars', 'aud', 'awg', 'azn',
    'bam', 'bbd', 'bdt', 'bgn', 'bif', 'bmd', 'bnd', 'bob', 'brl', 'bsd', 'bwp',
    'byn', 'bzd', 'cad', 'cdf', 'chf', 'clp', 'cny', 'cop', 'crc', 'cve', 'czk',
    'djf', 'dkk', 'dop', 'dzd', 'egp', 'etb', 'eur', 'fjd', 'fkp', 'gbp', 'gel',
    'gip', 'gmd', 'gnf', 'gtq', 'gyd', 'hkd', 'hnl', 'hrk', 'htg', 'huf', 'idr',
    'ils', 'inr', 'isk', 'jmd', 'jpy', 'kes', 'kgs', 'khr', 'kmf', 'krw', 'kyd',
    'kzt', 'lak', 'lbp', 'lkr', 'lrd', 'lsl', 'mad', 'mdl', 'mga', 'mkd', 'mmk',
    'mnt', 'mop', 'mur', 'mvr', 'mwk', 'mxn', 'myr', 'mzn', 'nad', 'ngn', 'nio',
    'nok', 'npr', 'nzd', 'pab', 'pen', 'pgk', 'php', 'pkr', 'pln', 'pyg', 'qar',
    'ron', 'rsd', 'rub', 'rwf', 'sar', 'sbd', 'scr', 'sek', 'sgd', 'shp', 'sle',
    'sos', 'srd', 'std', 'szl', 'thb', 'tjs', 'top', 'try', 'ttd', 'twd', 'tzs',
    'uah', 'ugx', 'uyu', 'uzs', 'vnd', 'vuv', 'wst', 'xaf', 'xcd', 'xcg', 'xof',
    'xpf', 'yer', 'zar', 'zmw'
];

// Currency conversion rates (approximate rates - in production, use a live API)
const CURRENCY_CONVERSION_RATES: Record<string, number> = {
    'jod': 1.41,  // 1 JOD ≈ 1.41 USD
    'kwd': 3.26,  // 1 KWD ≈ 3.26 USD
    'bhd': 2.65,  // 1 BHD ≈ 2.65 USD
    'omr': 2.60,  // 1 OMR ≈ 2.60 USD
};

// Convert unsupported currency to USD
export function convertToSupportedCurrency(amount: number, currency: string): { amount: number; currency: string; converted: boolean; originalCurrency?: string; originalAmount?: number } {
    const currencyLower = currency.toLowerCase();

    // Check if currency is supported
    if (STRIPE_SUPPORTED_CURRENCIES.includes(currencyLower)) {
        return { amount, currency: currencyLower, converted: false };
    }

    // Convert to USD
    const rate = CURRENCY_CONVERSION_RATES[currencyLower] || 1;
    const convertedAmount = Math.round(amount * rate * 100) / 100; // Round to 2 decimal places

    return {
        amount: convertedAmount,
        currency: 'usd',
        converted: true,
        originalCurrency: currency.toUpperCase(),
        originalAmount: amount,
    };
}

// Check if currency is supported by Stripe
export function isCurrencySupported(currency: string): boolean {
    return STRIPE_SUPPORTED_CURRENCIES.includes(currency.toLowerCase());
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
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
