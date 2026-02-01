import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: UserRoleAssignments
 */

export function getApiUserRoleAssignments(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-role-assignments",
    ...options,
  });
}

export function postApiUserRoleAssignments(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-role-assignments",
    ...options,
  });
}

export function deleteApiUserRoleAssignments(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-role-assignments",
    ...options,
  });
}

export const userRoleAssignmentsApi = {
  getApiUserRoleAssignments,
  postApiUserRoleAssignments,
  deleteApiUserRoleAssignments,
} as const;

