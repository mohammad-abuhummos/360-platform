// Auto-generated client for tag "Matches".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Matches] DELETE /api/matches/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiMatchesId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/matches/{id}",
    ...options,
  });
}

/**
 * [Matches] GET /api/matches
 * Responses: 200
 */
export function getApiMatches(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/matches",
    ...options,
  });
}

/**
 * [Matches] GET /api/matches/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiMatchesId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/matches/{id}",
    ...options,
  });
}

/**
 * [Matches] POST /api/matches
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatches(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches",
    ...options,
  });
}

/**
 * [Matches] PUT /api/matches/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiMatchesId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/matches/{id}",
    ...options,
  });
}

export const MatchesApi = {
  deleteApiMatchesId,
  getApiMatches,
  getApiMatchesId,
  postApiMatches,
  putApiMatchesId,
} as const;

