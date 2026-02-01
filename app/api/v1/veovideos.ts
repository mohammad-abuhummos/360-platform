import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: VeoVideos
 */

export function getApiClubsClubIdVeoVideos(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/veo/videos",
    ...options,
  });
}

export function getApiClubsClubIdVeoVideosVideoId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; videoId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/veo/videos/{videoId}",
    ...options,
  });
}

export function postApiClubsClubIdVeoVideosImport(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/veo/videos/import",
    ...options,
  });
}

export const veoVideosApi = {
  getApiClubsClubIdVeoVideos,
  getApiClubsClubIdVeoVideosVideoId,
  postApiClubsClubIdVeoVideosImport,
} as const;

