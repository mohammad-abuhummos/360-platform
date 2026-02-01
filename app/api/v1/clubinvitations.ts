import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubInvitations
 */

export function postApiClubsInvitesClubIdRegenerate(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/invites/{clubId}/regenerate",
    ...options,
  });
}

export function getApiClubsInvitesVerifyInviteCode(
  options: TemplateApiRequestOptions & { pathParams: { inviteCode: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/invites/verify/{inviteCode}",
    ...options,
  });
}

export function postApiClubsInvitesJoin(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/invites/join",
    ...options,
  });
}

export const clubInvitationsApi = {
  postApiClubsInvitesClubIdRegenerate,
  getApiClubsInvitesVerifyInviteCode,
  postApiClubsInvitesJoin,
} as const;

