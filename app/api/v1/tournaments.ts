import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Tournaments
 */

export function getApiClubsClubIdTournaments(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments",
    ...options,
  });
}

export function postApiClubsClubIdTournaments(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}",
    ...options,
  });
}

export function putApiClubsClubIdTournamentsTournamentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdTeams(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/teams",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdTeams(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/teams",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdTeamsTeamId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; teamId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/teams/{teamId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdTeamsTeamId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; teamId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/teams/{teamId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdInvites(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/invites",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdInvites(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/invites",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdInvitesInviteId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; inviteId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/invites/{inviteId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdStages(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/stages",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdStages(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/stages",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdStagesStageId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; stageId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/stages/{stageId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdStagesStageId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; stageId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/stages/{stageId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdGroups(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/groups",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdGroups(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/groups",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdGroupsGroupId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; groupId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/groups/{groupId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdGroupsGroupId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; groupId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/groups/{groupId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdRounds(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/rounds",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdRounds(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/rounds",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdRoundsRoundId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; roundId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/rounds/{roundId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdRoundsRoundId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; roundId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/rounds/{roundId}",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdSlots(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdSlots(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdSlotsSlotId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; slotId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots/{slotId}",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdSlotsSlotId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; slotId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots/{slotId}",
    ...options,
  });
}

export function deleteApiClubsClubIdTournamentsTournamentIdSlotsSlotId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; slotId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots/{slotId}",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdSlotsSlotIdAttachMatch(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; slotId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots/{slotId}/attach-match",
    ...options,
  });
}

export function patchApiClubsClubIdTournamentsTournamentIdSlotsSlotIdMetadata(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string; slotId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/slots/{slotId}/metadata",
    ...options,
  });
}

export function getApiClubsClubIdTournamentsTournamentIdStandings(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/standings",
    ...options,
  });
}

export function postApiClubsClubIdTournamentsTournamentIdStandingsRecalculate(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; tournamentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/tournaments/{tournamentId}/standings/recalculate",
    ...options,
  });
}

export const tournamentsApi = {
  getApiClubsClubIdTournaments,
  postApiClubsClubIdTournaments,
  getApiClubsClubIdTournamentsTournamentId,
  putApiClubsClubIdTournamentsTournamentId,
  patchApiClubsClubIdTournamentsTournamentId,
  deleteApiClubsClubIdTournamentsTournamentId,
  getApiClubsClubIdTournamentsTournamentIdTeams,
  postApiClubsClubIdTournamentsTournamentIdTeams,
  patchApiClubsClubIdTournamentsTournamentIdTeamsTeamId,
  deleteApiClubsClubIdTournamentsTournamentIdTeamsTeamId,
  getApiClubsClubIdTournamentsTournamentIdInvites,
  postApiClubsClubIdTournamentsTournamentIdInvites,
  deleteApiClubsClubIdTournamentsTournamentIdInvitesInviteId,
  getApiClubsClubIdTournamentsTournamentIdStages,
  postApiClubsClubIdTournamentsTournamentIdStages,
  patchApiClubsClubIdTournamentsTournamentIdStagesStageId,
  deleteApiClubsClubIdTournamentsTournamentIdStagesStageId,
  getApiClubsClubIdTournamentsTournamentIdGroups,
  postApiClubsClubIdTournamentsTournamentIdGroups,
  patchApiClubsClubIdTournamentsTournamentIdGroupsGroupId,
  deleteApiClubsClubIdTournamentsTournamentIdGroupsGroupId,
  getApiClubsClubIdTournamentsTournamentIdRounds,
  postApiClubsClubIdTournamentsTournamentIdRounds,
  patchApiClubsClubIdTournamentsTournamentIdRoundsRoundId,
  deleteApiClubsClubIdTournamentsTournamentIdRoundsRoundId,
  getApiClubsClubIdTournamentsTournamentIdSlots,
  postApiClubsClubIdTournamentsTournamentIdSlots,
  getApiClubsClubIdTournamentsTournamentIdSlotsSlotId,
  patchApiClubsClubIdTournamentsTournamentIdSlotsSlotId,
  deleteApiClubsClubIdTournamentsTournamentIdSlotsSlotId,
  postApiClubsClubIdTournamentsTournamentIdSlotsSlotIdAttachMatch,
  patchApiClubsClubIdTournamentsTournamentIdSlotsSlotIdMetadata,
  getApiClubsClubIdTournamentsTournamentIdStandings,
  postApiClubsClubIdTournamentsTournamentIdStandingsRecalculate,
} as const;

