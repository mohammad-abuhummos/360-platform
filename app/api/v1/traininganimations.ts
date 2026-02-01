import { request } from "./request";
import type { TemplateApiRequestOptions } from "./request";

/**
 * Swagger tag: TrainingAnimations
 */

export function getApiTrainingAnimationsAssets(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "GET",
    path: "/api/training/animations/assets",
    ...options,
  });
}

export function postApiTrainingAnimations(options: TemplateApiRequestOptions = {}) {
  return request({
    method: "POST",
    path: "/api/training/animations",
    ...options,
  });
}

export const trainingAnimationsApi = {
  getApiTrainingAnimationsAssets,
  postApiTrainingAnimations,
} as const;

