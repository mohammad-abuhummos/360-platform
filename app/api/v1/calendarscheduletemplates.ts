import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: CalendarScheduleTemplates
 */

export function getApiClubsClubIdCalendarTemplates(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/templates",
    ...options,
  });
}

export function postApiClubsClubIdCalendarTemplates(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/templates",
    ...options,
  });
}

export function getApiClubsClubIdCalendarTemplatesTemplateId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; templateId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/calendar/templates/{templateId}",
    ...options,
  });
}

export function putApiClubsClubIdCalendarTemplatesTemplateId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; templateId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/calendar/templates/{templateId}",
    ...options,
  });
}

export function deleteApiClubsClubIdCalendarTemplatesTemplateId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; templateId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/calendar/templates/{templateId}",
    ...options,
  });
}

export function postApiClubsClubIdCalendarTemplatesTemplateIdPublish(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; templateId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/calendar/templates/{templateId}/publish",
    ...options,
  });
}

export const calendarScheduleTemplatesApi = {
  getApiClubsClubIdCalendarTemplates,
  postApiClubsClubIdCalendarTemplates,
  getApiClubsClubIdCalendarTemplatesTemplateId,
  putApiClubsClubIdCalendarTemplatesTemplateId,
  deleteApiClubsClubIdCalendarTemplatesTemplateId,
  postApiClubsClubIdCalendarTemplatesTemplateIdPublish,
} as const;

