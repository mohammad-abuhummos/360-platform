// Auto-generated client for tag "ClubResources".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubResources] DELETE /api/clubs/{clubId}/resources/{resourceId}
 * Path params: clubId, resourceId
 * Responses: 200
 */
export function deleteApiClubsClubIdResourcesResourceId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

/**
 * [ClubResources] GET /api/clubs/{clubId}/resources
 * Path params: clubId
 * Query params: includeInactive
 * Responses: 200
 */
export function getApiClubsClubIdResources(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources",
    ...options,
  });
}

/**
 * [ClubResources] GET /api/clubs/{clubId}/resources/{resourceId}
 * Path params: clubId, resourceId
 * Responses: 200
 */
export function getApiClubsClubIdResourcesResourceId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

/**
 * [ClubResources] PATCH /api/clubs/{clubId}/resources/{resourceId}
 * Path params: clubId, resourceId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiClubsClubIdResourcesResourceId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

/**
 * [ClubResources] POST /api/clubs/{clubId}/resources
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdResources(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources",
    ...options,
  });
}

/**
 * [ClubResources] PUT /api/clubs/{clubId}/resources/{resourceId}
 * Path params: clubId, resourceId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdResourcesResourceId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

export const ClubResourcesApi = {
  deleteApiClubsClubIdResourcesResourceId,
  getApiClubsClubIdResources,
  getApiClubsClubIdResourcesResourceId,
  patchApiClubsClubIdResourcesResourceId,
  postApiClubsClubIdResources,
  putApiClubsClubIdResourcesResourceId,
} as const;

