import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Auth
 */

export function postApiAuthLogin(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/login",
    ...options,
  });
}

export function postApiAuthRegister(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/register",
    ...options,
  });
}

export function postApiAuthRegisterContact(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/Auth/register/contact",
    ...options,
  });
}

export const authApi = {
  postApiAuthLogin,
  postApiAuthRegister,
  postApiAuthRegisterContact,
} as const;

