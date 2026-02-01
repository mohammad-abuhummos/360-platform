import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SystemRoleFeatures
 */

export function getApiRoleFeatures(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/role-features",
    ...options,
  });
}

export function getApiRoleFeaturesRoleId(options: TemplateApiRequestOptions & { pathParams: { roleId: string } }) {
  return request({
    method: "GET",
    path: "/api/role-features/{roleId}",
    ...options,
  });
}

export function postApiRoleFeaturesAssign(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/role-features/assign",
    ...options,
  });
}

export function postApiRoleFeaturesRemove(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/role-features/remove",
    ...options,
  });
}

export function putApiRoleFeaturesRoleIdReplace(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/role-features/{roleId}/replace",
    ...options,
  });
}

export function patchApiRoleFeaturesRoleIdReplace(
  options: TemplateApiRequestOptions & { pathParams: { roleId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/role-features/{roleId}/replace",
    ...options,
  });
}

export const systemRoleFeaturesApi = {
  getApiRoleFeatures,
  getApiRoleFeaturesRoleId,
  postApiRoleFeaturesAssign,
  postApiRoleFeaturesRemove,
  putApiRoleFeaturesRoleIdReplace,
  patchApiRoleFeaturesRoleIdReplace,
} as const;

