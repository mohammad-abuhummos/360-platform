// Auto-generated client for tag "ClubContacts".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [ClubContacts] DELETE /api/clubs/{clubId}/contacts/{contactId}
 * Path params: clubId, contactId
 * Responses: 200
 */
export function deleteApiClubsClubIdContactsContactId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

/**
 * [ClubContacts] GET /api/clubs/{clubId}/contacts
 * Path params: clubId
 * Query params: status
 * Responses: 200
 */
export function getApiClubsClubIdContacts(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/contacts",
    ...options,
  });
}

/**
 * [ClubContacts] GET /api/clubs/{clubId}/contacts/{contactId}
 * Path params: clubId, contactId
 * Responses: 200
 */
export function getApiClubsClubIdContactsContactId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

/**
 * [ClubContacts] POST /api/clubs/{clubId}/contacts
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdContacts(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/contacts",
    ...options,
  });
}

/**
 * [ClubContacts] POST /api/clubs/{clubId}/contacts/{contactId}/invite
 * Path params: clubId, contactId
 * Responses: 200
 */
export function postApiClubsClubIdContactsContactIdInvite(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/contacts/{contactId}/invite",
    ...options,
  });
}

/**
 * [ClubContacts] PUT /api/clubs/{clubId}/contacts/{contactId}
 * Path params: clubId, contactId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdContactsContactId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

export const ClubContactsApi = {
  deleteApiClubsClubIdContactsContactId,
  getApiClubsClubIdContacts,
  getApiClubsClubIdContactsContactId,
  postApiClubsClubIdContacts,
  postApiClubsClubIdContactsContactIdInvite,
  putApiClubsClubIdContactsContactId,
} as const;

