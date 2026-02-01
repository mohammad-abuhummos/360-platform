import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: OwnersResources
 */

export function getApiOwnersOwnerIdResources(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string } }
) {
  return request({
    method: "GET",
    path: "/api/owners/{ownerId}/resources",
    ...options,
  });
}

export function postApiOwnersOwnerIdResources(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string } }
) {
  return request({
    method: "POST",
    path: "/api/owners/{ownerId}/resources",
    ...options,
  });
}

export function getApiOwnersOwnerIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/owners/{ownerId}/resources/{resourceId}",
    ...options,
  });
}

export function patchApiOwnersOwnerIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/owners/{ownerId}/resources/{resourceId}",
    ...options,
  });
}

export function deleteApiOwnersOwnerIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { ownerId: string; resourceId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/owners/{ownerId}/resources/{resourceId}",
    ...options,
  });
}

export const ownersResourcesApi = {
  getApiOwnersOwnerIdResources,
  postApiOwnersOwnerIdResources,
  getApiOwnersOwnerIdResourcesResourceId,
  patchApiOwnersOwnerIdResourcesResourceId,
  deleteApiOwnersOwnerIdResourcesResourceId,
} as const;

