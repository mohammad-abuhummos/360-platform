import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Chats
 */

export function getApiClubsClubIdChats(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats",
    ...options,
  });
}

export function getApiClubsClubIdChatsThreadId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats/{threadId}",
    ...options,
  });
}

export function postApiClubsClubIdChatsDirect(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/direct",
    ...options,
  });
}

export function postApiClubsClubIdChatsGroup(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/group",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdMembers(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/members",
    ...options,
  });
}

export function deleteApiClubsClubIdChatsThreadIdMembersMemberId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string; memberId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/chats/{threadId}/members/{memberId}",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdMembersRole(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/members/role",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdMessages(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdMessagesMessageIdReactions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string; messageId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions",
    ...options,
  });
}

export function deleteApiClubsClubIdChatsThreadIdMessagesMessageIdReactions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string; messageId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdMute(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/mute",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdArchive(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/archive",
    ...options,
  });
}

export function postApiClubsClubIdChatsThreadIdLeave(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; threadId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/leave",
    ...options,
  });
}

export function getApiClubsClubIdChatsSearch(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats/search",
    ...options,
  });
}

export const chatsApi = {
  getApiClubsClubIdChats,
  getApiClubsClubIdChatsThreadId,
  postApiClubsClubIdChatsDirect,
  postApiClubsClubIdChatsGroup,
  postApiClubsClubIdChatsThreadIdMembers,
  deleteApiClubsClubIdChatsThreadIdMembersMemberId,
  postApiClubsClubIdChatsThreadIdMembersRole,
  postApiClubsClubIdChatsThreadIdMessages,
  postApiClubsClubIdChatsThreadIdMessagesMessageIdReactions,
  deleteApiClubsClubIdChatsThreadIdMessagesMessageIdReactions,
  postApiClubsClubIdChatsThreadIdMute,
  postApiClubsClubIdChatsThreadIdArchive,
  postApiClubsClubIdChatsThreadIdLeave,
  getApiClubsClubIdChatsSearch,
} as const;

