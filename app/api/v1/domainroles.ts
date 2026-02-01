import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: DomainRoles
 */

export function getApiDomainRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/domain-roles",
    ...options,
  });
}

export function postApiDomainRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-roles",
    ...options,
  });
}

export function getApiDomainRolesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

export function putApiDomainRolesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

export function deleteApiDomainRolesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/domain-roles/{id}",
    ...options,
  });
}

export function postApiDomainRolesDefaultsSync(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/domain-roles/defaults/sync",
    ...options,
  });
}

export function postApiDomainRolesIdDefaultsRestore(
  options: TemplateApiRequestOptions & { pathParams: { id: string } }
) {
  return request({
    method: "POST",
    path: "/api/domain-roles/{id}/defaults:restore",
    ...options,
  });
}

export const domainRolesApi = {
  getApiDomainRoles,
  postApiDomainRoles,
  getApiDomainRolesId,
  putApiDomainRolesId,
  deleteApiDomainRolesId,
  postApiDomainRolesDefaultsSync,
  postApiDomainRolesIdDefaultsRestore,
} as const;

