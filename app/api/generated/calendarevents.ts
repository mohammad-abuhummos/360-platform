// Auto-generated client for tag "CalendarEvents".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [CalendarEvents] DELETE /api/clubs/{clubId}/calendar/events/{eventId}
 * Path params: clubId, eventId
 * Responses: 200
 */
export function deleteApiClubsClubIdCalendarEventsEventId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/calendar/me/events
 * Query params: startUtc, endUtc
 * Responses: 200
 */
export function getApiCalendarMeEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/calendar/me/events",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/clubs/{clubId}/calendar/events
 * Path params: clubId
 * Query params: startUtc, endUtc, resourceId, eventType, ownerType, ownerId, includeChildren
 * Responses: 200
 */
export function getApiClubsClubIdCalendarEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/clubs/{clubId}/calendar/events/{eventId}
 * Path params: clubId, eventId
 * Responses: 200
 */
export function getApiClubsClubIdCalendarEventsEventId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/clubs/{clubId}/groups/{groupId}/calendar/events
 * Path params: clubId, groupId
 * Query params: startUtc, endUtc, resourceId, eventType
 * Responses: 200
 */
export function getApiClubsClubIdGroupsGroupIdCalendarEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/groups/{groupId}/calendar/events",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/clubs/{clubId}/members/{userId}/calendar/events
 * Path params: clubId, userId
 * Query params: startUtc, endUtc
 * Responses: 200
 */
export function getApiClubsClubIdMembersUserIdCalendarEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/calendar/events",
    ...options,
  });
}

/**
 * [CalendarEvents] GET /api/clubs/{clubId}/sports/{sportId}/calendar/events
 * Path params: clubId, sportId
 * Query params: startUtc, endUtc, resourceId, eventType, includeGroups
 * Responses: 200
 */
export function getApiClubsClubIdSportsSportIdCalendarEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/sports/{sportId}/calendar/events",
    ...options,
  });
}

/**
 * [CalendarEvents] POST /api/clubs/{clubId}/calendar/events
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdCalendarEvents(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/events",
    ...options,
  });
}

/**
 * [CalendarEvents] PUT /api/clubs/{clubId}/calendar/events/{eventId}
 * Path params: clubId, eventId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdCalendarEventsEventId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}",
    ...options,
  });
}

export const CalendarEventsApi = {
  deleteApiClubsClubIdCalendarEventsEventId,
  getApiCalendarMeEvents,
  getApiClubsClubIdCalendarEvents,
  getApiClubsClubIdCalendarEventsEventId,
  getApiClubsClubIdGroupsGroupIdCalendarEvents,
  getApiClubsClubIdMembersUserIdCalendarEvents,
  getApiClubsClubIdSportsSportIdCalendarEvents,
  postApiClubsClubIdCalendarEvents,
  putApiClubsClubIdCalendarEventsEventId,
} as const;

