// Auto-generated client for tag "ClubInvitations".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubInvitations] GET /api/clubs/invites/verify/{inviteCode}
 * Path params: inviteCode
 * Responses: 200
 */
export function getApiClubsInvitesVerifyInviteCode(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/invites/verify/{inviteCode}",
    ...options,
  });
}

/**
 * [ClubInvitations] POST /api/clubs/invites/{clubId}/regenerate
 * Path params: clubId
 * Responses: 200
 */
export function postApiClubsInvitesClubIdRegenerate(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/invites/{clubId}/regenerate",
    ...options,
  });
}

/**
 * [ClubInvitations] POST /api/clubs/invites/join
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsInvitesJoin(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/invites/join",
    ...options,
  });
}

export const ClubInvitationsApi = {
  getApiClubsInvitesVerifyInviteCode,
  postApiClubsInvitesClubIdRegenerate,
  postApiClubsInvitesJoin,
} as const;

