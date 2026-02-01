import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubCalendars
 */

export function getApiClubsClubIdCalendar(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

export function putApiClubsClubIdCalendar(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

export function patchApiClubsClubIdCalendar(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/calendar",
    ...options,
  });
}

export const clubCalendarsApi = {
  getApiClubsClubIdCalendar,
  putApiClubsClubIdCalendar,
  patchApiClubsClubIdCalendar,
} as const;

