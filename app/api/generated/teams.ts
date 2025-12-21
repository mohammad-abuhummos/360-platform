// Auto-generated client for tag "Teams".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Teams] DELETE /api/teams/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiTeamsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/teams/{id}",
    ...options,
  });
}

/**
 * [Teams] GET /api/teams
 * Responses: 200
 */
export function getApiTeams(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/teams",
    ...options,
  });
}

/**
 * [Teams] GET /api/teams/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiTeamsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/teams/{id}",
    ...options,
  });
}

/**
 * [Teams] PATCH /api/teams/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiTeamsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/teams/{id}",
    ...options,
  });
}

/**
 * [Teams] POST /api/teams
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiTeams(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/teams",
    ...options,
  });
}

/**
 * [Teams] PUT /api/teams/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiTeamsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/teams/{id}",
    ...options,
  });
}

export const TeamsApi = {
  deleteApiTeamsId,
  getApiTeams,
  getApiTeamsId,
  patchApiTeamsId,
  postApiTeams,
  putApiTeamsId,
} as const;

