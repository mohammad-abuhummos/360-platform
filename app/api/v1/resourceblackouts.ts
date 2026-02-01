import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceBlackouts
 */

export function getApiClubsClubIdResourceBlackouts(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resource-blackouts",
    ...options,
  });
}

export function postApiClubsClubIdResourceBlackouts(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resource-blackouts",
    ...options,
  });
}

export function putApiClubsClubIdResourceBlackoutsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resource-blackouts/{id}",
    ...options,
  });
}

export function patchApiClubsClubIdResourceBlackoutsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resource-blackouts/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourceBlackoutsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resource-blackouts/{id}",
    ...options,
  });
}

export const resourceBlackoutsApi = {
  getApiClubsClubIdResourceBlackouts,
  postApiClubsClubIdResourceBlackouts,
  putApiClubsClubIdResourceBlackoutsId,
  patchApiClubsClubIdResourceBlackoutsId,
  deleteApiClubsClubIdResourceBlackoutsId,
} as const;

