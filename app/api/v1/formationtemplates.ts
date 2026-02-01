import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: FormationTemplates
 */

export function getApiFormationTemplates(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/formation-templates",
    ...options,
  });
}

export function postApiFormationTemplates(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/formation-templates",
    ...options,
  });
}

export function getApiFormationTemplatesId(options: TemplateApiRequestOptions & { pathParams: { id: string } }) {
  return request({
    method: "GET",
    path: "/api/formation-templates/{id}",
    ...options,
  });
}

export const formationTemplatesApi = {
  getApiFormationTemplates,
  postApiFormationTemplates,
  getApiFormationTemplatesId,
} as const;

