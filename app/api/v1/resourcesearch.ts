import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ResourceSearch
 */

export function getApiResourcesSearch(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/resources/search",
    ...options,
  });
}

export const resourceSearchApi = {
  getApiResourcesSearch,
} as const;

