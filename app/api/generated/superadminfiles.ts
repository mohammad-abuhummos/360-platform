// Auto-generated client for tag "SuperAdminFiles".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [SuperAdminFiles] GET /api/super-admin/files
 * Query params: TenantId, ClubId, SportId, GroupId, OwnerId, CreatedByUserId, OwnerType, ResourceType, Audience, Status, VariantType, Search, Page, PageSize
 * Responses: 200
 */
export function getApiSuperAdminFiles(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/super-admin/files",
    ...options,
  });
}

export const SuperAdminFilesApi = {
  getApiSuperAdminFiles,
} as const;

