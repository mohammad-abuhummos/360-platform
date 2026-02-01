import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceImages
 */

export function getApiClubsClubIdResourcesResourceIdImages(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/resources/{resourceId}/images",
    ...options,
  });
}

export function postApiClubsClubIdResourcesResourceIdImages(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources/{resourceId}/images",
    ...options,
  });
}

export function putApiClubsClubIdResourcesResourceIdImagesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/resources/{resourceId}/images/{id}",
    ...options,
  });
}

export function patchApiClubsClubIdResourcesResourceIdImagesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "PATCH",
    path: "/api/clubs/{clubId}/resources/{resourceId}/images/{id}",
    ...options,
  });
}

export function deleteApiClubsClubIdResourcesResourceIdImagesId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string; id: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/resources/{resourceId}/images/{id}",
    ...options,
  });
}

export const resourceImagesApi = {
  getApiClubsClubIdResourcesResourceIdImages,
  postApiClubsClubIdResourcesResourceIdImages,
  putApiClubsClubIdResourcesResourceIdImagesId,
  patchApiClubsClubIdResourcesResourceIdImagesId,
  deleteApiClubsClubIdResourcesResourceIdImagesId,
} as const;

