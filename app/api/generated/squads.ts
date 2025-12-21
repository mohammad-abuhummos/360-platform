// Auto-generated client for tag "Squads".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Squads] GET /api/groups/{groupId}/squads
 * Path params: groupId
 * Responses: 200
 */
export function getApiGroupsGroupIdSquads(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/squads",
    ...options,
  });
}

/**
 * [Squads] GET /api/groups/{groupId}/squads/{id}
 * Path params: groupId, id
 * Responses: 200
 */
export function getApiGroupsGroupIdSquadsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/squads/{id}",
    ...options,
  });
}

/**
 * [Squads] POST /api/groups/{groupId}/squads
 * Path params: groupId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiGroupsGroupIdSquads(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/squads",
    ...options,
  });
}

export const SquadsApi = {
  getApiGroupsGroupIdSquads,
  getApiGroupsGroupIdSquadsId,
  postApiGroupsGroupIdSquads,
} as const;

