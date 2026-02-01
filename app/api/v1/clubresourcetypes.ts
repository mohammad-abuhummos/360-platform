import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubResourceTypes
 */

export function getApiClubsClubIdResourceTypes(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resource-types",
    ...options,
  });
}

export function postApiClubsClubIdResourceTypes(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resource-types",
    ...options,
  });
}

export function deleteApiClubsClubIdResourceTypesResourceTypeId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceTypeId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resource-types/{resourceTypeId}",
    ...options,
  });
}

export const clubResourceTypesApi = {
  getApiClubsClubIdResourceTypes,
  postApiClubsClubIdResourceTypes,
  deleteApiClubsClubIdResourceTypesResourceTypeId,
} as const;

