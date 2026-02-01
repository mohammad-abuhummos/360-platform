import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Payments
 */

export function postApiClubsClubIdPaymentsCheckoutInvoice(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/checkout/invoice",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsCheckoutOneTime(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/checkout/one-time",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsCheckoutSubscription(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/checkout/subscription",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsCreditNotes(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/credit-notes",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsInvoices(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/invoices",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsInvoices(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/invoices",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsInvoicesInvoiceId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; invoiceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/invoices/{invoiceId}",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsProducts(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/products",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsProducts(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/products",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsProductsLive(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/products/live",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsProductsSync(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/products/sync",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsRefunds(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/refunds",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsBalance(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/balance",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsInvoiceStatus(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/invoice-status",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsOverview(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/overview",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsPayouts(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/payouts",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsProductSales(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/product-sales",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsRevenue(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/revenue",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsReportsSubscriptions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/reports/subscriptions",
    ...options,
  });
}

export function postApiClubsClubIdPaymentsStripeConnect(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/payments/stripe/connect",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsStripeStatus(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/stripe/status",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsSubscriptions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/subscriptions",
    ...options,
  });
}

export function getApiClubsClubIdPaymentsTransactions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/payments/transactions",
    ...options,
  });
}

export const paymentsApi = {
  postApiClubsClubIdPaymentsCheckoutInvoice,
  postApiClubsClubIdPaymentsCheckoutOneTime,
  postApiClubsClubIdPaymentsCheckoutSubscription,
  getApiClubsClubIdPaymentsCreditNotes,
  getApiClubsClubIdPaymentsInvoices,
  postApiClubsClubIdPaymentsInvoices,
  getApiClubsClubIdPaymentsInvoicesInvoiceId,
  getApiClubsClubIdPaymentsProducts,
  postApiClubsClubIdPaymentsProducts,
  getApiClubsClubIdPaymentsProductsLive,
  postApiClubsClubIdPaymentsProductsSync,
  getApiClubsClubIdPaymentsRefunds,
  getApiClubsClubIdPaymentsReportsBalance,
  getApiClubsClubIdPaymentsReportsInvoiceStatus,
  getApiClubsClubIdPaymentsReportsOverview,
  getApiClubsClubIdPaymentsReportsPayouts,
  getApiClubsClubIdPaymentsReportsProductSales,
  getApiClubsClubIdPaymentsReportsRevenue,
  getApiClubsClubIdPaymentsReportsSubscriptions,
  postApiClubsClubIdPaymentsStripeConnect,
  getApiClubsClubIdPaymentsStripeStatus,
  getApiClubsClubIdPaymentsSubscriptions,
  getApiClubsClubIdPaymentsTransactions,
} as const;

