import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: StripeWebhook
 */

export function postApiStripeWebhook(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/stripe/webhook",
    ...options,
  });
}

export const stripeWebhookApi = {
  postApiStripeWebhook,
} as const;

