// Auto-generated client for tag "TrainingSessions".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [TrainingSessions] DELETE /api/training/sessions/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiTrainingSessionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/training/sessions/{id}",
    ...options,
  });
}

/**
 * [TrainingSessions] GET /api/training/sessions
 * Query params: sportType, clubId, includeSystem
 * Responses: 200
 */
export function getApiTrainingSessions(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/sessions",
    ...options,
  });
}

/**
 * [TrainingSessions] GET /api/training/sessions/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiTrainingSessionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/sessions/{id}",
    ...options,
  });
}

/**
 * [TrainingSessions] POST /api/training/sessions
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiTrainingSessions(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/training/sessions",
    ...options,
  });
}

/**
 * [TrainingSessions] PUT /api/training/sessions/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiTrainingSessionsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/training/sessions/{id}",
    ...options,
  });
}

export const TrainingSessionsApi = {
  deleteApiTrainingSessionsId,
  getApiTrainingSessions,
  getApiTrainingSessionsId,
  postApiTrainingSessions,
  putApiTrainingSessionsId,
} as const;

