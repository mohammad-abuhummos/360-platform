import { useEffect, useState } from "react";
import { useAuth } from "~/context/auth-context";
import { getClubMemberByUserId } from "~/lib/firestore-team";
import { getClubRoleById, NAV_TABS } from "~/lib/firestore-roles";

/**
 * Fetches the current user's navigation permissions for the active club.
 * - If user has a club member record with roleId, fetches that role's permissions.
 * - If user is admin (from UserProfile.role), returns all tabs.
 * - If no role or member found, returns empty (minimal access).
 */
export function useUserPermissions(): {
    permissions: string[];
    loading: boolean;
    error: string | null;
} {
    const { firebaseUser, activeClub, profile } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firebaseUser?.uid || !activeClub?.id) {
            setPermissions([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const load = async () => {
            try {
                // Admin users see all tabs
                if (profile?.role === "admin") {
                    if (!cancelled) {
                        setPermissions([...NAV_TABS]);
                        setLoading(false);
                    }
                    return;
                }

                const member = await getClubMemberByUserId(activeClub.id, firebaseUser.uid);
                if (cancelled) return;

                if (!member) {
                    setPermissions([]);
                    setLoading(false);
                    return;
                }

                const roleId = member.roleId;
                if (!roleId) {
                    // No role assigned - minimal access (or all for backward compat)
                    setPermissions([]);
                    setLoading(false);
                    return;
                }

                const role = await getClubRoleById(activeClub.id, roleId);
                if (cancelled) return;

                setPermissions(role?.permissions ?? []);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load permissions");
                    setPermissions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [firebaseUser?.uid, activeClub?.id, profile?.role]);

    return { permissions, loading, error };
}
