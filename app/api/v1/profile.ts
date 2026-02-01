import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Profile
 */

export function postApiProfileAvatar(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/profile/avatar",
    ...options,
  });
}

export const profileApi = {
  postApiProfileAvatar,
} as const;

