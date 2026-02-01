import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubMembers
 */

export function getApiClubsClubIdMembers(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members",
    ...options,
  });
}

export function getApiClubsClubIdMembersUserIdProfile(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/profile",
    ...options,
  });
}

export function getApiClubsClubIdMembersUserIdGoals(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/goals",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdGoals(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/goals",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdApprove(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/approve",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdReject(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/reject",
    ...options,
  });
}

export function deleteApiClubsClubIdMembersUserId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/members/{userId}",
    ...options,
  });
}

export function getApiClubsClubIdMembersAudit(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/audit",
    ...options,
  });
}

export const clubMembersApi = {
  getApiClubsClubIdMembers,
  getApiClubsClubIdMembersUserIdProfile,
  getApiClubsClubIdMembersUserIdGoals,
  postApiClubsClubIdMembersUserIdGoals,
  postApiClubsClubIdMembersUserIdApprove,
  postApiClubsClubIdMembersUserIdReject,
  deleteApiClubsClubIdMembersUserId,
  getApiClubsClubIdMembersAudit,
} as const;

