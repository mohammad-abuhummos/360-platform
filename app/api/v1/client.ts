import { getApiConfig } from "./config";
import { ApiError, type ApiClient, type ApiRequestOptions, type CreateApiClientArgs, type QueryValue } from "./types";

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function ensureLeadingSlash(value: string): string {
  if (value.length === 0) return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function stripTrailingSlashUnlessRoot(value: string): string {
  if (value === "/") return value;
  return stripTrailingSlash(value);
}

function toQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) return "";

  const params = new URLSearchParams();

  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined || raw === null) continue;

    if (Array.isArray(raw)) {
      for (const item of raw) {
        params.append(key, String(item));
      }
      continue;
    }

    params.append(key, String(raw));
  }

  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

function createRequestId(): string {
  try {
    const c = globalThis.crypto as Crypto | undefined;
    if (c?.randomUUID) return c.randomUUID();
  } catch {
    // ignore
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function previewBody(value: unknown, maxLen = 1000): unknown {
  if (typeof value === "string") {
    return value.length > maxLen ? `${value.slice(0, maxLen)}…` : value;
  }
  return value;
}

async function getFirebaseIdToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const { getCurrentUser } = await import("~/lib/firebase-auth");
    const user = await getCurrentUser();
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export function createApiClient(args: CreateApiClientArgs): ApiClient {
  const fetchImpl = args.fetchImpl ?? fetch;
  const baseUrl = stripTrailingSlash(args.baseUrl);
  const basePath = stripTrailingSlashUnlessRoot(ensureLeadingSlash(args.basePath));

  return {
    async request<T>(method: string, path: string, options?: ApiRequestOptions & { body?: unknown }): Promise<T> {
      const requestId = createRequestId();
      const startedAt = Date.now();

      const authEnabled = options?.auth ?? true;
      const logEnabled = options?.log ?? args.defaultLogEnabled;

      const finalPath = ensureLeadingSlash(path);
      const urlBase = isAbsoluteUrl(finalPath) ? finalPath : `${baseUrl}${basePath}${finalPath}`;

      if (typeof window === "undefined" && !isAbsoluteUrl(urlBase) && baseUrl.length === 0) {
        throw new Error(
          "API base URL is required during SSR. Set VITE_API_BASE_URL (e.g. https://api.example.com)."
        );
      }

      const url = `${urlBase}${toQueryString(options?.query)}`;

      const headers = new Headers(options?.headers);
      if (!headers.has("accept")) headers.set("accept", "application/json");

      if (authEnabled) {
        const token = (await args.getBearerToken?.()) ?? (await getFirebaseIdToken());
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }

      const init: RequestInit = { method, headers, signal: options?.signal };

      if (options && "body" in options) {
        const body = options.body;
        if (body instanceof FormData) {
          init.body = body;
        } else if (typeof body === "string") {
          init.body = body;
        } else if (body === undefined || body === null) {
          // omit
        } else {
          if (!headers.has("content-type")) {
            headers.set("content-type", "application/json");
          }
          init.body = JSON.stringify(body);
        }
      }

      if (logEnabled) {
        const safeHeaders: Record<string, string> = {};
        headers.forEach((value, key) => {
          if (key.toLowerCase() === "authorization") return;
          safeHeaders[key] = value;
        });

        console.log("[api]", { requestId, method, url, headers: safeHeaders });
      }

      const res = await fetchImpl(url, init);

      const contentType = res.headers.get("content-type") ?? "";
      let responseBody: unknown = undefined;

      if (res.status !== 204) {
        if (contentType.includes("application/json")) {
          responseBody = await res.json().catch(async () => previewBody(await res.text()));
        } else {
          responseBody = previewBody(await res.text());
        }
      }

      const durationMs = Date.now() - startedAt;

      if (logEnabled) {
        console.log("[api]", {
          requestId,
          method,
          url,
          status: res.status,
          durationMs,
          response: responseBody === undefined ? undefined : previewBody(responseBody),
        });
      }

      if (!res.ok) {
        throw new ApiError({
          message: `API request failed: ${method} ${url} (${res.status})`,
          status: res.status,
          method,
          url,
          requestId,
          responseBody,
        });
      }

      return responseBody as T;
    },

    get<T>(path: string, options?: ApiRequestOptions) {
      return this.request<T>("GET", path, options);
    },
    post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
      return this.request<T>("POST", path, { ...options, body });
    },
    put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
      return this.request<T>("PUT", path, { ...options, body });
    },
    patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
      return this.request<T>("PATCH", path, { ...options, body });
    },
    delete<T>(path: string, options?: ApiRequestOptions) {
      return this.request<T>("DELETE", path, options);
    },
  };
}

export const apiV1: ApiClient = (() => {
  const cfg = getApiConfig();
  return createApiClient({
    baseUrl: cfg.baseUrl,
    basePath: cfg.basePath,
    defaultLogEnabled: cfg.logsEnabled,
  });
})();

/**
 * Root-scoped client for Swagger paths that do NOT start with `/api/...`
 * (e.g. `/scalar`, `/scaler`).
 */
export const apiRoot: ApiClient = (() => {
  const cfg = getApiConfig();
  return createApiClient({
    baseUrl: cfg.baseUrl,
    basePath: "",
    defaultLogEnabled: cfg.logsEnabled,
  });
})();

