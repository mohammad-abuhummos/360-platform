// Auto-generated client for tag "SystemRoleAssignments".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SystemRoleAssignments] POST /api/system-roles/assignments/assign
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSystemRolesAssignmentsAssign(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles/assignments/assign",
    ...options,
  });
}

/**
 * [SystemRoleAssignments] POST /api/system-roles/assignments/remove
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSystemRolesAssignmentsRemove(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles/assignments/remove",
    ...options,
  });
}

export const SystemRoleAssignmentsApi = {
  postApiSystemRolesAssignmentsAssign,
  postApiSystemRolesAssignmentsRemove,
} as const;

