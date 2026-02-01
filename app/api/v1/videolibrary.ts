import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: VideoLibrary
 */

export function getApiClubsClubIdVideosLibrary(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library",
    ...options,
  });
}

export function postApiClubsClubIdVideosLibrary(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/library",
    ...options,
  });
}

export function getApiClubsClubIdVideosLibraryVideoId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; videoId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library/{videoId}",
    ...options,
  });
}

export function putApiClubsClubIdVideosLibraryVideoId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; videoId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/videos/library/{videoId}",
    ...options,
  });
}

export function getApiClubsClubIdVideosLibraryVideoIdClips(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; videoId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/videos/library/{videoId}/clips",
    ...options,
  });
}

export function postApiClubsClubIdVideosLibraryVideoIdClips(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; videoId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/videos/library/{videoId}/clips",
    ...options,
  });
}

export const videoLibraryApi = {
  getApiClubsClubIdVideosLibrary,
  postApiClubsClubIdVideosLibrary,
  getApiClubsClubIdVideosLibraryVideoId,
  putApiClubsClubIdVideosLibraryVideoId,
  getApiClubsClubIdVideosLibraryVideoIdClips,
  postApiClubsClubIdVideosLibraryVideoIdClips,
} as const;

