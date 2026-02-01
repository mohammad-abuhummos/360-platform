import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: SuperAdminFiles
 */

export function getApiSuperAdminFiles(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/files",
    ...options,
  });
}

export const superAdminFilesApi = {
  getApiSuperAdminFiles,
} as const;

