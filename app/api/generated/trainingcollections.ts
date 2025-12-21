// Auto-generated client for tag "TrainingCollections".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [TrainingCollections] DELETE /api/training/collections/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiTrainingCollectionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/training/collections/{id}",
    ...options,
  });
}

/**
 * [TrainingCollections] GET /api/training/collections
 * Query params: sportType, clubId, visibility, includeSystem
 * Responses: 200
 */
export function getApiTrainingCollections(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/collections",
    ...options,
  });
}

/**
 * [TrainingCollections] GET /api/training/collections/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiTrainingCollectionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/collections/{id}",
    ...options,
  });
}

/**
 * [TrainingCollections] POST /api/training/collections
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiTrainingCollections(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/training/collections",
    ...options,
  });
}

/**
 * [TrainingCollections] PUT /api/training/collections/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiTrainingCollectionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/training/collections/{id}",
    ...options,
  });
}

export const TrainingCollectionsApi = {
  deleteApiTrainingCollectionsId,
  getApiTrainingCollections,
  getApiTrainingCollectionsId,
  postApiTrainingCollections,
  putApiTrainingCollectionsId,
} as const;

