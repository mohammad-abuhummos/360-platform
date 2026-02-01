import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceListings
 */

export function getApiOwnersOwnerIdResourcesResourceIdListing(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/owners/{ownerId}/resources/{resourceId}/listing",
    ...options,
  });
}

export function postApiOwnersOwnerIdResourcesResourceIdListing(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/owners/{ownerId}/resources/{resourceId}/listing",
    ...options,
  });
}

export function deleteApiOwnersOwnerIdResourcesResourceIdListing(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/owners/{ownerId}/resources/{resourceId}/listing",
    ...options,
  });
}

export const resourceListingsApi = {
  getApiOwnersOwnerIdResourcesResourceIdListing,
  postApiOwnersOwnerIdResourcesResourceIdListing,
  deleteApiOwnersOwnerIdResourcesResourceIdListing,
} as const;

