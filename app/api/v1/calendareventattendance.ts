import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: CalendarEventAttendance
 */

export function getApiClubsClubIdCalendarEventsEventIdAttendance(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; eventId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}/attendance",
    ...options,
  });
}

export function postApiClubsClubIdCalendarEventsEventIdAttendance(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; eventId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}/attendance",
    ...options,
  });
}

export function getApiClubsClubIdUsersUserIdAttendance(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/users/{userId}/attendance",
    ...options,
  });
}

export const calendarEventAttendanceApi = {
  getApiClubsClubIdCalendarEventsEventIdAttendance,
  postApiClubsClubIdCalendarEventsEventIdAttendance,
  getApiClubsClubIdUsersUserIdAttendance,
} as const;

