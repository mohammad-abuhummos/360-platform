import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: UserRoles
 */

export function getApiUsersUserIdRoles(options: TemplateApiRequestOptions & { pathParams: { userId: string } }) {
  return request({
    method: "GET",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

export function putApiUsersUserIdRoles(options: TemplateApiRequestOptions & { pathParams: { userId: string } }) {
  return request({
    method: "PUT",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

export function patchApiUsersUserIdRoles(options: TemplateApiRequestOptions & { pathParams: { userId: string } }) {
  return request({
    method: "PATCH",
    path: "/api/users/{userId}/roles",
    ...options,
  });
}

export const userRolesApi = {
  getApiUsersUserIdRoles,
  putApiUsersUserIdRoles,
  patchApiUsersUserIdRoles,
} as const;

