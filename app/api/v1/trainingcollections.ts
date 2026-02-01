import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: TrainingCollections
 */

export function getApiClubsClubIdTrainingCollections(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/collections",
    ...options,
  });
}

export function postApiClubsClubIdTrainingCollections(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/training/collections",
    ...options,
  });
}

export function getApiClubsClubIdTrainingCollectionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/training/collections/{id}",
    ...options,
  });
}

export function putApiClubsClubIdTrainingCollectionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/training/collections/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdTrainingCollectionsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/training/collections/{id}",
    ...options,
  });
}

export const trainingCollectionsApi = {
  getApiClubsClubIdTrainingCollections,
  postApiClubsClubIdTrainingCollections,
  getApiClubsClubIdTrainingCollectionsId,
  putApiClubsClubIdTrainingCollectionsId,
  deleteApiClubsClubIdTrainingCollectionsId,
} as const;

