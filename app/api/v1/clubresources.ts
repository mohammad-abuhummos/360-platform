import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubResources
 */

export function getApiClubsClubIdResources(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources",
    ...options,
  });
}

export function postApiClubsClubIdResources(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources",
    ...options,
  });
}

export function getApiClubsClubIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

export function putApiClubsClubIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

export function patchApiClubsClubIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourcesResourceId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resources/{resourceId}",
    ...options,
  });
}

export const clubResourcesApi = {
  getApiClubsClubIdResources,
  postApiClubsClubIdResources,
  getApiClubsClubIdResourcesResourceId,
  putApiClubsClubIdResourcesResourceId,
  patchApiClubsClubIdResourcesResourceId,
  deleteApiClubsClubIdResourcesResourceId,
} as const;

