// Auto-generated client for tag "MatchStats".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [MatchStats] GET /api/matches/{matchId}/stats
 * Path params: matchId
 * Responses: 200
 */
export function getApiMatchesMatchIdStats(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/matches/{matchId}/stats",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/cards/red
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsCardsRed(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/cards/red",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/cards/yellow
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsCardsYellow(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/cards/yellow",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/corners
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsCorners(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/corners",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/duels
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsDuels(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/duels",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/free-kicks
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsFreeKicks(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/free-kicks",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/goals
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsGoals(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/goals",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/offsides
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsOffsides(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/offsides",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/passes
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsPasses(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/passes",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/penalties
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsPenalties(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/penalties",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/saves
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsSaves(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/saves",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/shots
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsShots(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/shots",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/shots/on-goal
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsShotsOnGoal(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/shots/on-goal",
    ...options,
  });
}

/**
 * [MatchStats] POST /api/matches/{matchId}/stats/substitutions
 * Path params: matchId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiMatchesMatchIdStatsSubstitutions(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches/{matchId}/stats/substitutions",
    ...options,
  });
}

export const MatchStatsApi = {
  getApiMatchesMatchIdStats,
  postApiMatchesMatchIdStatsCardsRed,
  postApiMatchesMatchIdStatsCardsYellow,
  postApiMatchesMatchIdStatsCorners,
  postApiMatchesMatchIdStatsDuels,
  postApiMatchesMatchIdStatsFreeKicks,
  postApiMatchesMatchIdStatsGoals,
  postApiMatchesMatchIdStatsOffsides,
  postApiMatchesMatchIdStatsPasses,
  postApiMatchesMatchIdStatsPenalties,
  postApiMatchesMatchIdStatsSaves,
  postApiMatchesMatchIdStatsShots,
  postApiMatchesMatchIdStatsShotsOnGoal,
  postApiMatchesMatchIdStatsSubstitutions,
} as const;

