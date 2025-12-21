// Auto-generated client for tag "VideoLibrary".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [VideoLibrary] GET /api/clubs/{clubId}/videos/library
 * Path params: clubId
 * Query params: sportId, groupId, teamId, visibility, search
 * Responses: 200
 */
export function getApiClubsClubIdVideosLibrary(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library",
    ...options,
  });
}

/**
 * [VideoLibrary] GET /api/clubs/{clubId}/videos/library/{videoId}
 * Path params: clubId, videoId
 * Responses: 200
 */
export function getApiClubsClubIdVideosLibraryVideoId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library/{videoId}",
    ...options,
  });
}

/**
 * [VideoLibrary] GET /api/clubs/{clubId}/videos/library/{videoId}/clips
 * Path params: clubId, videoId
 * Responses: 200
 */
export function getApiClubsClubIdVideosLibraryVideoIdClips(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library/{videoId}/clips",
    ...options,
  });
}

/**
 * [VideoLibrary] POST /api/clubs/{clubId}/videos/library
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdVideosLibrary(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/library",
    ...options,
  });
}

/**
 * [VideoLibrary] POST /api/clubs/{clubId}/videos/library/{videoId}/clips
 * Path params: clubId, videoId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdVideosLibraryVideoIdClips(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/library/{videoId}/clips",
    ...options,
  });
}

/**
 * [VideoLibrary] PUT /api/clubs/{clubId}/videos/library/{videoId}
 * Path params: clubId, videoId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdVideosLibraryVideoId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/videos/library/{videoId}",
    ...options,
  });
}

export const VideoLibraryApi = {
  getApiClubsClubIdVideosLibrary,
  getApiClubsClubIdVideosLibraryVideoId,
  getApiClubsClubIdVideosLibraryVideoIdClips,
  postApiClubsClubIdVideosLibrary,
  postApiClubsClubIdVideosLibraryVideoIdClips,
  putApiClubsClubIdVideosLibraryVideoId,
} as const;

