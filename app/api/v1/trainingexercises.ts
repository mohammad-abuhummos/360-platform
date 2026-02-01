import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: TrainingExercises
 */

export function getApiClubsClubIdTrainingExercises(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/exercises",
    ...options,
  });
}

export function postApiClubsClubIdTrainingExercises(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/training/exercises",
    ...options,
  });
}

export function getApiClubsClubIdTrainingExercisesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/exercises/{id}",
    ...options,
  });
}

export function putApiClubsClubIdTrainingExercisesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/training/exercises/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdTrainingExercisesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/training/exercises/{id}",
    ...options,
  });
}

export const trainingExercisesApi = {
  getApiClubsClubIdTrainingExercises,
  postApiClubsClubIdTrainingExercises,
  getApiClubsClubIdTrainingExercisesId,
  putApiClubsClubIdTrainingExercisesId,
  deleteApiClubsClubIdTrainingExercisesId,
} as const;

