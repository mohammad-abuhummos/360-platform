import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: UserClubs
 */

export function postApiUserClubsAssign(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-clubs/assign",
    ...options,
  });
}

export function deleteApiUserClubsUnassign(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-clubs/unassign",
    ...options,
  });
}

export function getApiUserClubsMe(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-clubs/me",
    ...options,
  });
}

export function getApiUserClubsUserId(options: TemplateApiRequestOptions & { pathParams: { userId: string } }) {
  return request({
    method: "GET",
    path: "/api/user-clubs/{userId}",
    ...options,
  });
}

export const userClubsApi = {
  postApiUserClubsAssign,
  deleteApiUserClubsUnassign,
  getApiUserClubsMe,
  getApiUserClubsUserId,
} as const;

