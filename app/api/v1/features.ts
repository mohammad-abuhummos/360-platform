import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Features
 */

export function getApiFeatures(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/features",
    ...options,
  });
}

export function postApiFeatures(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/features",
    ...options,
  });
}

export function getApiFeaturesDomainRoles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/features/domain-roles",
    ...options,
  });
}

export function getApiFeaturesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/features/{id}",
    ...options,
  });
}

export function putApiFeaturesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/features/{id}",
    ...options,
  });
}

export function patchApiFeaturesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/features/{id}",
    ...options,
  });
}

export function deleteApiFeaturesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/features/{id}",
    ...options,
  });
}

export const featuresApi = {
  getApiFeatures,
  postApiFeatures,
  getApiFeaturesDomainRoles,
  getApiFeaturesId,
  putApiFeaturesId,
  patchApiFeaturesId,
  deleteApiFeaturesId,
} as const;

