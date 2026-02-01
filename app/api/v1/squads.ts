import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Squads
 */

export function getApiGroupsGroupIdSquads(options: TemplateApiRequestOptions & { pathParams: { groupId: string } }) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/squads",
    ...options,
  });
}

export function postApiGroupsGroupIdSquads(options: TemplateApiRequestOptions & { pathParams: { groupId: string } }) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/squads",
    ...options,
  });
}

export function getApiGroupsGroupIdSquadsId(
  options: TemplateApiRequestOptions & { pathParams: { groupId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/squads/{id}",
    ...options,
  });
}

export const squadsApi = {
  getApiGroupsGroupIdSquads,
  postApiGroupsGroupIdSquads,
  getApiGroupsGroupIdSquadsId,
} as const;

