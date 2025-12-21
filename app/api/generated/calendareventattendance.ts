// Auto-generated client for tag "CalendarEventAttendance".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [CalendarEventAttendance] GET /api/clubs/{clubId}/calendar/events/{eventId}/attendance
 * Path params: clubId, eventId
 * Query params: status
 * Responses: 200
 */
export function getApiClubsClubIdCalendarEventsEventIdAttendance(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}/attendance",
    ...options,
  });
}

/**
 * [CalendarEventAttendance] GET /api/clubs/{clubId}/users/{userId}/attendance
 * Path params: clubId, userId
 * Query params: status, take
 * Responses: 200
 */
export function getApiClubsClubIdUsersUserIdAttendance(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/users/{userId}/attendance",
    ...options,
  });
}

/**
 * [CalendarEventAttendance] POST /api/clubs/{clubId}/calendar/events/{eventId}/attendance
 * Path params: clubId, eventId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdCalendarEventsEventIdAttendance(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/events/{eventId}/attendance",
    ...options,
  });
}

export const CalendarEventAttendanceApi = {
  getApiClubsClubIdCalendarEventsEventIdAttendance,
  getApiClubsClubIdUsersUserIdAttendance,
  postApiClubsClubIdCalendarEventsEventIdAttendance,
} as const;

