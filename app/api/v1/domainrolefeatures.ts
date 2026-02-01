import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: DomainRoleFeatures
 */

export function getApiDomainRoleFeatures(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-role-features",
    ...options,
  });
}

export function getApiDomainRoleFeaturesRoleIdFeatures(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string } }
) {
  return request({
    method: "GET",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

export function putApiDomainRoleFeaturesRoleIdFeatures(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

export function patchApiDomainRoleFeaturesRoleIdFeatures(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/domain-role-features/{roleId}/features",
    ...options,
  });
}

export function postApiDomainRoleFeaturesRoleIdFeaturesFeatureId(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string; featureId: string } }
) {
  return request({
    method: "POST",
    path: "/api/domain-role-features/{roleId}/features/{featureId}",
    ...options,
  });
}

export function deleteApiDomainRoleFeaturesRoleIdFeaturesFeatureId(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string; featureId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/domain-role-features/{roleId}/features/{featureId}",
    ...options,
  });
}

export const domainRoleFeaturesApi = {
  getApiDomainRoleFeatures,
  getApiDomainRoleFeaturesRoleIdFeatures,
  putApiDomainRoleFeaturesRoleIdFeatures,
  patchApiDomainRoleFeaturesRoleIdFeatures,
  postApiDomainRoleFeaturesRoleIdFeaturesFeatureId,
  deleteApiDomainRoleFeaturesRoleIdFeaturesFeatureId,
} as const;

