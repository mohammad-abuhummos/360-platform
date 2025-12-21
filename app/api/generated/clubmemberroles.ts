// Auto-generated client for tag "ClubMemberRoles".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubMemberRoles] DELETE /api/clubs/{clubId}/members/{userId}/roles/{domainRoleId}
 * Path params: clubId, userId, domainRoleId
 * Responses: 200
 */
export function deleteApiClubsClubIdMembersUserIdRolesDomainRoleId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/members/{userId}/roles/{domainRoleId}",
    ...options,
  });
}

/**
 * [ClubMemberRoles] GET /api/clubs/{clubId}/members/{userId}/roles
 * Path params: clubId, userId
 * Responses: 200
 */
export function getApiClubsClubIdMembersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

/**
 * [ClubMemberRoles] PATCH /api/clubs/{clubId}/members/{userId}/roles
 * Path params: clubId, userId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiClubsClubIdMembersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

/**
 * [ClubMemberRoles] POST /api/clubs/{clubId}/members/{userId}/roles
 * Path params: clubId, userId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdMembersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

/**
 * [ClubMemberRoles] PUT /api/clubs/{clubId}/members/{userId}/roles
 * Path params: clubId, userId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdMembersUserIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

export const ClubMemberRolesApi = {
  deleteApiClubsClubIdMembersUserIdRolesDomainRoleId,
  getApiClubsClubIdMembersUserIdRoles,
  patchApiClubsClubIdMembersUserIdRoles,
  postApiClubsClubIdMembersUserIdRoles,
  putApiClubsClubIdMembersUserIdRoles,
} as const;

