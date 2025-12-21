// Auto-generated client for tag "Auth".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Auth] POST /api/Auth/login
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiAuthLogin(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/login",
    ...options,
  });
}

/**
 * [Auth] POST /api/Auth/register
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiAuthRegister(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/register",
    ...options,
  });
}

/**
 * [Auth] POST /api/Auth/register/contact
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiAuthRegisterContact(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/register/contact",
    ...options,
  });
}

export const AuthApi = {
  postApiAuthLogin,
  postApiAuthRegister,
  postApiAuthRegisterContact,
} as const;

