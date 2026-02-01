import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Formations
 */

export function getApiGroupsGroupIdFormations(options: TemplateApiRequestOptions & { pathParams: { groupId: string } }) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/formations",
    ...options,
  });
}

export function postApiGroupsGroupIdFormations(options: TemplateApiRequestOptions & { pathParams: { groupId: string } }) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/formations",
    ...options,
  });
}

export function getApiGroupsGroupIdFormationsId(
  options: TemplateApiRequestOptions & { pathParams: { groupId: string; id: string } }
) {
  return request({
    method: "GET",
    path: "/api/groups/{groupId}/formations/{id}",
    ...options,
  });
}

export function postApiGroupsGroupIdFormationsFromTemplateTemplateId(
  options: TemplateApiRequestOptions & { pathParams: { groupId: string; templateId: string } }
) {
  return request({
    method: "POST",
    path: "/api/groups/{groupId}/formations/from-template/{templateId}",
    ...options,
  });
}

export const formationsApi = {
  getApiGroupsGroupIdFormations,
  postApiGroupsGroupIdFormations,
  getApiGroupsGroupIdFormationsId,
  postApiGroupsGroupIdFormationsFromTemplateTemplateId,
} as const;

