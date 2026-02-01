import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: MatchStats
 */

export function getApiMatchesMatchIdStats(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats",
    ...options,
  });
}

// Cards (red)
export function postApiMatchesMatchIdStatsCardsRed(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/cards/red",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsCardsRedId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/cards/red/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsCardsRedId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/cards/red/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsCardsRedId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/cards/red/{id}",
    ...options,
  });
}

// Cards (yellow)
export function postApiMatchesMatchIdStatsCardsYellow(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/cards/yellow",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsCardsYellowId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/cards/yellow/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsCardsYellowId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/cards/yellow/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsCardsYellowId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/cards/yellow/{id}",
    ...options,
  });
}

// Corners
export function postApiMatchesMatchIdStatsCorners(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/corners",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsCornersId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/corners/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsCornersId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/corners/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsCornersId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/corners/{id}",
    ...options,
  });
}

// Duels
export function postApiMatchesMatchIdStatsDuels(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/duels",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsDuelsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/duels/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsDuelsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/duels/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsDuelsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/duels/{id}",
    ...options,
  });
}

// Free-kicks
export function postApiMatchesMatchIdStatsFreeKicks(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/free-kicks",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsFreeKicksId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/free-kicks/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsFreeKicksId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/free-kicks/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsFreeKicksId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/free-kicks/{id}",
    ...options,
  });
}

// Goals
export function postApiMatchesMatchIdStatsGoals(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/goals",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsGoalsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/goals/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsGoalsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/goals/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsGoalsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/goals/{id}",
    ...options,
  });
}

// Offsides
export function postApiMatchesMatchIdStatsOffsides(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/offsides",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsOffsidesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/offsides/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsOffsidesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/offsides/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsOffsidesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/offsides/{id}",
    ...options,
  });
}

// Passes
export function postApiMatchesMatchIdStatsPasses(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/passes",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsPassesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/passes/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsPassesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/passes/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsPassesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/passes/{id}",
    ...options,
  });
}

// Penalties
export function postApiMatchesMatchIdStatsPenalties(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/penalties",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsPenaltiesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/penalties/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsPenaltiesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/penalties/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsPenaltiesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/penalties/{id}",
    ...options,
  });
}

// Saves
export function postApiMatchesMatchIdStatsSaves(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/saves",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsSavesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/saves/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsSavesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/saves/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsSavesId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/saves/{id}",
    ...options,
  });
}

// Shots
export function postApiMatchesMatchIdStatsShots(options: TemplateApiRequestOptions & { pathParams: { matchId: string } }) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/shots",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsShotsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/shots/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsShotsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/shots/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsShotsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/shots/{id}",
    ...options,
  });
}

// Shots (on-goal)
export function postApiMatchesMatchIdStatsShotsOnGoal(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/shots/on-goal",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsShotsOnGoalId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/shots/on-goal/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsShotsOnGoalId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/shots/on-goal/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsShotsOnGoalId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/shots/on-goal/{id}",
    ...options,
  });
}

// Substitutions
export function postApiMatchesMatchIdStatsSubstitutions(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string } }
) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/substitutions",
    ...options,
  });
}
export function getApiMatchesMatchIdStatsSubstitutionsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats/substitutions/{id}",
    ...options,
  });
}
export function patchApiMatchesMatchIdStatsSubstitutionsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/matches/{matchId}/stats/substitutions/{id}",
    ...options,
  });
}
export function deleteApiMatchesMatchIdStatsSubstitutionsId(
  options: TemplateApiRequestOptions & { pathParams: { matchId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/matches/{matchId}/stats/substitutions/{id}",
    ...options,
  });
}

export const matchStatsApi = {
  getApiMatchesMatchIdStats,

  postApiMatchesMatchIdStatsCardsRed,
  getApiMatchesMatchIdStatsCardsRedId,
  patchApiMatchesMatchIdStatsCardsRedId,
  deleteApiMatchesMatchIdStatsCardsRedId,

  postApiMatchesMatchIdStatsCardsYellow,
  getApiMatchesMatchIdStatsCardsYellowId,
  patchApiMatchesMatchIdStatsCardsYellowId,
  deleteApiMatchesMatchIdStatsCardsYellowId,

  postApiMatchesMatchIdStatsCorners,
  getApiMatchesMatchIdStatsCornersId,
  patchApiMatchesMatchIdStatsCornersId,
  deleteApiMatchesMatchIdStatsCornersId,

  postApiMatchesMatchIdStatsDuels,
  getApiMatchesMatchIdStatsDuelsId,
  patchApiMatchesMatchIdStatsDuelsId,
  deleteApiMatchesMatchIdStatsDuelsId,

  postApiMatchesMatchIdStatsFreeKicks,
  getApiMatchesMatchIdStatsFreeKicksId,
  patchApiMatchesMatchIdStatsFreeKicksId,
  deleteApiMatchesMatchIdStatsFreeKicksId,

  postApiMatchesMatchIdStatsGoals,
  getApiMatchesMatchIdStatsGoalsId,
  patchApiMatchesMatchIdStatsGoalsId,
  deleteApiMatchesMatchIdStatsGoalsId,

  postApiMatchesMatchIdStatsOffsides,
  getApiMatchesMatchIdStatsOffsidesId,
  patchApiMatchesMatchIdStatsOffsidesId,
  deleteApiMatchesMatchIdStatsOffsidesId,

  postApiMatchesMatchIdStatsPasses,
  getApiMatchesMatchIdStatsPassesId,
  patchApiMatchesMatchIdStatsPassesId,
  deleteApiMatchesMatchIdStatsPassesId,

  postApiMatchesMatchIdStatsPenalties,
  getApiMatchesMatchIdStatsPenaltiesId,
  patchApiMatchesMatchIdStatsPenaltiesId,
  deleteApiMatchesMatchIdStatsPenaltiesId,

  postApiMatchesMatchIdStatsSaves,
  getApiMatchesMatchIdStatsSavesId,
  patchApiMatchesMatchIdStatsSavesId,
  deleteApiMatchesMatchIdStatsSavesId,

  postApiMatchesMatchIdStatsShots,
  getApiMatchesMatchIdStatsShotsId,
  patchApiMatchesMatchIdStatsShotsId,
  deleteApiMatchesMatchIdStatsShotsId,

  postApiMatchesMatchIdStatsShotsOnGoal,
  getApiMatchesMatchIdStatsShotsOnGoalId,
  patchApiMatchesMatchIdStatsShotsOnGoalId,
  deleteApiMatchesMatchIdStatsShotsOnGoalId,

  postApiMatchesMatchIdStatsSubstitutions,
  getApiMatchesMatchIdStatsSubstitutionsId,
  patchApiMatchesMatchIdStatsSubstitutionsId,
  deleteApiMatchesMatchIdStatsSubstitutionsId,
} as const;

