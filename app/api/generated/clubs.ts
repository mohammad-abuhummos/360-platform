// Auto-generated client for tag "Clubs".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Clubs] DELETE /api/clubs/{id}
 * Path params: id
 * Responses: 200
 */
export function deleteApiClubsId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{id}",
    ...options,
  });
}

/**
 * [Clubs] GET /api/clubs
 * Responses: 200
 */
export function getApiClubs(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs",
    ...options,
  });
}

/**
 * [Clubs] GET /api/clubs/{clubId}
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}",
    ...options,
  });
}

/**
 * [Clubs] GET /api/clubs/{id}/files/usage
 * Path params: id
 * Responses: 200
 */
export function getApiClubsIdFilesUsage(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{id}/files/usage",
    ...options,
  });
}

/**
 * [Clubs] PATCH /api/clubs/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function patchApiClubsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{id}",
    ...options,
  });
}

/**
 * [Clubs] POST /api/clubs
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubs(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs",
    ...options,
  });
}

/**
 * [Clubs] POST /api/clubs/{id}/branding/banner
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsIdBrandingBanner(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/branding/banner",
    ...options,
  });
}

/**
 * [Clubs] POST /api/clubs/{id}/branding/icon
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsIdBrandingIcon(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/branding/icon",
    ...options,
  });
}

/**
 * [Clubs] POST /api/clubs/{id}/files/cleanup
 * Path params: id
 * Responses: 200
 */
export function postApiClubsIdFilesCleanup(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/files/cleanup",
    ...options,
  });
}

/**
 * [Clubs] POST /api/clubs/{id}/files/variants/process
 * Path params: id
 * Responses: 200
 */
export function postApiClubsIdFilesVariantsProcess(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/files/variants/process",
    ...options,
  });
}

/**
 * [Clubs] PUT /api/clubs/{id}
 * Path params: id
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{id}",
    ...options,
  });
}

export const ClubsApi = {
  deleteApiClubsId,
  getApiClubs,
  getApiClubsClubId,
  getApiClubsIdFilesUsage,
  patchApiClubsId,
  postApiClubs,
  postApiClubsIdBrandingBanner,
  postApiClubsIdBrandingIcon,
  postApiClubsIdFilesCleanup,
  postApiClubsIdFilesVariantsProcess,
  putApiClubsId,
} as const;

