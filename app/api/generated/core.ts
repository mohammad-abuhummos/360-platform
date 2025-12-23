/**
 * Auto-generated API request helpers.
 * Do not edit manually. Run `npm run generate:api`.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface ApiRequestOptions {
  baseUrl?: string;
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  init?: RequestInit;
}

export interface RequestConfig extends ApiRequestOptions {
  method: HttpMethod;
  path: string;
}

const DEFAULT_BASE_URL = resolveDefaultBaseUrl();

export function request(config: RequestConfig): Promise<Response> {
  const url = buildUrl(config.path, config.baseUrl ?? DEFAULT_BASE_URL, config.pathParams, config.query);
  const headers = new Headers(config.init?.headers ?? {});

  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      if (value === undefined) continue;
      headers.set(key, value);
    }
  }

  const body = resolveBody(headers, config.body);

  const init: RequestInit = {
    ...config.init,
    method: config.method,
    headers,
    body,
  };

  return fetch(url, init);
}

function buildUrl(
  pathTemplate: string,
  baseUrl?: string,
  pathParams: Record<string, string | number> = {},
  query: Record<string, string | number | boolean | undefined> = {},
) {
  const pathWithParams = pathTemplate.replace(/\{([^}]+)\}/g, (_, paramName) => {
    if (!(paramName in pathParams)) {
      throw new Error(`Missing path parameter "${paramName}" for ${pathTemplate}`);
    }
    return encodeURIComponent(String(pathParams[paramName]));
  });

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  const relativeUrl = queryString ? `${pathWithParams}?${queryString}` : pathWithParams;

  if (!baseUrl) return relativeUrl;
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return `${baseUrl.replace(/\/$/, "")}${relativeUrl}`;
  }
}

function resolveBody(headers: Headers, body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has("Content-Type") && !headers.has("content-type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function isBodyInit(value: unknown): value is BodyInit {
  if (typeof value === "string") return true;
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) return true;
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) return true;
  return false;
}

function resolveDefaultBaseUrl() {
  if (typeof process !== "undefined" && typeof process.env === "object" && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }

  if (
    typeof import.meta !== "undefined" &&
    typeof import.meta.env === "object" &&
    import.meta.env?.VITE_API_BASE_URL
  ) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return undefined;
}

