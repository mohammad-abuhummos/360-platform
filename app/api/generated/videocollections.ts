// Auto-generated client for tag "VideoCollections".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [VideoCollections] GET /api/clubs/{clubId}/videos/collections
 * Path params: clubId
 * Query params: sportId, groupId, visibility, search
 * Responses: 200
 */
export function getApiClubsClubIdVideosCollections(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/collections",
    ...options,
  });
}

/**
 * [VideoCollections] POST /api/clubs/{clubId}/videos/collections
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdVideosCollections(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/collections",
    ...options,
  });
}

export const VideoCollectionsApi = {
  getApiClubsClubIdVideosCollections,
  postApiClubsClubIdVideosCollections,
} as const;

