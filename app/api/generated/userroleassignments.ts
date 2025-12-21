// Auto-generated client for tag "UserRoleAssignments".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [UserRoleAssignments] DELETE /api/user-role-assignments
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function deleteApiUserRoleAssignments(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-role-assignments",
    ...options,
  });
}

/**
 * [UserRoleAssignments] GET /api/user-role-assignments
 * Responses: 200
 */
export function getApiUserRoleAssignments(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-role-assignments",
    ...options,
  });
}

/**
 * [UserRoleAssignments] POST /api/user-role-assignments
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserRoleAssignments(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-role-assignments",
    ...options,
  });
}

export const UserRoleAssignmentsApi = {
  deleteApiUserRoleAssignments,
  getApiUserRoleAssignments,
  postApiUserRoleAssignments,
} as const;

