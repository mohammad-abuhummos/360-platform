import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubContacts
 */

export function getApiClubsClubIdContacts(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/contacts",
    ...options,
  });
}

export function postApiClubsClubIdContacts(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/contacts",
    ...options,
  });
}

export function getApiClubsClubIdContactsContactId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; contactId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

export function putApiClubsClubIdContactsContactId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; contactId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

export function deleteApiClubsClubIdContactsContactId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; contactId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/contacts/{contactId}",
    ...options,
  });
}

export function postApiClubsClubIdContactsContactIdInvite(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; contactId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/contacts/{contactId}/invite",
    ...options,
  });
}

export const clubContactsApi = {
  getApiClubsClubIdContacts,
  postApiClubsClubIdContacts,
  getApiClubsClubIdContactsContactId,
  putApiClubsClubIdContactsContactId,
  deleteApiClubsClubIdContactsContactId,
  postApiClubsClubIdContactsContactIdInvite,
} as const;

