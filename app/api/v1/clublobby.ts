import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: ClubLobby
 */

export function getApiClubsClubIdLobby(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby",
    ...options,
  });
}

export function getApiClubsClubIdLobbyForms(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms",
    ...options,
  });
}

export function postApiClubsClubIdLobbyForms(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/lobby/forms",
    ...options,
  });
}

export function getApiClubsClubIdLobbyFormsFormId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

export function putApiClubsClubIdLobbyFormsFormId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

export function deleteApiClubsClubIdLobbyFormsFormId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}",
    ...options,
  });
}

export function getApiClubsClubIdLobbyFormsFormIdSubmissions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions",
    ...options,
  });
}

export function postApiClubsClubIdLobbyFormsFormIdSubmissions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions",
    ...options,
  });
}

export function getApiClubsClubIdLobbyFormsFormIdSubmissionsMine(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; formId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/lobby/forms/{formId}/submissions/mine",
    ...options,
  });
}

export const clubLobbyApi = {
  getApiClubsClubIdLobby,
  getApiClubsClubIdLobbyForms,
  postApiClubsClubIdLobbyForms,
  getApiClubsClubIdLobbyFormsFormId,
  putApiClubsClubIdLobbyFormsFormId,
  deleteApiClubsClubIdLobbyFormsFormId,
  getApiClubsClubIdLobbyFormsFormIdSubmissions,
  postApiClubsClubIdLobbyFormsFormIdSubmissions,
  getApiClubsClubIdLobbyFormsFormIdSubmissionsMine,
} as const;

