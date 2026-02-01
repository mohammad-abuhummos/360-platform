import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: FileAssets
 */

export function postApiClubsClubIdFiles(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/files",
    ...options,
  });
}

export function getApiClubsClubIdFilesAssetId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; assetId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/files/{assetId}",
    ...options,
  });
}

export function postApiClubsClubIdFilesAssetIdToken(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; assetId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/files/{assetId}/token",
    ...options,
  });
}

export const fileAssetsApi = {
  postApiClubsClubIdFiles,
  getApiClubsClubIdFilesAssetId,
  postApiClubsClubIdFilesAssetIdToken,
} as const;

