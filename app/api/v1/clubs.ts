import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Clubs
 */

export function getApiClubs(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs",
    ...options,
  });
}

export function postApiClubs(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs",
    ...options,
  });
}

export function getApiClubsClubId(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}",
    ...options,
  });
}

export function putApiClubsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/clubs/{id}",
    ...options,
  });
}

export function patchApiClubsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{id}",
    ...options,
  });
}

export function deleteApiClubsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{id}",
    ...options,
  });
}

export function postApiClubsIdBrandingIcon(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/branding/icon",
    ...options,
  });
}

export function postApiClubsIdBrandingBanner(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/branding/banner",
    ...options,
  });
}

export function getApiClubsIdFilesUsage(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{id}/files/usage",
    ...options,
  });
}

export function postApiClubsIdFilesCleanup(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/files/cleanup",
    ...options,
  });
}

export function postApiClubsIdFilesVariantsProcess(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{id}/files/variants/process",
    ...options,
  });
}

export const clubsApi = {
  getApiClubs,
  postApiClubs,
  getApiClubsClubId,
  putApiClubsId,
  patchApiClubsId,
  deleteApiClubsId,
  postApiClubsIdBrandingIcon,
  postApiClubsIdBrandingBanner,
  getApiClubsIdFilesUsage,
  postApiClubsIdFilesCleanup,
  postApiClubsIdFilesVariantsProcess,
} as const;

