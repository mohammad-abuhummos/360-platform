import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "~/lib/firebase";

export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type CreateRolePayload = {
    name: string;
    description: string;
    permissions: string[];
};

export type UpdateRolePayload = {
    name?: string;
    description?: string;
    permissions?: string[];
};

/** Navigation tabs that can be used as permissions */
export const NAV_TABS = [
    "Home",
    "Calendar",
    "Chat",
    "Team",
    "Management",
    "Payments",
    "Registrations",
    "Posts",
    "Scheduling",
    "Development",
    "Games",
    "Settings",
    "Support",
    "Public site",
] as const;

export type NavTab = (typeof NAV_TABS)[number];

/** Check if a permission set allows access to a tab */
export function canAccessTab(permissions: string[], tabKey: string): boolean {
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(tabKey);
}

/** Filter navigation items by permissions. Items without href are shown if any subItem is allowed. */
export function filterNavigationByPermissions<T extends { label: string; href?: string; subItems?: { label: string; href: string }[] }>(
    items: T[],
    permissions: string[]
): T[] {
    return items.filter((item) => {
        if (canAccessTab(permissions, item.label)) return true;
        if (item.subItems?.length) {
            return item.subItems.some((sub) => canAccessTab(permissions, item.label));
        }
        return false;
    });
}

const CLUBS_COLLECTION = "clubs";
const ROLES_SUBCOLLECTION = "roles";

function rolesCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, ROLES_SUBCOLLECTION);
}

function formatRole(docSnap: QueryDocumentSnapshot<DocumentData>): Role {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name ?? "",
        description: data.description ?? "",
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

export function subscribeToClubRoles(
    clubId: string,
    onData: (roles: Role[]) => void,
    onError?: (error: Error | FirestoreError) => void
): Unsubscribe {
    const rolesRef = rolesCollection(clubId);
    const rolesQuery = query(rolesRef, orderBy("name"));

    return onSnapshot(
        rolesQuery,
        (snapshot) => {
            const roles = snapshot.docs.map(formatRole);
            onData(roles);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function createClubRole(clubId: string, payload: CreateRolePayload): Promise<string> {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
        throw new Error("Role name is required");
    }

    const rolesRef = rolesCollection(clubId);
    const snapshot = await getDocs(rolesRef);
    const existing = snapshot.docs.find(
        (d) => (d.data().name as string)?.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
        throw new Error(`A role named "${trimmedName}" already exists`);
    }

    const docRef = await addDoc(rolesRef, {
        name: trimmedName,
        description: (payload.description ?? "").trim(),
        permissions: payload.permissions ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateClubRole(
    clubId: string,
    roleId: string,
    payload: UpdateRolePayload
): Promise<void> {
    const rolesRef = rolesCollection(clubId);
    const snapshot = await getDocs(rolesRef);

    if (payload.name !== undefined) {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
            throw new Error("Role name is required");
        }
        const duplicate = snapshot.docs.find(
            (d) => d.id !== roleId && (d.data().name as string)?.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`A role named "${trimmedName}" already exists`);
        }
    }

    const docRef = doc(db, CLUBS_COLLECTION, clubId, ROLES_SUBCOLLECTION, roleId);
    const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.description !== undefined) updates.description = payload.description.trim();
    if (payload.permissions !== undefined) updates.permissions = payload.permissions;

    await updateDoc(docRef, updates);
}

export async function deleteClubRole(clubId: string, roleId: string): Promise<void> {
    const docRef = doc(db, CLUBS_COLLECTION, clubId, ROLES_SUBCOLLECTION, roleId);
    await deleteDoc(docRef);
}

/** Fetch all roles for a club (one-time, non-subscription) */
export async function getClubRoles(clubId: string): Promise<Role[]> {
    const rolesRef = rolesCollection(clubId);
    const rolesQuery = query(rolesRef, orderBy("name"));
    const snapshot = await getDocs(rolesQuery);
    return snapshot.docs.map(formatRole);
}

/** Fetch a single role by ID */
export async function getClubRoleById(clubId: string, roleId: string): Promise<Role | null> {
    const roleRef = doc(db, CLUBS_COLLECTION, clubId, ROLES_SUBCOLLECTION, roleId);
    const snap = await getDoc(roleRef);
    if (!snap.exists()) return null;
    return formatRole(snap as QueryDocumentSnapshot<DocumentData>);
}
