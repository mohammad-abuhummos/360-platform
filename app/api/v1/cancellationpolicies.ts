import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: CancellationPolicies
 */

export function getApiCancellationPolicies(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/cancellation-policies",
    ...options,
  });
}

export function postApiCancellationPolicies(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/cancellation-policies",
    ...options,
  });
}

export function getApiCancellationPoliciesPolicyId(
  options: TemplateApiRequestOptions & { pathParams: { policyId: string } }
) {
  return request({
    method: "GET",
    path: "/api/cancellation-policies/{policyId}",
    ...options,
  });
}

export function patchApiCancellationPoliciesPolicyId(
  options: TemplateApiRequestOptions & { pathParams: { policyId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/cancellation-policies/{policyId}",
    ...options,
  });
}

export function deleteApiCancellationPoliciesPolicyId(
  options: TemplateApiRequestOptions & { pathParams: { policyId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/cancellation-policies/{policyId}",
    ...options,
  });
}

export const cancellationPoliciesApi = {
  getApiCancellationPolicies,
  postApiCancellationPolicies,
  getApiCancellationPoliciesPolicyId,
  patchApiCancellationPoliciesPolicyId,
  deleteApiCancellationPoliciesPolicyId,
} as const;

