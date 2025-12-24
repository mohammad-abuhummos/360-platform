import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "~/lib/firebase";

export type MemberRole = "User" | "Staff" | "Admin";
export type MemberSegment = "player" | "staff";
export type MemberStatus = "active" | "invited";

export type ClubMember = {
    id: string;
    name: string;
    initials: string;
    role: MemberRole;
    title?: string | null;
    email: string;
    segment: MemberSegment;
    status: MemberStatus;
    clubId: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

type FirestoreMember = Omit<ClubMember, "id">;

export type InviteMemberPayload = {
    name: string;
    email: string;
    role: MemberRole;
    segment: MemberSegment;
    title?: string;
};

const CLUBS_COLLECTION = "clubs";
const MEMBERS_SUBCOLLECTION = "members";

const DEFAULT_MEMBERS: Omit<FirestoreMember, "clubId">[] = [
    {
        name: "Malak Malak",
        initials: "MM",
        role: "User",
        title: "Forward · U18",
        email: "malak.malak@smt.com.jo",
        segment: "player",
        status: "active",
    },
    {
        name: "Sara Haddad",
        initials: "SH",
        role: "User",
        title: "Midfielder · U21",
        email: "sara.haddad@smt.com.jo",
        segment: "player",
        status: "active",
    },
    {
        name: "Omar Aburumman",
        initials: "OA",
        role: "User",
        title: "Goalkeeper · Senior",
        email: "omar.aburumman@smt.com.jo",
        segment: "player",
        status: "active",
    },
    {
        name: "Abdallah Kanash",
        initials: "AK",
        role: "Admin",
        title: "Head coach",
        email: "abdallah.kanash@smt.com.jo",
        segment: "staff",
        status: "active",
    },
    {
        name: "Abdullah El Qutati",
        initials: "AE",
        role: "Staff",
        title: "Assistant coach",
        email: "abdullah.elqutati@smt.com.jo",
        segment: "staff",
        status: "active",
    },
    {
        name: "Bashar Abdulalleh",
        initials: "BA",
        role: "Admin",
        title: "Technical director",
        email: "bashar.abdulalleh@smt.com.jo",
        segment: "staff",
        status: "active",
    },
    {
        name: "Eslam Ahmed",
        initials: "EA",
        role: "Staff",
        title: "Medical lead",
        email: "eslam.ahmed@smt.com.jo",
        segment: "staff",
        status: "active",
    },
    {
        name: "Lina Qudah",
        initials: "LQ",
        role: "Staff",
        title: "Team coordinator",
        email: "lina.qudah@smt.com.jo",
        segment: "staff",
        status: "active",
    },
];

const seededClubs = new Set<string>();

function membersCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION);
}

function formatMember(docSnap: QueryDocumentSnapshot<DocumentData>): ClubMember {
    const data = docSnap.data() as FirestoreMember;
    return {
        id: docSnap.id,
        ...data,
    };
}

async function ensureSeedMembers(clubId: string) {
    if (seededClubs.has(clubId)) {
        return;
    }

    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const clubSnap = await getDoc(clubRef);
    if (clubSnap.exists() && clubSnap.data()?.membersSeeded) {
        seededClubs.add(clubId);
        return;
    }

    const membersRef = membersCollection(clubId);
    const snapshot = await getDocs(query(membersRef, limit(1)));

    if (snapshot.empty) {
        await Promise.all(
            DEFAULT_MEMBERS.map((member) =>
                addDoc(membersRef, {
                    ...member,
                    clubId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                })
            )
        );
    }

    await setDoc(
        clubRef,
        {
            membersSeeded: true,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    seededClubs.add(clubId);
}

export function subscribeToClubMembers(
    clubId: string,
    onData: (members: ClubMember[]) => void,
    onError?: (error: Error | FirestoreError) => void
): Unsubscribe {
    void ensureSeedMembers(clubId).catch((error) => {
        if (onError && error instanceof Error) {
            onError(error);
        }
    });

    const membersRef = membersCollection(clubId);
    const membersQuery = query(membersRef, orderBy("segment"), orderBy("name"));

    return onSnapshot(
        membersQuery,
        (snapshot) => {
            const members = snapshot.docs.map(formatMember);
            onData(members);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function inviteClubMember(clubId: string, payload: InviteMemberPayload) {
    const membersRef = membersCollection(clubId);
    const trimmedName = payload.name.trim();
    const trimmedEmail = payload.email.trim().toLowerCase();

    await addDoc(membersRef, {
        clubId,
        name: trimmedName,
        initials: getInitials(trimmedName),
        role: payload.role,
        title: payload.title?.trim() || null,
        email: trimmedEmail,
        segment: payload.segment,
        status: "invited",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);
}


