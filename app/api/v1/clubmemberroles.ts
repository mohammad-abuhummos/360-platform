import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubMemberRoles
 */

export function getApiClubsClubIdMembersUserIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

export function putApiClubsClubIdMembersUserIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

export function patchApiClubsClubIdMembersUserIdRoles(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/members/{userId}/roles",
    ...options,
  });
}

export function deleteApiClubsClubIdMembersUserIdRolesDomainRoleId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string; domainRoleId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/members/{userId}/roles/{domainRoleId}",
    ...options,
  });
}

export const clubMemberRolesApi = {
  getApiClubsClubIdMembersUserIdRoles,
  postApiClubsClubIdMembersUserIdRoles,
  putApiClubsClubIdMembersUserIdRoles,
  patchApiClubsClubIdMembersUserIdRoles,
  deleteApiClubsClubIdMembersUserIdRolesDomainRoleId,
} as const;

