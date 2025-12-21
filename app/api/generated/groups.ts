// Auto-generated client for tag "Groups".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Groups] DELETE /api/groups/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiGroupsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/groups/{id}",
    ...options,
  });
}

/**
 * [Groups] GET /api/groups
 * Query params: sportId, parentId
 * Responses: 200
 */
export function getApiGroups(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups",
    ...options,
  });
}

/**
 * [Groups] GET /api/groups/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiGroupsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{id}",
    ...options,
  });
}

/**
 * [Groups] GET /api/groups/{id}/tree
 * Path params: id
 * Responses: 200
 */
export function getApiGroupsIdTree(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{id}/tree",
    ...options,
  });
}

/**
 * [Groups] PATCH /api/groups/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiGroupsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/groups/{id}",
    ...options,
  });
}

/**
 * [Groups] POST /api/groups
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiGroups(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/groups",
    ...options,
  });
}

/**
 * [Groups] PUT /api/groups/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiGroupsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/groups/{id}",
    ...options,
  });
}

export const GroupsApi = {
  deleteApiGroupsId,
  getApiGroups,
  getApiGroupsId,
  getApiGroupsIdTree,
  patchApiGroupsId,
  postApiGroups,
  putApiGroupsId,
} as const;

