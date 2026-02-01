import { apiV1 } from "./client";
import type { ApiRequestOptions } from "./types";

// Swagger: components/schemas/SportType
export type SportType = "Soccer" | "Basketball";

// Swagger: components/schemas/SportCreateRequest
export type SportCreateRequest = {
  name?: string | null;
  description?: string | null;
  type: SportType;
  clubId: string; // uuid
};

// Swagger: components/schemas/SportUpdateRequest
export type SportUpdateRequest = {
  name?: string | null;
  description?: string | null;
  type: SportType;
  isActive?: boolean | null;
};

// Swagger: components/schemas/PatchRequest
export type PatchRequest = {
  set?: Record<string, unknown> | null;
  hasOperations?: boolean;
};

export const sportsApi = {
  /**
   * Swagger: GET /api/sports
   * Returns: not typed in swagger (200 OK), so default to unknown.
   */
  list: (options?: ApiRequestOptions) => apiV1.get<unknown>("/sports", options),

  /**
   * Swagger: POST /api/sports
   */
  create: (body: SportCreateRequest, options?: ApiRequestOptions) =>
    apiV1.post<unknown>("/sports", body, options),

  /**
   * Swagger: GET /api/sports/{id}
   */
  getById: (id: string, options?: ApiRequestOptions) =>
    apiV1.get<unknown>(`/sports/${encodeURIComponent(id)}`, options),

  /**
   * Swagger: PUT /api/sports/{id}
   */
  update: (id: string, body: SportUpdateRequest, options?: ApiRequestOptions) =>
    apiV1.put<unknown>(`/sports/${encodeURIComponent(id)}`, body, options),

  /**
   * Swagger: PATCH /api/sports/{id}
   */
  patch: (id: string, body: PatchRequest, options?: ApiRequestOptions) =>
    apiV1.patch<unknown>(`/sports/${encodeURIComponent(id)}`, body, options),

  /**
   * Swagger: DELETE /api/sports/{id}
   */
  remove: (id: string, options?: ApiRequestOptions) =>
    apiV1.delete<unknown>(`/sports/${encodeURIComponent(id)}`, options),
};

