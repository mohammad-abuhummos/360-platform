// Auto-generated client for tag "ClubCalendars".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubCalendars] GET /api/clubs/{clubId}/calendar
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubIdCalendar(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

/**
 * [ClubCalendars] PATCH /api/clubs/{clubId}/calendar
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiClubsClubIdCalendar(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

/**
 * [ClubCalendars] PUT /api/clubs/{clubId}/calendar
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdCalendar(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

export const ClubCalendarsApi = {
  getApiClubsClubIdCalendar,
  patchApiClubsClubIdCalendar,
  putApiClubsClubIdCalendar,
} as const;

