import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubUserAssignments
 */

export function postApiUserAssignmentsClub(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/user-assignments/club",
    ...options,
  });
}

export function getApiUserAssignmentsClubClubId(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/user-assignments/club/{clubId}",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubClubIdUserUserIdRolesDomainRoleId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string; domainRoleId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/club/{clubId}/user/{userId}/roles/{domainRoleId}",
    ...options,
  });
}

export function getApiUserAssignmentsClubsClubIdAssignmentTree(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/user-assignments/clubs/{clubId}/assignment-tree",
    ...options,
  });
}

export function getApiUserAssignmentsClubsClubIdAssignmentTreeMe(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/user-assignments/clubs/{clubId}/assignment-tree/me",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdGroupsGroupId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; groupId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdGroupsGroupIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; groupId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/roles",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdGroupsGroupIdRolesDomainRoleIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; groupId: string; domainRoleId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdGroupsGroupIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; groupId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/groups/{groupId}/users/{userId}",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdSportsSportId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; sportId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdSportsSportIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; sportId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/roles",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdSportsSportIdRolesDomainRoleIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; sportId: string; domainRoleId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdSportsSportIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; sportId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/sports/{sportId}/users/{userId}",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdTeamsTeamId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; teamId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}",
    ...options,
  });
}

export function postApiUserAssignmentsClubsClubIdTeamsTeamIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; teamId: string } }
) {
  return request({
    method: "POST",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/roles",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdTeamsTeamIdRolesDomainRoleIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; teamId: string; domainRoleId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/roles/{domainRoleId}/users/{userId}",
    ...options,
  });
}

export function deleteApiUserAssignmentsClubsClubIdTeamsTeamIdUsersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; teamId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/user-assignments/clubs/{clubId}/teams/{teamId}/users/{userId}",
    ...options,
  });
}

export const clubUserAssignmentsApi = {
  postApiUserAssignmentsClub,
  getApiUserAssignmentsClubClubId,
  deleteApiUserAssignmentsClubClubIdUserUserIdRolesDomainRoleId,
  getApiUserAssignmentsClubsClubIdAssignmentTree,
  getApiUserAssignmentsClubsClubIdAssignmentTreeMe,
  postApiUserAssignmentsClubsClubIdGroupsGroupId,
  postApiUserAssignmentsClubsClubIdGroupsGroupIdRoles,
  deleteApiUserAssignmentsClubsClubIdGroupsGroupIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdGroupsGroupIdUsersUserId,
  postApiUserAssignmentsClubsClubIdSportsSportId,
  postApiUserAssignmentsClubsClubIdSportsSportIdRoles,
  deleteApiUserAssignmentsClubsClubIdSportsSportIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdSportsSportIdUsersUserId,
  postApiUserAssignmentsClubsClubIdTeamsTeamId,
  postApiUserAssignmentsClubsClubIdTeamsTeamIdRoles,
  deleteApiUserAssignmentsClubsClubIdTeamsTeamIdRolesDomainRoleIdUsersUserId,
  deleteApiUserAssignmentsClubsClubIdTeamsTeamIdUsersUserId,
} as const;

