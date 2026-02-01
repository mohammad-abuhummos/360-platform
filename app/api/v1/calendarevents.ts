import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: CalendarEvents
 */

export function getApiClubsClubIdCalendarEvents(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events",
    ...options,
  });
}

export function postApiClubsClubIdCalendarEvents(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/events",
    ...options,
  });
}

export function getApiClubsClubIdSportsSportIdCalendarEvents(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; sportId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/sports/{sportId}/calendar/events",
    ...options,
  });
}

export function getApiClubsClubIdGroupsGroupIdCalendarEvents(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; groupId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/groups/{groupId}/calendar/events",
    ...options,
  });
}

export function getApiClubsClubIdMembersUserIdCalendarEvents(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/calendar/events",
    ...options,
  });
}

export function getApiClubsClubIdCalendarMeEvents(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/me/events",
    ...options,
  });
}

export function getApiClubsClubIdCalendarEventsEventId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; eventId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

export function putApiClubsClubIdCalendarEventsEventId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; eventId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

export function deleteApiClubsClubIdCalendarEventsEventId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; eventId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

export function postApiClubsClubIdCalendarEventsValidateResourceBooking(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/events/validate-resource-booking",
    ...options,
  });
}

export const calendarEventsApi = {
  getApiClubsClubIdCalendarEvents,
  postApiClubsClubIdCalendarEvents,
  getApiClubsClubIdSportsSportIdCalendarEvents,
  getApiClubsClubIdGroupsGroupIdCalendarEvents,
  getApiClubsClubIdMembersUserIdCalendarEvents,
  getApiClubsClubIdCalendarMeEvents,
  getApiClubsClubIdCalendarEventsEventId,
  putApiClubsClubIdCalendarEventsEventId,
  deleteApiClubsClubIdCalendarEventsEventId,
  postApiClubsClubIdCalendarEventsValidateResourceBooking,
} as const;

