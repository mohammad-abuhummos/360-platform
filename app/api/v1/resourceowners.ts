import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceOwners
 */

export function getApiResourceOwners(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/resource-owners",
    ...options,
  });
}

export function postApiResourceOwners(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/resource-owners",
    ...options,
  });
}

export function getApiResourceOwnersOwnerId(options: TemplateApiRequestOptions & { pathParams: { ownerId: string } }) {
  return request({
    method: "GET",
    path: "/api/resource-owners/{ownerId}",
    ...options,
  });
}

export function patchApiResourceOwnersOwnerId(options: TemplateApiRequestOptions & { pathParams: { ownerId: string } }) {
  return request({
    method: "PATCH",
    path: "/api/resource-owners/{ownerId}",
    ...options,
  });
}

export function deleteApiResourceOwnersOwnerId(options: TemplateApiRequestOptions & { pathParams: { ownerId: string } }) {
  return request({
    method: "DELETE",
    path: "/api/resource-owners/{ownerId}",
    ...options,
  });
}

export const resourceOwnersApi = {
  getApiResourceOwners,
  postApiResourceOwners,
  getApiResourceOwnersOwnerId,
  patchApiResourceOwnersOwnerId,
  deleteApiResourceOwnersOwnerId,
} as const;

