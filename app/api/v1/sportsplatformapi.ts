import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SportsPlatform.Api
 *
 * Note: These are root paths (not under /api), handled via apiRoot internally.
 */

export function getScalar(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/scalar",
    ...options,
  });
}

export function getScaler(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/scaler",
    ...options,
  });
}

export const sportsPlatformApi = {
  getScalar,
  getScaler,
} as const;

