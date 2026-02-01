import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceResolvedRules
 */

export function postApiClubsClubIdResourcesResourceIdResolvedRules(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; resourceId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/resources/{resourceId}/resolved-rules",
    ...options,
  });
}

export const resourceResolvedRulesApi = {
  postApiClubsClubIdResourcesResourceIdResolvedRules,
} as const;

