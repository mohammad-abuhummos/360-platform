import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourcePricing
 */

export function getApiClubsClubIdResourcesResourceIdPricing(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing",
    ...options,
  });
}

export function putApiClubsClubIdResourcesResourceIdPricing(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing",
    ...options,
  });
}

export function patchApiClubsClubIdResourcesResourceIdPricing(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing",
    ...options,
  });
}

export function deleteApiClubsClubIdResourcesResourceIdPricing(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing",
    ...options,
  });
}

export function postApiClubsClubIdResourcesResourceIdPricingQuote(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources/{resourceId}/pricing/quote",
    ...options,
  });
}

export const resourcePricingApi = {
  getApiClubsClubIdResourcesResourceIdPricing,
  putApiClubsClubIdResourcesResourceIdPricing,
  patchApiClubsClubIdResourcesResourceIdPricing,
  deleteApiClubsClubIdResourcesResourceIdPricing,
  postApiClubsClubIdResourcesResourceIdPricingQuote,
} as const;

