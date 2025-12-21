// Auto-generated client for tag "Features".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Features] DELETE /api/features/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiFeaturesId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/features/{id}",
    ...options,
  });
}

/**
 * [Features] GET /api/features
 * Responses: 200
 */
export function getApiFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/features",
    ...options,
  });
}

/**
 * [Features] GET /api/features/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiFeaturesId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/features/{id}",
    ...options,
  });
}

/**
 * [Features] PATCH /api/features/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiFeaturesId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/features/{id}",
    ...options,
  });
}

/**
 * [Features] POST /api/features
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiFeatures(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/features",
    ...options,
  });
}

/**
 * [Features] PUT /api/features/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiFeaturesId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/features/{id}",
    ...options,
  });
}

export const FeaturesApi = {
  deleteApiFeaturesId,
  getApiFeatures,
  getApiFeaturesId,
  patchApiFeaturesId,
  postApiFeatures,
  putApiFeaturesId,
} as const;

