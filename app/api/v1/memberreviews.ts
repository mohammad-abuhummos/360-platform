import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: MemberReviews
 */

export function getApiClubsClubIdMembersUserIdReviews(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/reviews",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdReviews(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/reviews",
    ...options,
  });
}

export const memberReviewsApi = {
  getApiClubsClubIdMembersUserIdReviews,
  postApiClubsClubIdMembersUserIdReviews,
} as const;

