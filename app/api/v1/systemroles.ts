import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SystemRoles
 */

export function getApiSystemRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/system-roles",
    ...options,
  });
}

export function postApiSystemRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles",
    ...options,
  });
}

export function deleteApiSystemRolesName(options: TemplateApiRequestOptions & { pathParams: { name: string } }) {
  return request({
    method: "DELETE",
    path: "/api/system-roles/{name}",
    ...options,
  });
}

export const systemRolesApi = {
  getApiSystemRoles,
  postApiSystemRoles,
  deleteApiSystemRolesName,
} as const;

