import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: AppConnect
 */

export function getApiClubsClubIdAppConnect(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/app-connect",
    ...options,
  });
}

export function getApiClubsClubIdAppConnectAdmin(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/app-connect/admin",
    ...options,
  });
}

export function postApiClubsClubIdAppConnectFolders(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/app-connect/folders",
    ...options,
  });
}

export function patchApiClubsClubIdAppConnectFoldersFolderId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; folderId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/app-connect/folders/{folderId}",
    ...options,
  });
}

export function deleteApiClubsClubIdAppConnectFoldersFolderId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; folderId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/app-connect/folders/{folderId}",
    ...options,
  });
}

export function postApiClubsClubIdAppConnectFoldersFolderIdLinks(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; folderId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/app-connect/folders/{folderId}/links",
    ...options,
  });
}

export function patchApiClubsClubIdAppConnectLinksLinkId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; linkId: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/app-connect/links/{linkId}",
    ...options,
  });
}

export function deleteApiClubsClubIdAppConnectLinksLinkId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; linkId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/app-connect/links/{linkId}",
    ...options,
  });
}

export const appConnectApi = {
  getApiClubsClubIdAppConnect,
  getApiClubsClubIdAppConnectAdmin,
  postApiClubsClubIdAppConnectFolders,
  patchApiClubsClubIdAppConnectFoldersFolderId,
  deleteApiClubsClubIdAppConnectFoldersFolderId,
  postApiClubsClubIdAppConnectFoldersFolderIdLinks,
  patchApiClubsClubIdAppConnectLinksLinkId,
  deleteApiClubsClubIdAppConnectLinksLinkId,
} as const;

