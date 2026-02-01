import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SuperAdminUsers
 */

export function getApiSuperAdminUsers(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/users",
    ...options,
  });
}

export function postApiSuperAdminUsers(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users",
    ...options,
  });
}

export function getApiSuperAdminUsersId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

export function putApiSuperAdminUsersId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

export function patchApiSuperAdminUsersId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

export function deleteApiSuperAdminUsersId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

export function postApiSuperAdminUsersRolesAssign(
  options: TemplateApiRequestOptions & { pathParams: { id: string } }
) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/roles:assign",
    ...options,
  });
}

export function postApiSuperAdminUsersRolesRemove(
  options: TemplateApiRequestOptions & { pathParams: { id: string } }
) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/roles:remove",
    ...options,
  });
}

export function postApiSuperAdminUsersIdLock(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/lock",
    ...options,
  });
}

export function postApiSuperAdminUsersIdUnlock(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/unlock",
    ...options,
  });
}

export function postApiSuperAdminUsersIdResetPassword(
  options: TemplateApiRequestOptions & { pathParams: { id: string } }
) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/reset-password",
    ...options,
  });
}

export function postApiSuperAdminUsersIdConfirmEmail(
  options: TemplateApiRequestOptions & { pathParams: { id: string } }
) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/confirm-email",
    ...options,
  });
}

export function getApiSuperAdminUsersRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/users/roles",
    ...options,
  });
}

export const superAdminUsersApi = {
  getApiSuperAdminUsers,
  postApiSuperAdminUsers,
  getApiSuperAdminUsersId,
  putApiSuperAdminUsersId,
  patchApiSuperAdminUsersId,
  deleteApiSuperAdminUsersId,
  postApiSuperAdminUsersRolesAssign,
  postApiSuperAdminUsersRolesRemove,
  postApiSuperAdminUsersIdLock,
  postApiSuperAdminUsersIdUnlock,
  postApiSuperAdminUsersIdResetPassword,
  postApiSuperAdminUsersIdConfirmEmail,
  getApiSuperAdminUsersRoles,
} as const;

