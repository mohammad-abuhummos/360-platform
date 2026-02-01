import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: Posts
 */

export function getApiClubsClubIdPosts(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts",
    ...options,
  });
}

export function postApiClubsClubIdPosts(options: TemplateApiRequestOptions & { pathParams: { clubId: string } }) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts",
    ...options,
  });
}

export function getApiClubsClubIdPostsPostId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

export function putApiClubsClubIdPostsPostId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "PUT",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

export function deleteApiClubsClubIdPostsPostId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdPublish(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/publish",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdComments(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/comments",
    ...options,
  });
}

export function deleteApiClubsClubIdPostsPostIdCommentsCommentId(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string; commentId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}/comments/{commentId}",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdCommentsCommentIdReport(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string; commentId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/comments/{commentId}/report",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdReport(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/report",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdReactions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/reactions",
    ...options,
  });
}

export function deleteApiClubsClubIdPostsPostIdReactions(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "DELETE",
    path: "/api/clubs/{clubId}/posts/{postId}/reactions",
    ...options,
  });
}

export function postApiClubsClubIdPostsPostIdViews(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "POST",
    path: "/api/clubs/{clubId}/posts/{postId}/views",
    ...options,
  });
}

export function getApiClubsClubIdPostsPostIdViews(
  options: TemplateApiRequestOptions & { pathParams: { clubId: string; postId: string } }
) {
  return request({
    method: "GET",
    path: "/api/clubs/{clubId}/posts/{postId}/views",
    ...options,
  });
}

export const postsApi = {
  getApiClubsClubIdPosts,
  postApiClubsClubIdPosts,
  getApiClubsClubIdPostsPostId,
  putApiClubsClubIdPostsPostId,
  deleteApiClubsClubIdPostsPostId,
  postApiClubsClubIdPostsPostIdPublish,
  postApiClubsClubIdPostsPostIdComments,
  deleteApiClubsClubIdPostsPostIdCommentsCommentId,
  postApiClubsClubIdPostsPostIdCommentsCommentIdReport,
  postApiClubsClubIdPostsPostIdReport,
  postApiClubsClubIdPostsPostIdReactions,
  deleteApiClubsClubIdPostsPostIdReactions,
  postApiClubsClubIdPostsPostIdViews,
  getApiClubsClubIdPostsPostIdViews,
} as const;

