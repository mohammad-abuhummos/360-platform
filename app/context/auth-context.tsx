import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { postApiAuthLogin } from "~/api/v1/auth";
import { clearStoredApiToken, getStoredApiToken, setStoredApiToken } from "~/api/v1/token";
import type { Club, UserProfile, UserRole } from "~/lib/firestore-users";

type AuthContextValue = {
    /**
     * Kept for backward-compat with existing UI while migrating off Firebase.
     * This project is moving to API auth, so this is always null.
     */
    firebaseUser: null;
    profile: UserProfile | null;
    clubs: Club[];
    activeClub: Club | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    signIn: (emailOrUserName: string, password: string, options?: { persist?: boolean }) => Promise<void>;
    signOut: () => Promise<void>;
    setActiveClub: (clubId: string) => Promise<void>;
    clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [clubs] = useState<Club[]>([]);
    const [activeClub, setActiveClubState] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!token;

    useEffect(() => {
        if (typeof window === "undefined") {
            setLoading(false);
            return;
        }

        const existingToken = getStoredApiToken();
        if (existingToken) {
            setToken(existingToken);
            setProfile(buildProfileFromJwt(existingToken));
        } else {
            setToken(null);
            setProfile(null);
        }

        setLoading(false);
    }, []);

    const signIn = useCallback(async (emailOrUserName: string, password: string, options?: { persist?: boolean }) => {
        setError(null);

        try {
            const response = await postApiAuthLogin({
                auth: false,
                body: { userName: emailOrUserName, password },
            });

            const parsed = parseLoginResponse(response);
            setStoredApiToken({
                token: parsed.data.token,
                expiresAt: parsed.data.expiresAt ?? null,
                persist: options?.persist ?? true,
            });

            setToken(parsed.data.token);
            setProfile(buildProfileFromJwt(parsed.data.token));
        } catch (authError) {
            const message = authError instanceof Error ? authError.message : "Unable to sign in right now.";
            setError(message);
            throw authError;
        }
    }, []);

    const signOut = useCallback(async () => {
        setError(null);
        clearStoredApiToken();
        setToken(null);
        setProfile(null);
        setActiveClubState(null);
    }, []);

    const setActiveClub = useCallback(async (clubId: string) => {
        // Temporary: until clubs are loaded from API, we only persist the activeClubId in memory.
        setProfile((existing) => (existing ? { ...existing, activeClubId: clubId } : existing));
        setActiveClubState((existing) => (existing ? { ...existing, id: clubId } : existing));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value = useMemo<AuthContextValue>(
        () => ({
            firebaseUser: null,
            profile,
            clubs,
            activeClub,
            token,
            isAuthenticated,
            loading,
            error,
            signIn,
            signOut,
            setActiveClub,
            clearError,
        }),
        [profile, clubs, activeClub, token, isAuthenticated, loading, error, signIn, signOut, setActiveClub, clearError]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}

type LoginResponse = {
    success: boolean;
    message?: string | null;
    data?: {
        token?: string | null;
        expiresAt?: string | null;
    } | null;
    errors?: unknown;
};

function parseLoginResponse(value: unknown): LoginResponse & { data: { token: string; expiresAt?: string | null } } {
    if (!value || typeof value !== "object") {
        throw new Error("Unexpected login response.");
    }

    const v = value as LoginResponse;
    if (!v.success) {
        throw new Error(v.message || "Login failed.");
    }

    const token = v.data?.token ?? null;
    if (!token) {
        throw new Error("Login succeeded but no token was returned.");
    }

    return { ...v, data: { token, expiresAt: v.data?.expiresAt ?? null } };
}

function buildProfileFromJwt(token: string): UserProfile {
    const payload = decodeJwtPayload(token);
    const id = (payload?.sub && String(payload.sub)) || "unknown";
    const email = typeof payload?.email === "string" ? payload.email : "unknown@example.com";
    const displayName =
        (typeof payload?.unique_name === "string" && payload.unique_name) ||
        (typeof payload?.["unique_name"] === "string" && (payload as any)["unique_name"]) ||
        email;

    const roleClaim =
        payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        payload?.role ??
        payload?.["role"];

    const roleText = Array.isArray(roleClaim) ? String(roleClaim[0] ?? "") : String(roleClaim ?? "");
    const role: UserRole =
        roleText.toLowerCase().includes("player") ? "player" : roleText.toLowerCase().includes("staff") ? "staff" : "admin";

    return {
        id,
        email,
        displayName,
        role,
        clubIds: [],
        activeClubId: null,
    };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
        const base64Url = parts[1] ?? "";
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const atobImpl = (globalThis as any).atob as ((input: string) => string) | undefined;
        if (!atobImpl) return null;
        const json = atobImpl(padded);
        const parsed = JSON.parse(json);
        return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}

