// Auto-generated client for tag "DomainRoleFeatures".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [DomainRoleFeatures] DELETE /api/domain-role-features/{roleId}/features/{featureId}
 * Path params: roleId, featureId
 * Responses: 200
 */
export function deleteApiDomainRoleFeaturesRoleIdFeaturesFeatureId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/domain-role-features/{roleId}/features/{featureId}",
    ...options,
  });
}

/**
 * [DomainRoleFeatures] GET /api/domain-role-features
 * Query params: clubId
 * Responses: 200
 */
export function getApiDomainRoleFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-role-features",
    ...options,
  });
}

/**
 * [DomainRoleFeatures] GET /api/domain-role-features/{roleId}/features
 * Path params: roleId
 * Responses: 200
 */
export function getApiDomainRoleFeaturesRoleIdFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

/**
 * [DomainRoleFeatures] PATCH /api/domain-role-features/{roleId}/features
 * Path params: roleId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiDomainRoleFeaturesRoleIdFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

/**
 * [DomainRoleFeatures] POST /api/domain-role-features/{roleId}/features/{featureId}
 * Path params: roleId, featureId
 * Responses: 200
 */
export function postApiDomainRoleFeaturesRoleIdFeaturesFeatureId(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-role-features/{roleId}/features/{featureId}",
    ...options,
  });
}

/**
 * [DomainRoleFeatures] PUT /api/domain-role-features/{roleId}/features
 * Path params: roleId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiDomainRoleFeaturesRoleIdFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

export const DomainRoleFeaturesApi = {
  deleteApiDomainRoleFeaturesRoleIdFeaturesFeatureId,
  getApiDomainRoleFeatures,
  getApiDomainRoleFeaturesRoleIdFeatures,
  patchApiDomainRoleFeaturesRoleIdFeatures,
  postApiDomainRoleFeaturesRoleIdFeaturesFeatureId,
  putApiDomainRoleFeaturesRoleIdFeatures,
} as const;

