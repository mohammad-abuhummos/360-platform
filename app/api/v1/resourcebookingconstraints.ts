import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceBookingConstraints
 */

export function getApiClubsClubIdResourceBookingConstraints(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resource-booking-constraints",
    ...options,
  });
}

export function postApiClubsClubIdResourceBookingConstraints(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resource-booking-constraints",
    ...options,
  });
}

export function putApiClubsClubIdResourceBookingConstraintsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resource-booking-constraints/{id}",
    ...options,
  });
}

export function patchApiClubsClubIdResourceBookingConstraintsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resource-booking-constraints/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourceBookingConstraintsId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resource-booking-constraints/{id}",
    ...options,
  });
}

export const resourceBookingConstraintsApi = {
  getApiClubsClubIdResourceBookingConstraints,
  postApiClubsClubIdResourceBookingConstraints,
  putApiClubsClubIdResourceBookingConstraintsId,
  patchApiClubsClubIdResourceBookingConstraintsId,
  deleteApiClubsClubIdResourceBookingConstraintsId,
} as const;

