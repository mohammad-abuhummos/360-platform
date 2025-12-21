// Auto-generated client for tag "ClubMembers".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubMembers] DELETE /api/clubs/{clubId}/members/{userId}
 * Path params: clubId, userId
 * Responses: 200
 */
export function deleteApiClubsClubIdMembersUserId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/members/{userId}",
    ...options,
  });
}

/**
 * [ClubMembers] GET /api/clubs/{clubId}/members
 * Path params: clubId
 * Query params: status
 * Responses: 200
 */
export function getApiClubsClubIdMembers(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members",
    ...options,
  });
}

/**
 * [ClubMembers] GET /api/clubs/{clubId}/members/audit
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubIdMembersAudit(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/audit",
    ...options,
  });
}

/**
 * [ClubMembers] GET /api/clubs/{clubId}/members/{userId}/profile
 * Path params: clubId, userId
 * Responses: 200
 */
export function getApiClubsClubIdMembersUserIdProfile(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/profile",
    ...options,
  });
}

/**
 * [ClubMembers] POST /api/clubs/{clubId}/members/{userId}/approve
 * Path params: clubId, userId
 * Responses: 200
 */
export function postApiClubsClubIdMembersUserIdApprove(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/approve",
    ...options,
  });
}

/**
 * [ClubMembers] POST /api/clubs/{clubId}/members/{userId}/reject
 * Path params: clubId, userId
 * Responses: 200
 */
export function postApiClubsClubIdMembersUserIdReject(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/reject",
    ...options,
  });
}

export const ClubMembersApi = {
  deleteApiClubsClubIdMembersUserId,
  getApiClubsClubIdMembers,
  getApiClubsClubIdMembersAudit,
  getApiClubsClubIdMembersUserIdProfile,
  postApiClubsClubIdMembersUserIdApprove,
  postApiClubsClubIdMembersUserIdReject,
} as const;

