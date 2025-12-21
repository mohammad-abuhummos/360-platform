// Auto-generated client for tag "SystemRoles".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SystemRoles] DELETE /api/system-roles/{name}
 * Path params: name
 * Responses: 200
 */
export function deleteApiSystemRolesName(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/system-roles/{name}",
    ...options,
  });
}

/**
 * [SystemRoles] GET /api/system-roles
 * Responses: 200
 */
export function getApiSystemRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/system-roles",
    ...options,
  });
}

/**
 * [SystemRoles] POST /api/system-roles
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSystemRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles",
    ...options,
  });
}

export const SystemRolesApi = {
  deleteApiSystemRolesName,
  getApiSystemRoles,
  postApiSystemRoles,
} as const;

