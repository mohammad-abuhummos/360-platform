import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key', {
});

export async function action({ request }: { request: Request }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const body = await request.json();
        const {
            invoiceId,
            amount,
            currency,
            invoiceNumber,
            customerEmail,
            productName,
            successUrl,
            cancelUrl,
        } = body;

        // Convert amount to cents/smallest currency unit
        const amountInCents = Math.round(amount * 100);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: productName || `Invoice ${invoiceNumber}`,
                            description: `Payment for invoice ${invoiceNumber}`,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                invoiceId,
                invoiceNumber,
            },
            success_url: successUrl || `${process.env.APP_URL || 'http://localhost:5173'}/payments/success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
            cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:5173'}/payments/invoices`,
        });

        return Response.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
