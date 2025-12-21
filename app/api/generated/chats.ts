// Auto-generated client for tag "Chats".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Chats] DELETE /api/clubs/{clubId}/chats/{threadId}/members/{memberId}
 * Path params: clubId, threadId, memberId
 * Responses: 200
 */
export function deleteApiClubsClubIdChatsThreadIdMembersMemberId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/chats/{threadId}/members/{memberId}",
    ...options,
  });
}

/**
 * [Chats] DELETE /api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions
 * Path params: clubId, threadId, messageId
 * Responses: 200
 */
export function deleteApiClubsClubIdChatsThreadIdMessagesMessageIdReactions(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions",
    ...options,
  });
}

/**
 * [Chats] GET /api/clubs/{clubId}/chats
 * Path params: clubId
 * Query params: Search, IncludeArchived, IncludeChildren, Page, PageSize
 * Responses: 200
 */
export function getApiClubsClubIdChats(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats",
    ...options,
  });
}

/**
 * [Chats] GET /api/clubs/{clubId}/chats/search
 * Path params: clubId
 * Query params: term
 * Responses: 200
 */
export function getApiClubsClubIdChatsSearch(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats/search",
    ...options,
  });
}

/**
 * [Chats] GET /api/clubs/{clubId}/chats/{threadId}
 * Path params: clubId, threadId
 * Query params: Page, PageSize, BeforeMessageId
 * Responses: 200
 */
export function getApiClubsClubIdChatsThreadId(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/chats/{threadId}",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/direct
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsDirect(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/direct",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/group
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsGroup(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/group",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/archive
 * Path params: clubId, threadId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdArchive(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/archive",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/leave
 * Path params: clubId, threadId
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdLeave(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/leave",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/members
 * Path params: clubId, threadId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdMembers(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/members",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/members/role
 * Path params: clubId, threadId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdMembersRole(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/members/role",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/messages
 * Path params: clubId, threadId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdMessages(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions
 * Path params: clubId, threadId, messageId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdMessagesMessageIdReactions(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/messages/{messageId}/reactions",
    ...options,
  });
}

/**
 * [Chats] POST /api/clubs/{clubId}/chats/{threadId}/mute
 * Path params: clubId, threadId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdChatsThreadIdMute(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/chats/{threadId}/mute",
    ...options,
  });
}

export const ChatsApi = {
  deleteApiClubsClubIdChatsThreadIdMembersMemberId,
  deleteApiClubsClubIdChatsThreadIdMessagesMessageIdReactions,
  getApiClubsClubIdChats,
  getApiClubsClubIdChatsSearch,
  getApiClubsClubIdChatsThreadId,
  postApiClubsClubIdChatsDirect,
  postApiClubsClubIdChatsGroup,
  postApiClubsClubIdChatsThreadIdArchive,
  postApiClubsClubIdChatsThreadIdLeave,
  postApiClubsClubIdChatsThreadIdMembers,
  postApiClubsClubIdChatsThreadIdMembersRole,
  postApiClubsClubIdChatsThreadIdMessages,
  postApiClubsClubIdChatsThreadIdMessagesMessageIdReactions,
  postApiClubsClubIdChatsThreadIdMute,
} as const;

