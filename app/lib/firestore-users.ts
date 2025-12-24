import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    type DocumentData,
    type Timestamp,
} from "firebase/firestore";
import { db } from "~/lib/firebase";

type MembershipRole = "Administrator" | "Staff" | "Player";
export type UserRole = "admin" | "staff" | "player";

export type Club = {
    id: string;
    name: string;
    description?: string;
    tagline?: string;
    slug: string;
    membershipRole: MembershipRole;
    displayOrder: number;
    ownerUid: string;
};

export type UserProfile = {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    clubIds: string[];
    activeClubId: string | null;
};

type FirestoreUserDocument = {
    email?: string;
    displayName?: string;
    role?: string;
    clubIds?: string[];
    activeClubId?: string | null;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

type FirestoreClubDocument = DocumentData & {
    name: string;
    description?: string;
    tagline?: string;
    slug?: string;
    membershipRole?: MembershipRole;
    displayOrder?: number;
    ownerUid?: string;
    memberIds?: string[];
    memberships?: Record<
        string,
        {
            role: MembershipRole;
            status: "active" | "invited";
            assignedAt?: Timestamp;
        }
    >;
};

type SeedClub = {
    slug: string;
    name: string;
    description?: string;
    tagline?: string;
    membershipRole: MembershipRole;
    displayOrder: number;
};

const DEFAULT_CLUBS: SeedClub[] = [
    { slug: "club-lobby", name: "Club lobby", description: "Registrations and club info", membershipRole: "Administrator", displayOrder: 1 },
    { slug: "jordan-knights-football-club", name: "Jordan Knights Football Club", membershipRole: "Administrator", displayOrder: 2 },
    { slug: "2021", name: "2021", description: "Staff group", membershipRole: "Staff", displayOrder: 3 },
    { slug: "al-aqaba", name: "Al-Aqaba", membershipRole: "Administrator", displayOrder: 4 },
    { slug: "al-ramtha", name: "Al-Ramtha", membershipRole: "Administrator", displayOrder: 5 },
    { slug: "al-salt", name: "Al-Salt", membershipRole: "Administrator", displayOrder: 6 },
    { slug: "amman", name: "Amman", membershipRole: "Player", displayOrder: 7 },
    { slug: "club-youth-teams", name: "Club Youth Teams", membershipRole: "Administrator", displayOrder: 8 },
    { slug: "dev", name: "Dev", membershipRole: "Player", displayOrder: 9 },
    { slug: "grassroots", name: "Grassroots", membershipRole: "Administrator", displayOrder: 10 },
];

const USER_COLLECTION = "users";
const CLUB_COLLECTION = "clubs";

const DEFAULT_DISPLAY_NAME = "Administrator";

const isUserRole = (role: unknown): role is UserRole => role === "admin" || role === "staff" || role === "player";

async function seedDefaultClubs(uid: string, email?: string | null): Promise<Club[]> {
    const clubsRef = collection(db, CLUB_COLLECTION);
    const seeded: Club[] = [];

    await Promise.all(
        DEFAULT_CLUBS.map(async (club) => {
            const clubId = `${uid}-${club.slug}`;
            const clubRef = doc(clubsRef, clubId);

            await setDoc(
                clubRef,
                {
                    name: club.name,
                    description: club.description ?? null,
                    tagline: club.tagline ?? null,
                    slug: club.slug,
                    membershipRole: club.membershipRole,
                    displayOrder: club.displayOrder,
                    ownerUid: uid,
                    contactEmail: email ?? null,
                    memberIds: arrayUnion(uid),
                    memberships: {
                        [uid]: {
                            role: club.membershipRole,
                            status: "active",
                            assignedAt: serverTimestamp(),
                        },
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            seeded.push({
                id: clubId,
                name: club.name,
                description: club.description,
                tagline: club.tagline,
                slug: club.slug,
                membershipRole: club.membershipRole,
                displayOrder: club.displayOrder,
                ownerUid: uid,
            });
        })
    );

    return seeded;
}

export async function ensureUserProfile(uid: string, email?: string | null, displayName?: string | null): Promise<UserProfile> {
    const userRef = doc(db, USER_COLLECTION, uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const seededClubs = await seedDefaultClubs(uid, email);
        const clubIds = seededClubs.map((club) => club.id);
        const activeClubId = clubIds[0] ?? null;

        const profile: UserProfile = {
            id: uid,
            email: email ?? "",
            displayName: displayName ?? DEFAULT_DISPLAY_NAME,
            role: "admin",
            clubIds,
            activeClubId,
        };

        await setDoc(userRef, {
            email: profile.email,
            displayName: profile.displayName,
            role: profile.role,
            clubIds: profile.clubIds,
            activeClubId: profile.activeClubId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return profile;
    }

    const data = snapshot.data() as FirestoreUserDocument;
    let clubIds = Array.isArray(data.clubIds) ? data.clubIds : [];

    if (clubIds.length === 0) {
        const seeded = await seedDefaultClubs(uid, data.email ?? email ?? null);
        clubIds = seeded.map((club) => club.id);
        await updateDoc(userRef, {
            clubIds,
            activeClubId: clubIds[0] ?? null,
            updatedAt: serverTimestamp(),
        });
    }

    const role = isUserRole(data.role) ? data.role : "admin";
    const resolvedEmail = data.email ?? email ?? "";
    const resolvedDisplayName = data.displayName ?? displayName ?? resolvedEmail ?? DEFAULT_DISPLAY_NAME;

    return {
        id: uid,
        email: resolvedEmail,
        displayName: resolvedDisplayName || DEFAULT_DISPLAY_NAME,
        role,
        clubIds,
        activeClubId: data.activeClubId ?? clubIds[0] ?? null,
    };
}

export async function fetchClubsForUser(uid: string): Promise<Club[]> {
    const clubsRef = collection(db, CLUB_COLLECTION);
    const clubsQuery = query(clubsRef, where("memberIds", "array-contains", uid));
    const snapshot = await getDocs(clubsQuery);

    if (snapshot.empty) {
        return seedDefaultClubs(uid);
    }

    const clubs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as FirestoreClubDocument;
        const membershipRole = data.memberships?.[uid]?.role ?? data.membershipRole ?? "Administrator";

        return {
            id: docSnap.id,
            name: data.name,
            description: data.description ?? undefined,
            tagline: data.tagline ?? undefined,
            slug: data.slug ?? docSnap.id,
            membershipRole,
            displayOrder: data.displayOrder ?? 0,
            ownerUid: data.ownerUid ?? uid,
        };
    });

    return clubs.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function updateUserActiveClub(uid: string, clubId: string): Promise<void> {
    const userRef = doc(db, USER_COLLECTION, uid);
    await updateDoc(userRef, {
        activeClubId: clubId,
        updatedAt: serverTimestamp(),
    });
}


