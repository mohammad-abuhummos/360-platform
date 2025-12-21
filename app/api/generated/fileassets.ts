// Auto-generated client for tag "FileAssets".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [FileAssets] GET /api/clubs/{clubId}/files/{assetId}
 * Path params: clubId, assetId
 * Query params: token
 * Responses: 200
 */
export function getFile(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/files/{assetId}",
    ...options,
  });
}

/**
 * [FileAssets] POST /api/clubs/{clubId}/files
 * Path params: clubId
 * Body: optional (multipart/form-data)
 * Responses: 200
 */
export function postApiClubsClubIdFiles(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/files",
    ...options,
  });
}

/**
 * [FileAssets] POST /api/clubs/{clubId}/files/{assetId}/token
 * Path params: clubId, assetId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdFilesAssetIdToken(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/files/{assetId}/token",
    ...options,
  });
}

export const FileAssetsApi = {
  getFile,
  postApiClubsClubIdFiles,
  postApiClubsClubIdFilesAssetIdToken,
} as const;

