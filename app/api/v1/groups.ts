import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Groups
 */

export function getApiGroups(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups",
    ...options,
  });
}

export function postApiGroups(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/groups",
    ...options,
  });
}

export function getApiGroupsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/groups/{id}",
    ...options,
  });
}

export function putApiGroupsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/groups/{id}",
    ...options,
  });
}

export function patchApiGroupsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/groups/{id}",
    ...options,
  });
}

export function deleteApiGroupsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/groups/{id}",
    ...options,
  });
}

export function getApiGroupsIdTree(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/groups/{id}/tree",
    ...options,
  });
}

export const groupsApi = {
  getApiGroups,
  postApiGroups,
  getApiGroupsId,
  putApiGroupsId,
  patchApiGroupsId,
  deleteApiGroupsId,
  getApiGroupsIdTree,
} as const;

