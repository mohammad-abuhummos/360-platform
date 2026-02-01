import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SystemRoleAssignments
 */

export function postApiSystemRolesAssignmentsAssign(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles/assignments/assign",
    ...options,
  });
}

export function postApiSystemRolesAssignmentsRemove(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/system-roles/assignments/remove",
    ...options,
  });
}

export const systemRoleAssignmentsApi = {
  postApiSystemRolesAssignmentsAssign,
  postApiSystemRolesAssignmentsRemove,
} as const;

