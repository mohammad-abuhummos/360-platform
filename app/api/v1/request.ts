import { apiRoot, apiV1 } from "./client";
import type { ApiRequestOptions } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type TemplateApiRequestOptions = ApiRequestOptions & {
  pathParams?: Record<string, string | number>;
  body?: unknown;
};

function fillPathParams(pathTemplate: string, pathParams: Record<string, string | number> | undefined): string {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_match, paramName: string) => {
    if (!pathParams || !(paramName in pathParams)) {
      throw new Error(`Missing path parameter "${paramName}" for ${pathTemplate}`);
    }
    return encodeURIComponent(String(pathParams[paramName]));
  });
}

function stripApiPrefix(swaggerPath: string): string {
  // swagger paths are either "/api/..." or root paths like "/scalar"
  if (swaggerPath === "/api") return "/";
  if (swaggerPath.startsWith("/api/")) return swaggerPath.slice("/api".length);
  return swaggerPath;
}

export function request<T = unknown>(config: {
  method: HttpMethod;
  path: string; // swagger path (e.g. "/api/sports", "/scalar")
} & TemplateApiRequestOptions): Promise<T> {
  const filled = fillPathParams(config.path, config.pathParams);

  const isApiScoped = filled === "/api" || filled.startsWith("/api/");
  const normalizedPath = isApiScoped ? stripApiPrefix(filled) : filled;

  const { method, path: _path, pathParams: _pp, body, ...options } = config;
  const client = isApiScoped ? apiV1 : apiRoot;

  return client.request<T>(method, normalizedPath, { ...options, body });
}

