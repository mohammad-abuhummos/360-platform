import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Reservations
 */

export function postApiResourcesResourceIdReservations(
  options: TemplateApiRequestOptions & { pathParams: { resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/resources/{resourceId}/reservations",
    ...options,
  });
}

export function getApiResourcesResourceIdReservations(
  options: TemplateApiRequestOptions & { pathParams: { resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/resources/{resourceId}/reservations",
    ...options,
  });
}

export function getApiReservationsReservationId(
  options: TemplateApiRequestOptions & { pathParams: { reservationId: string } }
) {
  return request({
    method: "GET",
    path: "/api/reservations/{reservationId}",
    ...options,
  });
}

export function patchApiReservationsReservationId(
  options: TemplateApiRequestOptions & { pathParams: { reservationId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/reservations/{reservationId}",
    ...options,
  });
}

export function deleteApiReservationsReservationId(
  options: TemplateApiRequestOptions & { pathParams: { reservationId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/reservations/{reservationId}",
    ...options,
  });
}

export function postApiReservationsReservationIdConfirm(
  options: TemplateApiRequestOptions & { pathParams: { reservationId: string } }
) {
  return request({
    method: "POST",
    path: "/api/reservations/{reservationId}/confirm",
    ...options,
  });
}

export const reservationsApi = {
  postApiResourcesResourceIdReservations,
  getApiResourcesResourceIdReservations,
  getApiReservationsReservationId,
  patchApiReservationsReservationId,
  deleteApiReservationsReservationId,
  postApiReservationsReservationIdConfirm,
} as const;

