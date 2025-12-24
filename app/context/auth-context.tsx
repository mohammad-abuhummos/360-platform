import type { User } from "firebase/auth";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { signInWithEmail, signOutCurrentUser, subscribeToAuthChanges } from "~/lib/firebase-auth";
import {
    ensureUserProfile,
    fetchClubsForUser,
    updateUserActiveClub,
    type Club,
    type UserProfile,
} from "~/lib/firestore-users";

type AuthContextValue = {
    firebaseUser: User | null;
    profile: UserProfile | null;
    clubs: Club[];
    activeClub: Club | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    setActiveClub: (clubId: string) => Promise<void>;
    clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        let isMounted = true;
        let unsubscribe: (() => void) | undefined;

        const init = async () => {
            try {
                unsubscribe = await subscribeToAuthChanges(async (nextUser) => {
                    if (!isMounted) {
                        return;
                    }

                    setFirebaseUser(nextUser);

                    if (!nextUser) {
                        setProfile(null);
                        setClubs([]);
                        setLoading(false);
                        return;
                    }

                    setLoading(true);

                    try {
                        const ensuredProfile = await ensureUserProfile(
                            nextUser.uid,
                            nextUser.email,
                            nextUser.displayName
                        );

                        if (!isMounted) {
                            return;
                        }

                        setProfile(ensuredProfile);
                        const userClubs = await fetchClubsForUser(nextUser.uid);

                        if (!isMounted) {
                            return;
                        }

                        setClubs(userClubs);
                        setError(null);
                    } catch (profileError) {
                        if (!isMounted) {
                            return;
                        }

                        const message =
                            profileError instanceof Error
                                ? profileError.message
                                : "Unable to load your profile.";
                        setError(message);
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
                });
            } catch (subscriptionError) {
                if (!isMounted) {
                    return;
                }

                const message =
                    subscriptionError instanceof Error
                        ? subscriptionError.message
                        : "Unable to connect to the authentication service.";
                setError(message);
                setLoading(false);
            }
        };

        void init();

        return () => {
            isMounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        await signInWithEmail(email, password).catch((authError) => {
            const message =
                authError instanceof Error ? authError.message : "Unable to sign in right now.";
            setError(message);
            throw authError;
        });
    }, []);

    const signOut = useCallback(async () => {
        setError(null);
        await signOutCurrentUser().catch((authError) => {
            const message =
                authError instanceof Error ? authError.message : "Unable to sign out right now.";
            setError(message);
            throw authError;
        });
    }, []);

    const setActiveClub = useCallback(
        async (clubId: string) => {
            if (!profile) {
                throw new Error("Cannot change club without a profile.");
            }

            await updateUserActiveClub(profile.id, clubId);
            setProfile((existing) =>
                existing ? { ...existing, activeClubId: clubId } : existing
            );
        },
        [profile]
    );

    const clearError = useCallback(() => setError(null), []);

    const activeClub = useMemo(() => {
        if (!profile) {
            return null;
        }

        return clubs.find((club) => club.id === profile.activeClubId) ?? null;
    }, [clubs, profile]);

    const value = useMemo<AuthContextValue>(
        () => ({
            firebaseUser,
            profile,
            clubs,
            activeClub,
            loading,
            error,
            signIn,
            signOut,
            setActiveClub,
            clearError,
        }),
        [firebaseUser, profile, clubs, activeClub, loading, error, signIn, signOut, setActiveClub, clearError]
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


