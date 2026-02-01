export const API_TOKEN_STORAGE_KEY = "sportsplatform_api_token";
export const API_TOKEN_EXPIRES_AT_STORAGE_KEY = "sportsplatform_api_token_expires_at";

type StorageTarget = "local" | "session";

function getStorage(target: StorageTarget): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return target === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getStoredApiToken(): string | null {
  const local = getStorage("local");
  const session = getStorage("session");

  return local?.getItem(API_TOKEN_STORAGE_KEY) ?? session?.getItem(API_TOKEN_STORAGE_KEY) ?? null;
}

export function getStoredApiTokenExpiresAt(): string | null {
  const local = getStorage("local");
  const session = getStorage("session");

  return (
    local?.getItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY) ??
    session?.getItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY) ??
    null
  );
}

export function setStoredApiToken(args: { token: string; expiresAt?: string | null; persist?: boolean }) {
  const persist: StorageTarget = args.persist === false ? "session" : "local";
  const keep = getStorage(persist);
  const clear = getStorage(persist === "local" ? "session" : "local");

  keep?.setItem(API_TOKEN_STORAGE_KEY, args.token);
  if (args.expiresAt) {
    keep?.setItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY, args.expiresAt);
  } else {
    keep?.removeItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY);
  }

  // Ensure only one storage has the token
  clear?.removeItem(API_TOKEN_STORAGE_KEY);
  clear?.removeItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY);
}

export function clearStoredApiToken() {
  const local = getStorage("local");
  const session = getStorage("session");

  local?.removeItem(API_TOKEN_STORAGE_KEY);
  local?.removeItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY);
  session?.removeItem(API_TOKEN_STORAGE_KEY);
  session?.removeItem(API_TOKEN_EXPIRES_AT_STORAGE_KEY);
}

