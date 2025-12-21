// Auto-generated client for tag "SportsPlatform.Api".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SportsPlatform.Api] GET /scalar
 * Responses: 200
 */
export function getScalar(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/scalar",
    ...options,
  });
}

/**
 * [SportsPlatform.Api] GET /scaler
 * Responses: 200
 */
export function getScaler(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/scaler",
    ...options,
  });
}

export const SportsPlatformApiApi = {
  getScalar,
  getScaler,
} as const;

