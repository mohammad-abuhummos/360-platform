// Auto-generated client for tag "ClubLobby".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubLobby] DELETE /api/clubs/{clubId}/lobby/forms/{formId}
 * Path params: clubId, formId
 * Responses: 200
 */
export function deleteApiClubsClubIdLobbyFormsFormId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

/**
 * [ClubLobby] GET /api/clubs/{clubId}/lobby
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubIdLobby(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby",
    ...options,
  });
}

/**
 * [ClubLobby] GET /api/clubs/{clubId}/lobby/forms
 * Path params: clubId
 * Responses: 200
 */
export function getApiClubsClubIdLobbyForms(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms",
    ...options,
  });
}

/**
 * [ClubLobby] GET /api/clubs/{clubId}/lobby/forms/{formId}
 * Path params: clubId, formId
 * Responses: 200
 */
export function getApiClubsClubIdLobbyFormsFormId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

/**
 * [ClubLobby] GET /api/clubs/{clubId}/lobby/forms/{formId}/submissions
 * Path params: clubId, formId
 * Responses: 200
 */
export function getApiClubsClubIdLobbyFormsFormIdSubmissions(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions",
    ...options,
  });
}

/**
 * [ClubLobby] GET /api/clubs/{clubId}/lobby/forms/{formId}/submissions/mine
 * Path params: clubId, formId
 * Responses: 200
 */
export function getApiClubsClubIdLobbyFormsFormIdSubmissionsMine(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions/mine",
    ...options,
  });
}

/**
 * [ClubLobby] POST /api/clubs/{clubId}/lobby/forms
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdLobbyForms(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/lobby/forms",
    ...options,
  });
}

/**
 * [ClubLobby] POST /api/clubs/{clubId}/lobby/forms/{formId}/submissions
 * Path params: clubId, formId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdLobbyFormsFormIdSubmissions(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions",
    ...options,
  });
}

/**
 * [ClubLobby] PUT /api/clubs/{clubId}/lobby/forms/{formId}
 * Path params: clubId, formId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdLobbyFormsFormId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

export const ClubLobbyApi = {
  deleteApiClubsClubIdLobbyFormsFormId,
  getApiClubsClubIdLobby,
  getApiClubsClubIdLobbyForms,
  getApiClubsClubIdLobbyFormsFormId,
  getApiClubsClubIdLobbyFormsFormIdSubmissions,
  getApiClubsClubIdLobbyFormsFormIdSubmissionsMine,
  postApiClubsClubIdLobbyForms,
  postApiClubsClubIdLobbyFormsFormIdSubmissions,
  putApiClubsClubIdLobbyFormsFormId,
} as const;

