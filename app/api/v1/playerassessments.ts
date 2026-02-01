import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: PlayerAssessments
 */

export function getApiClubsClubIdMembersUserIdAssessments(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/assessments",
    ...options,
  });
}

export function postApiClubsClubIdMembersUserIdAssessments(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/members/{userId}/assessments",
    ...options,
  });
}

export function getApiClubsClubIdMembersUserIdAssessmentsAssessmentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; userId: string; assessmentId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/members/{userId}/assessments/{assessmentId}",
    ...options,
  });
}

export const playerAssessmentsApi = {
  getApiClubsClubIdMembersUserIdAssessments,
  postApiClubsClubIdMembersUserIdAssessments,
  getApiClubsClubIdMembersUserIdAssessmentsAssessmentId,
} as const;

