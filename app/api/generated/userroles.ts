// Auto-generated client for tag "UserRoles".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [UserRoles] GET /api/users/{userId}/roles
 * Path params: userId
 * Responses: 200
 */
export function getApiUsersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

/**
 * [UserRoles] PATCH /api/users/{userId}/roles
 * Path params: userId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiUsersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

/**
 * [UserRoles] PUT /api/users/{userId}/roles
 * Path params: userId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiUsersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

export const UserRolesApi = {
  getApiUsersUserIdRoles,
  patchApiUsersUserIdRoles,
  putApiUsersUserIdRoles,
} as const;

