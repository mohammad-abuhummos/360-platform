import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceTypes
 */

export function getApiResourceTypes(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/resource-types",
    ...options,
  });
}

export function postApiResourceTypes(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/resource-types",
    ...options,
  });
}

export function getApiResourceTypesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/resource-types/{id}",
    ...options,
  });
}

export function putApiResourceTypesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/resource-types/{id}",
    ...options,
  });
}

export function patchApiResourceTypesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/resource-types/{id}",
    ...options,
  });
}

export function deleteApiResourceTypesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/resource-types/{id}",
    ...options,
  });
}

export const resourceTypesApi = {
  getApiResourceTypes,
  postApiResourceTypes,
  getApiResourceTypesId,
  putApiResourceTypesId,
  patchApiResourceTypesId,
  deleteApiResourceTypesId,
} as const;

