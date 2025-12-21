// Auto-generated client for tag "Sports".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Sports] DELETE /api/sports/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiSportsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/sports/{id}",
    ...options,
  });
}

/**
 * [Sports] GET /api/sports
 * Responses: 200
 */
export function getApiSports(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/sports",
    ...options,
  });
}

/**
 * [Sports] GET /api/sports/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiSportsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/sports/{id}",
    ...options,
  });
}

/**
 * [Sports] PATCH /api/sports/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiSportsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/sports/{id}",
    ...options,
  });
}

/**
 * [Sports] POST /api/sports
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiSports(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/sports",
    ...options,
  });
}

/**
 * [Sports] PUT /api/sports/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiSportsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/sports/{id}",
    ...options,
  });
}

export const SportsApi = {
  deleteApiSportsId,
  getApiSports,
  getApiSportsId,
  patchApiSportsId,
  postApiSports,
  putApiSportsId,
} as const;

