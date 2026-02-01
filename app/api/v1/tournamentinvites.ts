import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: TournamentInvites
 */

export function postApiTournamentsInvitesTokenSubmit(
  options: TemplateApiRequestOptions & { pathParams: { token: string } }
) {
  return request({
    method: "POST",
    path: "/api/tournaments/invites/{token}/submit",
    ...options,
  });
}

export const tournamentInvitesApi = {
  postApiTournamentsInvitesTokenSubmit,
} as const;

