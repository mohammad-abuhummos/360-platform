// Auto-generated client for tag "UserClubs".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [UserClubs] DELETE /api/user-clubs/unassign
 * Query params: userId, clubId
 * Responses: 200
 */
export function deleteApiUserClubsUnassign(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-clubs/unassign",
    ...options,
  });
}

/**
 * [UserClubs] GET /api/user-clubs/{userId}
 * Path params: userId
 * Responses: 200
 */
export function getApiUserClubsUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-clubs/{userId}",
    ...options,
  });
}

/**
 * [UserClubs] POST /api/user-clubs/assign
 * Query params: userId, clubId
 * Responses: 200
 */
export function postApiUserClubsAssign(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-clubs/assign",
    ...options,
  });
}

export const UserClubsApi = {
  deleteApiUserClubsUnassign,
  getApiUserClubsUserId,
  postApiUserClubsAssign,
} as const;

