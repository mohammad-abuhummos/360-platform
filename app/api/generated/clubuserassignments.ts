// Auto-generated client for tag "ClubUserAssignments".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/club/{clubId}/user/{userId}/roles/{domainRoleId}
 * Path params: clubId, userId, domainRoleId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubClubIdUserUserIdRolesDomainRoleId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/club/{clubId}/user/{userId}/roles/{domainRoleId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/groups/{groupId}/roles/{domainRoleId}/users/{userId}
 * Path params: clubId, groupId, domainRoleId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdGroupsGroupIdRolesDomainRoleIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/groups/{groupId}/users/{userId}
 * Path params: clubId, groupId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdGroupsGroupIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/sports/{sportId}/roles/{domainRoleId}/users/{userId}
 * Path params: clubId, sportId, domainRoleId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdSportsSportIdRolesDomainRoleIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/sports/{sportId}/users/{userId}
 * Path params: clubId, sportId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdSportsSportIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/teams/{teamId}/roles/{domainRoleId}/users/{userId}
 * Path params: clubId, teamId, domainRoleId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdTeamsTeamIdRolesDomainRoleIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] DELETE /api/user-assignments/clubs/{clubId}/teams/{teamId}/users/{userId}
 * Path params: clubId, teamId, userId
 * Responses: 200
 */
export function deleteApiUserAssignmentsClubsClubIdTeamsTeamIdUsersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/users/{userId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] GET /api/user-assignments/club/{clubId}
 * Path params: clubId
 * Responses: 200
 */
export function getApiUserAssignmentsClubClubId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-assignments/club/{clubId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] GET /api/user-assignments/clubs/{clubId}/assignment-tree
 * Path params: clubId
 * Responses: 200
 */
export function getApiUserAssignmentsClubsClubIdAssignmentTree(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-assignments/clubs/{clubId}/assignment-tree",
    ...options,
  });
}

/**
 * [ClubUserAssignments] GET /api/user-assignments/clubs/{clubId}/assignment-tree/me
 * Path params: clubId
 * Responses: 200
 */
export function getApiUserAssignmentsClubsClubIdAssignmentTreeMe(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/user-assignments/clubs/{clubId}/assignment-tree/me",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/club
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClub(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/club",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/groups/{groupId}
 * Path params: clubId, groupId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdGroupsGroupId(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/groups/{groupId}/roles
 * Path params: clubId, groupId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdGroupsGroupIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/roles",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/sports/{sportId}
 * Path params: clubId, sportId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdSportsSportId(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/sports/{sportId}/roles
 * Path params: clubId, sportId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdSportsSportIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/roles",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/teams/{teamId}
 * Path params: clubId, teamId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdTeamsTeamId(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}",
    ...options,
  });
}

/**
 * [ClubUserAssignments] POST /api/user-assignments/clubs/{clubId}/teams/{teamId}/roles
 * Path params: clubId, teamId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiUserAssignmentsClubsClubIdTeamsTeamIdRoles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/roles",
    ...options,
  });
}

export const ClubUserAssignmentsApi = {
  deleteApiUserAssignmentsClubClubIdUserUserIdRolesDomainRoleId,
  deleteApiUserAssignmentsClubsClubIdGroupsGroupIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdGroupsGroupIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdSportsSportIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdSportsSportIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdTeamsTeamIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdTeamsTeamIdUsersUserId,
  getApiUserAssignmentsClubClubId,
  getApiUserAssignmentsClubsClubIdAssignmentTree,
  getApiUserAssignmentsClubsClubIdAssignmentTreeMe,
  postApiUserAssignmentsClub,
  postApiUserAssignmentsClubsClubIdGroupsGroupId,
  postApiUserAssignmentsClubsClubIdGroupsGroupIdRoles,
  postApiUserAssignmentsClubsClubIdSportsSportId,
  postApiUserAssignmentsClubsClubIdSportsSportIdRoles,
  postApiUserAssignmentsClubsClubIdTeamsTeamId,
  postApiUserAssignmentsClubsClubIdTeamsTeamIdRoles,
} as const;

