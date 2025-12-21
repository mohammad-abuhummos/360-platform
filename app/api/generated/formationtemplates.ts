// Auto-generated client for tag "FormationTemplates".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [FormationTemplates] GET /api/formation-templates
 * Query params: sportType, includeInactive
 * Responses: 200
 */
export function getApiFormationTemplates(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/formation-templates",
    ...options,
  });
}

/**
 * [FormationTemplates] GET /api/formation-templates/{id}
 * Path params: id
 * Responses: 200
 */
export function getApiFormationTemplatesId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/formation-templates/{id}",
    ...options,
  });
}

/**
 * [FormationTemplates] POST /api/formation-templates
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiFormationTemplates(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/formation-templates",
    ...options,
  });
}

export const FormationTemplatesApi = {
  getApiFormationTemplates,
  getApiFormationTemplatesId,
  postApiFormationTemplates,
} as const;

