// Auto-generated client for tag "SuperAdminUsers".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SuperAdminUsers] DELETE /api/super-admin/users/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiSuperAdminUsersId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

/**
 * [SuperAdminUsers] GET /api/super-admin/users
 * Query params: search, role, Page, PageSize
 * Responses: 200
 */
export function getApiSuperAdminUsers(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/users",
    ...options,
  });
}

/**
 * [SuperAdminUsers] GET /api/super-admin/users/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiSuperAdminUsersId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

/**
 * [SuperAdminUsers] GET /api/super-admin/users/roles
 * Responses: 200
 */
export function getApiSuperAdminUsersRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/users/roles",
    ...options,
  });
}

/**
 * [SuperAdminUsers] PATCH /api/super-admin/users/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiSuperAdminUsersId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsers(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/confirm-email
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsersIdConfirmEmail(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/confirm-email",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/lock
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsersIdLock(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/lock",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/reset-password
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsersIdResetPassword(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/reset-password",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/roles:assign
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsersIdRolesAssign(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/roles:assign",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/roles:remove
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSuperAdminUsersIdRolesRemove(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/roles:remove",
    ...options,
  });
}

/**
 * [SuperAdminUsers] POST /api/super-admin/users/{id}/unlock
 * Path params: id
 * Responses: 200
 */
export function postApiSuperAdminUsersIdUnlock(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/super-admin/users/{id}/unlock",
    ...options,
  });
}

/**
 * [SuperAdminUsers] PUT /api/super-admin/users/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiSuperAdminUsersId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/super-admin/users/{id}",
    ...options,
  });
}

export const SuperAdminUsersApi = {
  deleteApiSuperAdminUsersId,
  getApiSuperAdminUsers,
  getApiSuperAdminUsersId,
  getApiSuperAdminUsersRoles,
  patchApiSuperAdminUsersId,
  postApiSuperAdminUsers,
  postApiSuperAdminUsersIdConfirmEmail,
  postApiSuperAdminUsersIdLock,
  postApiSuperAdminUsersIdResetPassword,
  postApiSuperAdminUsersIdRolesAssign,
  postApiSuperAdminUsersIdRolesRemove,
  postApiSuperAdminUsersIdUnlock,
  putApiSuperAdminUsersId,
} as const;

