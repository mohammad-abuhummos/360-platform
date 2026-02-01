import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Teams
 */

export function getApiTeams(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/teams",
    ...options,
  });
}

export function postApiTeams(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/teams",
    ...options,
  });
}

export function getApiTeamsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/teams/{id}",
    ...options,
  });
}

export function putApiTeamsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/teams/{id}",
    ...options,
  });
}

export function patchApiTeamsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PATCH",
    path: "/api/teams/{id}",
    ...options,
  });
}

export function deleteApiTeamsId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/teams/{id}",
    ...options,
  });
}

export const teamsApi = {
  getApiTeams,
  postApiTeams,
  getApiTeamsId,
  putApiTeamsId,
  patchApiTeamsId,
  deleteApiTeamsId,
} as const;

