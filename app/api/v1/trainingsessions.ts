import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: TrainingSessions
 */

export function getApiClubsClubIdTrainingSessions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/sessions",
    ...options,
  });
}

export function postApiClubsClubIdTrainingSessions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/training/sessions",
    ...options,
  });
}

export function getApiClubsClubIdTrainingSessionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/sessions/{id}",
    ...options,
  });
}

export function putApiClubsClubIdTrainingSessionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/training/sessions/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdTrainingSessionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/training/sessions/{id}",
    ...options,
  });
}

export const trainingSessionsApi = {
  getApiClubsClubIdTrainingSessions,
  postApiClubsClubIdTrainingSessions,
  getApiClubsClubIdTrainingSessionsId,
  putApiClubsClubIdTrainingSessionsId,
  deleteApiClubsClubIdTrainingSessionsId,
} as const;

