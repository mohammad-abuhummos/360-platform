import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import type { Invoice } from './firestore-payments';
import { formatCurrency, formatDate } from './stripe';

// EmailJS Configuration
// Get your credentials from: https://dashboard.emailjs.com/admin/account
const EMAILJS_SERVICE_ID = String(import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '').trim();
const EMAILJS_TEMPLATE_ID = String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '').trim();
const EMAILJS_PUBLIC_KEY = String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '').trim();

// Check if EmailJS is configured
export function isEmailJSConfigured(): boolean {
    return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

// Initialize EmailJS
export function initEmailJS(): void {
    if (!EMAILJS_PUBLIC_KEY) {
        console.warn('EmailJS Public Key not configured. Set VITE_EMAILJS_PUBLIC_KEY in your .env file');
        return;
    }
    // @emailjs/browser v4 expects an options object
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// Invoice email data interface
export interface InvoiceEmailData {
    to_email: string;
    to_name: string;
    invoice_number: string;
    amount_due: string;
    currency: string;
    due_date: string;
    payment_link: string;
    product_name?: string;
    organization_name: string;
    organization_logo?: string;
    notes?: string;
    line_items_html?: string;
}

// Generate beautiful HTML invoice template
export function generateInvoiceEmailHTML(
    invoice: Invoice,
    paymentLink: string,
    organizationName: string,
    organizationLogo?: string
): string {
    const amountFormatted = formatCurrency(invoice.amountDue, invoice.currency);
    const dueDateFormatted = formatDate(invoice.dueDate);

    // Generate line items HTML if available
    let lineItemsHTML = '';
    if (invoice.lineItems && invoice.lineItems.length > 0) {
        lineItemsHTML = invoice.lineItems.map(item => `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">
                    ${item.description}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">
                    ${formatCurrency(item.unitPrice, invoice.currency)}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 500;">
                    ${formatCurrency(item.amount, invoice.currency)}
                </td>
            </tr>
        `).join('');
    } else {
        // Default single line item
        lineItemsHTML = `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">
                    ${invoice.productName || 'Invoice Payment'}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
                    1
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">
                    ${amountFormatted}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 500;">
                    ${amountFormatted}
                </td>
            </tr>
        `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px; border-radius: 16px 16px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        ${organizationLogo
            ? `<img src="${organizationLogo}" alt="${organizationName}" style="height: 48px; width: auto;">`
            : `<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${organizationName}</h1>`
        }
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                                            INVOICE
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 32px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${invoice.recipientName}</strong>,
                            </p>
                            <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                                Please find your invoice details below. Click the payment button to complete your payment securely via Stripe.
                            </p>
                            
                            <!-- Invoice Details Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="width: 50%;">
                                                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Number</p>
                                                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${invoice.invoiceNumber}</p>
                                                </td>
                                                <td style="width: 50%; text-align: right;">
                                                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</p>
                                                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${dueDateFormatted}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Line Items Table -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f9fafb;">
                                        <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                                        <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                        <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
                                        <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lineItemsHTML}
                                </tbody>
                            </table>
                            
                            <!-- Total Amount -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="text-align: right;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="display: inline-block;">
                                            <tr>
                                                <td style="padding: 8px 24px 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                                                <td style="padding: 8px 0; color: #374151; font-size: 14px; text-align: right;">${amountFormatted}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 16px 24px 16px 0; border-top: 2px solid #e5e7eb; color: #111827; font-size: 18px; font-weight: 700;">Total Due</td>
                                                <td style="padding: 16px 0; border-top: 2px solid #e5e7eb; color: #2563eb; font-size: 24px; font-weight: 700; text-align: right;">${amountFormatted}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Payment Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                                            💳 Pay Now Securely
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; text-align: center; color: #9ca3af; font-size: 13px;">
                                Payments are processed securely via <strong>Stripe</strong>
                            </p>
                            
                            ${invoice.notes ? `
                            <!-- Notes Section -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                        <p style="margin: 0 0 4px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">Note</p>
                                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">${invoice.notes}</p>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 24px 32px; border-radius: 0 0 16px 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${organizationName}</p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            Questions? Reply to this email or contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Unsubscribe / Legal -->
                    <tr>
                        <td style="padding: 24px; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                                This invoice was sent by ${organizationName}.<br>
                                Payment terms: ${invoice.terms}
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// Send invoice email via EmailJS
export async function sendInvoiceEmail(
    invoice: Invoice,
    paymentLink: string,
    organizationName: string,
    organizationLogo?: string
): Promise<{ success: boolean; message: string }> {
    // Check if EmailJS is configured
    if (!isEmailJSConfigured()) {
        return {
            success: false,
            message: 'EmailJS is not configured. Please add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your .env file. Get these from https://dashboard.emailjs.com/admin/account'
        };
    }

    try {
        // Ensure EmailJS has a global public key configured (safe to call multiple times)
        initEmailJS();

        const templateParams: InvoiceEmailData = {
            to_email: invoice.recipientEmail,
            to_name: invoice.recipientName,
            invoice_number: invoice.invoiceNumber,
            amount_due: formatCurrency(invoice.amountDue, invoice.currency),
            currency: invoice.currency,
            due_date: formatDate(invoice.dueDate),
            payment_link: paymentLink,
            product_name: invoice.productName || 'Invoice Payment',
            organization_name: organizationName,
            organization_logo: organizationLogo,
            notes: invoice.notes,
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams as unknown as Record<string, unknown>,
            // @emailjs/browser v4 expects an options object here too
            { publicKey: EMAILJS_PUBLIC_KEY }
        );

        if (response.status === 200) {
            return { success: true, message: 'Invoice sent successfully!' };
        } else {
            return { success: false, message: 'Failed to send invoice email' };
        }
    } catch (error) {
        console.error('Error sending invoice email:', error);
        const errorMessage =
            error instanceof EmailJSResponseStatus
                ? error.text
                : error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                        ? error
                        : 'Failed to send invoice email';

        // Provide helpful error messages
        if (errorMessage.includes('Public Key is invalid')) {
            return {
                success: false,
                message:
                    'EmailJS rejected the Public Key. Double-check VITE_EMAILJS_PUBLIC_KEY (EmailJS Dashboard → Account → API Keys). ' +
                    'Also check EmailJS Dashboard → Account → General → Security and DISABLE "Use Private Key (recommended)" when using the browser SDK (@emailjs/browser).'
            };
        }
        if (errorMessage.includes('service_id')) {
            return {
                success: false,
                message: 'Invalid EmailJS Service ID. Get your Service ID from https://dashboard.emailjs.com/admin'
            };
        }
        if (errorMessage.includes('template_id')) {
            return {
                success: false,
                message: 'Invalid EmailJS Template ID. Create a template at https://dashboard.emailjs.com/admin/templates'
            };
        }

        return {
            success: false,
            message: errorMessage
        };
    }
}

// Preview invoice email (returns HTML string)
export function previewInvoiceEmail(
    invoice: Invoice,
    paymentLink: string,
    organizationName: string,
    organizationLogo?: string
): string {
    return generateInvoiceEmailHTML(invoice, paymentLink, organizationName, organizationLogo);
}
