import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: VideoPlaylists
 */

export function getApiClubsClubIdVideosPlaylists(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/playlists",
    ...options,
  });
}

export function postApiClubsClubIdVideosPlaylists(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/playlists",
    ...options,
  });
}

export const videoPlaylistsApi = {
  getApiClubsClubIdVideosPlaylists,
  postApiClubsClubIdVideosPlaylists,
} as const;

