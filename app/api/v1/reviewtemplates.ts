import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ReviewTemplates
 */

export function getApiClubsClubIdReviewsTemplates(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/reviews/templates",
    ...options,
  });
}

export function postApiClubsClubIdReviewsTemplates(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/reviews/templates",
    ...options,
  });
}

export const reviewTemplatesApi = {
  getApiClubsClubIdReviewsTemplates,
  postApiClubsClubIdReviewsTemplates,
} as const;

