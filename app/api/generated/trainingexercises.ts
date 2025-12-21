// Auto-generated client for tag "TrainingExercises".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [TrainingExercises] DELETE /api/training/exercises/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiTrainingExercisesId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/training/exercises/{id}",
    ...options,
  });
}

/**
 * [TrainingExercises] GET /api/training/exercises
 * Query params: sportType, clubId, includeSystem
 * Responses: 200
 */
export function getApiTrainingExercises(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/exercises",
    ...options,
  });
}

/**
 * [TrainingExercises] GET /api/training/exercises/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiTrainingExercisesId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/exercises/{id}",
    ...options,
  });
}

/**
 * [TrainingExercises] POST /api/training/exercises
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiTrainingExercises(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/training/exercises",
    ...options,
  });
}

/**
 * [TrainingExercises] PUT /api/training/exercises/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiTrainingExercisesId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/training/exercises/{id}",
    ...options,
  });
}

export const TrainingExercisesApi = {
  deleteApiTrainingExercisesId,
  getApiTrainingExercises,
  getApiTrainingExercisesId,
  postApiTrainingExercises,
  putApiTrainingExercisesId,
} as const;

