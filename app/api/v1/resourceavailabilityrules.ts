import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceAvailabilityRules
 */

export function getApiClubsClubIdResourceAvailability(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resource-availability",
    ...options,
  });
}

export function postApiClubsClubIdResourceAvailability(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resource-availability",
    ...options,
  });
}

export function putApiClubsClubIdResourceAvailabilityId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resource-availability/{id}",
    ...options,
  });
}

export function patchApiClubsClubIdResourceAvailabilityId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resource-availability/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourceAvailabilityId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resource-availability/{id}",
    ...options,
  });
}

export const resourceAvailabilityRulesApi = {
  getApiClubsClubIdResourceAvailability,
  postApiClubsClubIdResourceAvailability,
  putApiClubsClubIdResourceAvailabilityId,
  patchApiClubsClubIdResourceAvailabilityId,
  deleteApiClubsClubIdResourceAvailabilityId,
} as const;

