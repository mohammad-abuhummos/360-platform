// Auto-generated client for tag "Profile".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Profile] POST /api/profile/avatar
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiProfileAvatar(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/profile/avatar",
    ...options,
  });
}

export const ProfileApi = {
  postApiProfileAvatar,
} as const;

