# Invoice Email Template for EmailJS

## EmailJS Setup Instructions

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create a new Email Service (Gmail, Outlook, etc.)
3. Create a new Email Template
4. **Subject line:** `Invoice {{invoice_number}} from {{organization_name}} - Payment Required`
5. Copy the HTML below into the **Content** field (switch to HTML/Code view)

## Template Variables

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `{{to_name}}`           | Recipient's name                    |
| `{{to_email}}`          | Recipient's email address           |
| `{{invoice_number}}`    | Invoice number (e.g., INV-2024-001) |
| `{{amount_due}}`        | Formatted amount (e.g., $150.00)    |
| `{{due_date}}`          | Due date formatted                  |
| `{{payment_link}}`      | URL to payment page                 |
| `{{product_name}}`      | Product/Service name                |
| `{{organization_name}}` | Your organization name              |
| `{{notes}}`             | Optional notes                      |

---

## HTML TEMPLATE - COPY BELOW THIS LINE

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{invoice_number}}</title>
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
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{{organization_name}}</h1>
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
                                Hello <strong>{{to_name}}</strong>,
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
                                                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">{{invoice_number}}</p>
                                                </td>
                                                <td style="width: 50%; text-align: right;">
                                                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</p>
                                                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">{{due_date}}</p>
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
                                        <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">
                                            {{product_name}}
                                        </td>
                                        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
                                            1
                                        </td>
                                        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 500;">
                                            {{amount_due}}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <!-- Total Amount -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="text-align: right;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="display: inline-block;">
                                            <tr>
                                                <td style="padding: 8px 24px 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                                                <td style="padding: 8px 0; color: #374151; font-size: 14px; text-align: right;">{{amount_due}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 16px 24px 16px 0; border-top: 2px solid #e5e7eb; color: #111827; font-size: 18px; font-weight: 700;">Total Due</td>
                                                <td style="padding: 16px 0; border-top: 2px solid #e5e7eb; color: #2563eb; font-size: 24px; font-weight: 700; text-align: right;">{{amount_due}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Payment Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="{{payment_link}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                                            Pay Now Securely
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; text-align: center; color: #9ca3af; font-size: 13px;">
                                Payments are processed securely via <strong>Stripe</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 24px 32px; border-radius: 0 0 16px 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">{{organization_name}}</p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            Questions? Reply to this email or contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Legal Footer -->
                    <tr>
                        <td style="padding: 24px; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                                This invoice was sent by {{organization_name}}.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

---

## END OF HTML TEMPLATE

---

## Environment Variables

Add these to your `.env` file:

```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

## Testing the Template

1. In EmailJS, go to **Email Templates** → Your Template → **Test**
2. Fill in sample values:
   - `to_name`: John Doe
   - `to_email`: john@example.com
   - `invoice_number`: INV-2024-001
   - `amount_due`: $150.00
   - `due_date`: 01/30/2026
   - `payment_link`: https://yourapp.com/payments/checkout?invoiceId=123
   - `product_name`: Monthly Membership
   - `organization_name`: Jordan Knights FC

3. Click **Send Test Email** to preview
