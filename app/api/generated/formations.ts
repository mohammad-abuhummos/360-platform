// Auto-generated client for tag "Formations".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Formations] GET /api/groups/{groupId}/formations
 * Path params: groupId
 * Responses: 200
 */
export function getApiGroupsGroupIdFormations(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/formations",
    ...options,
  });
}

/**
 * [Formations] GET /api/groups/{groupId}/formations/{id}
 * Path params: groupId, id
 * Responses: 200
 */
export function getApiGroupsGroupIdFormationsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/formations/{id}",
    ...options,
  });
}

/**
 * [Formations] POST /api/groups/{groupId}/formations
 * Path params: groupId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiGroupsGroupIdFormations(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/formations",
    ...options,
  });
}

/**
 * [Formations] POST /api/groups/{groupId}/formations/from-template/{templateId}
 * Path params: groupId, templateId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiGroupsGroupIdFormationsFromTemplateTemplateId(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/formations/from-template/{templateId}",
    ...options,
  });
}

export const FormationsApi = {
  getApiGroupsGroupIdFormations,
  getApiGroupsGroupIdFormationsId,
  postApiGroupsGroupIdFormations,
  postApiGroupsGroupIdFormationsFromTemplateTemplateId,
} as const;

