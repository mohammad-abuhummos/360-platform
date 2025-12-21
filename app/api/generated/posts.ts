// Auto-generated client for tag "Posts".
// Do not edit manually. Run `npm run generate:api`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";

/**
 * [Posts] DELETE /api/clubs/{clubId}/posts/{postId}
 * Path params: clubId, postId
 * Responses: 200
 */
export function deleteApiClubsClubIdPostsPostId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

/**
 * [Posts] DELETE /api/clubs/{clubId}/posts/{postId}/comments/{commentId}
 * Path params: clubId, postId, commentId
 * Responses: 200
 */
export function deleteApiClubsClubIdPostsPostIdCommentsCommentId(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}/comments/{commentId}",
    ...options,
  });
}

/**
 * [Posts] DELETE /api/clubs/{clubId}/posts/{postId}/reactions
 * Path params: clubId, postId
 * Responses: 200
 */
export function deleteApiClubsClubIdPostsPostIdReactions(options: ApiRequestOptions = {}) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}/reactions",
    ...options,
  });
}

/**
 * [Posts] GET /api/clubs/{clubId}/posts
 * Path params: clubId
 * Query params: PageSize, Page, GroupId, Scope, IncludeDrafts, IncludeScheduled
 * Responses: 200
 */
export function getApiClubsClubIdPosts(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts",
    ...options,
  });
}

/**
 * [Posts] GET /api/clubs/{clubId}/posts/{postId}/views
 * Path params: clubId, postId
 * Responses: 200
 */
export function getApiClubsClubIdPostsPostIdViews(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts/{postId}/views",
    ...options,
  });
}

/**
 * [Posts] GET /api/clubs/{clubId}/posts/{postId}
 * Path params: clubId, postId
 * Query params: includeComments
 * Responses: 200
 */
export function getPostById(options: ApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts
 * Path params: clubId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPosts(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/comments
 * Path params: clubId, postId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdComments(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/comments",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/comments/{commentId}/report
 * Path params: clubId, postId, commentId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdCommentsCommentIdReport(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/comments/{commentId}/report",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/publish
 * Path params: clubId, postId
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdPublish(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/publish",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/reactions
 * Path params: clubId, postId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdReactions(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/reactions",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/report
 * Path params: clubId, postId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdReport(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/report",
    ...options,
  });
}

/**
 * [Posts] POST /api/clubs/{clubId}/posts/{postId}/views
 * Path params: clubId, postId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function postApiClubsClubIdPostsPostIdViews(options: ApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/views",
    ...options,
  });
}

/**
 * [Posts] PUT /api/clubs/{clubId}/posts/{postId}
 * Path params: clubId, postId
 * Body: optional (application/json, text/json, application/*+json)
 * Responses: 200
 */
export function putApiClubsClubIdPostsPostId(options: ApiRequestOptions = {}) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

export const PostsApi = {
  deleteApiClubsClubIdPostsPostId,
  deleteApiClubsClubIdPostsPostIdCommentsCommentId,
  deleteApiClubsClubIdPostsPostIdReactions,
  getApiClubsClubIdPosts,
  getApiClubsClubIdPostsPostIdViews,
  getPostById,
  postApiClubsClubIdPosts,
  postApiClubsClubIdPostsPostIdComments,
  postApiClubsClubIdPostsPostIdCommentsCommentIdReport,
  postApiClubsClubIdPostsPostIdPublish,
  postApiClubsClubIdPostsPostIdReactions,
  postApiClubsClubIdPostsPostIdReport,
  postApiClubsClubIdPostsPostIdViews,
  putApiClubsClubIdPostsPostId,
} as const;

