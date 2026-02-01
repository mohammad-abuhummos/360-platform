export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | null | undefined | QueryPrimitive[];

export type ApiRequestOptions = {
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  /**
   * When true (default), will attach Authorization: Bearer <token> if available.
   * When false, will never attach Authorization.
   */
  auth?: boolean;
  /**
   * Per-request logging override. When omitted, falls back to env/global default.
   */
  log?: boolean;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly requestId: string;
  readonly responseBody: unknown;

  constructor(args: {
    message: string;
    status: number;
    method: string;
    url: string;
    requestId: string;
    responseBody: unknown;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.method = args.method;
    this.url = args.url;
    this.requestId = args.requestId;
    this.responseBody = args.responseBody;
  }
}

export type CreateApiClientArgs = {
  baseUrl: string; // e.g. "https://api.example.com" (no trailing slash preferred)
  basePath: string; // e.g. "/api" or "/api/v1"
  defaultLogEnabled: boolean;
  getBearerToken?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
};

export type ApiClient = {
  request<T>(
    method: string,
    path: string,
    options?: ApiRequestOptions & { body?: unknown }
  ): Promise<T>;
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

