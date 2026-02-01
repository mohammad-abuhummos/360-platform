import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Matches
 */

export function getApiMatches(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/matches",
    ...options,
  });
}

export function postApiMatches(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/matches",
    ...options,
  });
}

export function getApiMatchesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/matches/{id}",
    ...options,
  });
}

export function putApiMatchesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "PUT",
    path: "/api/matches/{id}",
    ...options,
  });
}

export function deleteApiMatchesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "DELETE",
    path: "/api/matches/{id}",
    ...options,
  });
}

export const matchesApi = {
  getApiMatches,
  postApiMatches,
  getApiMatchesId,
  putApiMatchesId,
  deleteApiMatchesId,
} as const;

