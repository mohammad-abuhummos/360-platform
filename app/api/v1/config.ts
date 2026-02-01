function parseBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return defaultValue;
}

function getEnvString(key: string): string | undefined {
  const env = import.meta.env as Record<string, unknown>;
  const value = env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export type ApiConfig = {
  /**
   * API origin, e.g. "https://api.example.com".
   * Leave empty to use same-origin in the browser.
   *
   * Note: on the server (SSR) you should set this, because Node fetch cannot
   * resolve relative URLs without an origin.
   */
  baseUrl: string;
  /**
   * API path prefix. Set to "/api/v1" to switch to v1 routes.
   */
  basePath: string;
  /**
   * Global API logging flag (can be overridden per call).
   */
  logsEnabled: boolean;
};

export function getApiConfig(): ApiConfig {
  const baseUrl = getEnvString("VITE_API_BASE_URL") ?? "";
  const basePath = getEnvString("VITE_API_BASE_PATH") ?? "/api";

  const logsEnabled = parseBoolean(
    getEnvString("VITE_API_LOGS") ?? getEnvString("VITE_ENABLE_API_LOGS"),
    false
  );

  return { baseUrl, basePath, logsEnabled };
}

