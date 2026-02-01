import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourcePricingRules
 */

export function getApiClubsClubIdResourcesResourceIdPricingRules(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing-rules",
    ...options,
  });
}

export function postApiClubsClubIdResourcesResourceIdPricingRules(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing-rules",
    ...options,
  });
}

export function putApiClubsClubIdResourcesResourceIdPricingRulesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing-rules/{id}",
    ...options,
  });
}

export function patchApiClubsClubIdResourcesResourceIdPricingRulesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing-rules/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourcesResourceIdPricingRulesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing-rules/{id}",
    ...options,
  });
}

export const resourcePricingRulesApi = {
  getApiClubsClubIdResourcesResourceIdPricingRules,
  postApiClubsClubIdResourcesResourceIdPricingRules,
  putApiClubsClubIdResourcesResourceIdPricingRulesId,
  patchApiClubsClubIdResourcesResourceIdPricingRulesId,
  deleteApiClubsClubIdResourcesResourceIdPricingRulesId,
} as const;

