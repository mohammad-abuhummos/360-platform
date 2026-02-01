import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: VideoCollections
 */

export function getApiClubsClubIdVideosCollections(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/collections",
    ...options,
  });
}

export function postApiClubsClubIdVideosCollections(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/collections",
    ...options,
  });
}

export const videoCollectionsApi = {
  getApiClubsClubIdVideosCollections,
  postApiClubsClubIdVideosCollections,
} as const;

