// Auto-generated client for tag "VeoVideos".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [VeoVideos] GET /api/clubs/{clubId}/veo/videos
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubIdVeoVideos(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/veo/videos",
    ...options,
  });
}

/**
 * [VeoVideos] GET /api/clubs/{clubId}/veo/videos/{videoId}
 * Path params: clubId, videoId
 * Responses: 200
 */
export function getApiClubsClubIdVeoVideosVideoId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/veo/videos/{videoId}",
    ...options,
  });
}

/**
 * [VeoVideos] POST /api/clubs/{clubId}/veo/videos/import
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdVeoVideosImport(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/veo/videos/import",
    ...options,
  });
}

export const VeoVideosApi = {
  getApiClubsClubIdVeoVideos,
  getApiClubsClubIdVeoVideosVideoId,
  postApiClubsClubIdVeoVideosImport,
} as const;

