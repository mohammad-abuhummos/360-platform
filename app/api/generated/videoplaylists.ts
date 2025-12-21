// Auto-generated client for tag "VideoPlaylists".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [VideoPlaylists] GET /api/clubs/{clubId}/videos/playlists
 * Path params: clubId
 * Query params: sportId, groupId, visibility, search
 * Responses: 200
 */
export function getApiClubsClubIdVideosPlaylists(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/playlists",
    ...options,
  });
}

/**
 * [VideoPlaylists] POST /api/clubs/{clubId}/videos/playlists
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdVideosPlaylists(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/playlists",
    ...options,
  });
}

export const VideoPlaylistsApi = {
  getApiClubsClubIdVideosPlaylists,
  postApiClubsClubIdVideosPlaylists,
} as const;

