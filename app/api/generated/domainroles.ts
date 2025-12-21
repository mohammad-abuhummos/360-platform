// Auto-generated client for tag "DomainRoles".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [DomainRoles] DELETE /api/domain-roles/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiDomainRolesId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

/**
 * [DomainRoles] GET /api/domain-roles
 * Query params: clubId, onlyActive, includeTemplates
 * Responses: 200
 */
export function getApiDomainRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-roles",
    ...options,
  });
}

/**
 * [DomainRoles] GET /api/domain-roles/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiDomainRolesId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

/**
 * [DomainRoles] POST /api/domain-roles
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiDomainRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-roles",
    ...options,
  });
}

/**
 * [DomainRoles] POST /api/domain-roles/defaults/sync
 * Responses: 200
 */
export function postApiDomainRolesDefaultsSync(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-roles/defaults/sync",
    ...options,
  });
}

/**
 * [DomainRoles] POST /api/domain-roles/{id}/defaults:restore
 * Path params: id
 * Responses: 200
 */
export function postApiDomainRolesIdDefaultsRestore(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-roles/{id}/defaults:restore",
    ...options,
  });
}

/**
 * [DomainRoles] PUT /api/domain-roles/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiDomainRolesId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

export const DomainRolesApi = {
  deleteApiDomainRolesId,
  getApiDomainRoles,
  getApiDomainRolesId,
  postApiDomainRoles,
  postApiDomainRolesDefaultsSync,
  postApiDomainRolesIdDefaultsRestore,
  putApiDomainRolesId,
} as const;

