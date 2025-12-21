// Auto-generated client for tag "SystemRoleFeatures".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SystemRoleFeatures] GET /api/role-features
 * Responses: 200
 */
export function getApiRoleFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/role-features",
    ...options,
  });
}

/**
 * [SystemRoleFeatures] GET /api/role-features/{roleId}
 * Path params: roleId
 * Responses: 200
 */
export function getApiRoleFeaturesRoleId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/role-features/{roleId}",
    ...options,
  });
}

/**
 * [SystemRoleFeatures] PATCH /api/role-features/{roleId}/replace
 * Path params: roleId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiRoleFeaturesRoleIdReplace(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/role-features/{roleId}/replace",
    ...options,
  });
}

/**
 * [SystemRoleFeatures] POST /api/role-features/assign
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiRoleFeaturesAssign(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/role-features/assign",
    ...options,
  });
}

/**
 * [SystemRoleFeatures] POST /api/role-features/remove
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiRoleFeaturesRemove(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/role-features/remove",
    ...options,
  });
}

/**
 * [SystemRoleFeatures] PUT /api/role-features/{roleId}/replace
 * Path params: roleId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiRoleFeaturesRoleIdReplace(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/role-features/{roleId}/replace",
    ...options,
  });
}

export const SystemRoleFeaturesApi = {
  getApiRoleFeatures,
  getApiRoleFeaturesRoleId,
  patchApiRoleFeaturesRoleIdReplace,
  postApiRoleFeaturesAssign,
  postApiRoleFeaturesRemove,
  putApiRoleFeaturesRoleIdReplace,
} as const;

