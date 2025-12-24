import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from "~/lib/firebase";

// Firebase config for secondary app (same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyAtxja0nrAKoqsE7E5W7_d3snPsrASRQ-8",
    authDomain: "platfrom-bf2a3.firebaseapp.com",
    projectId: "platfrom-bf2a3",
    storageBucket: "platfrom-bf2a3.firebasestorage.app",
    messagingSenderId: "962318157238",
    appId: "1:962318157238:web:f9183ade47cd60c494ed17"
};

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
    userId?: string; // Firebase Auth UID if member has a user account
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

export type UpdateMemberPayload = {
    name?: string;
    role?: MemberRole;
    title?: string | null;
    segment?: MemberSegment;
};

export async function updateClubMember(clubId: string, memberId: string, payload: UpdateMemberPayload) {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);

    const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };

    if (payload.name !== undefined) {
        const trimmedName = payload.name.trim();
        updates.name = trimmedName;
        updates.initials = getInitials(trimmedName);
    }

    if (payload.role !== undefined) {
        updates.role = payload.role;
    }

    if (payload.title !== undefined) {
        updates.title = payload.title?.trim() || null;
    }

    if (payload.segment !== undefined) {
        updates.segment = payload.segment;
    }

    await updateDoc(memberRef, updates);
}

export async function removeClubMember(clubId: string, memberId: string) {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    await deleteDoc(memberRef);
}

export async function activateClubMember(clubId: string, memberId: string, generatedPassword: string) {
    // Get the member data
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
        throw new Error("Member not found");
    }

    const memberData = memberSnap.data() as FirestoreMember;

    if (memberData.status === "active") {
        throw new Error("Member is already active");
    }

    // Create Firebase Auth user using a secondary app instance
    // This prevents signing out the current admin user
    let secondaryApp;
    let userId: string;

    try {
        // Check if secondary app already exists and delete it
        const existingApps = getApps();
        const existingSecondary = existingApps.find(app => app.name === "Secondary");
        if (existingSecondary) {
            await deleteApp(existingSecondary);
        }

        // Initialize a secondary Firebase app
        secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);

        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            memberData.email,
            generatedPassword
        );

        userId = userCredential.user.uid;

        // Update the user's display name
        await updateProfile(userCredential.user, {
            displayName: memberData.name,
        });

        // Sign out from secondary auth (important!)
        await secondaryAuth.signOut();

    } catch (authError: unknown) {
        // Clean up secondary app if it exists
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch {
                // Ignore cleanup errors
            }
        }

        // Handle specific Firebase Auth errors
        if (authError && typeof authError === "object" && "code" in authError) {
            const errorCode = (authError as { code: string }).code;
            if (errorCode === "auth/email-already-in-use") {
                throw new Error("A user with this email already exists. They can log in with their existing credentials.");
            }
            if (errorCode === "auth/invalid-email") {
                throw new Error("Invalid email address.");
            }
            if (errorCode === "auth/weak-password") {
                throw new Error("Password is too weak.");
            }
        }
        throw authError;
    } finally {
        // Always clean up secondary app
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch {
                // Ignore cleanup errors
            }
        }
    }

    // Create user document in Firestore users collection
    const userRef = doc(db, "users", userId);
    const userRole = memberData.role === "Admin" ? "admin" : memberData.role === "Staff" ? "staff" : "player";

    await setDoc(userRef, {
        email: memberData.email,
        displayName: memberData.name,
        role: userRole,
        clubIds: [clubId],
        activeClubId: clubId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Add user to club memberships
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const membershipRole = memberData.role === "Admin" ? "Administrator" : memberData.role === "Staff" ? "Staff" : "Player";

    await updateDoc(clubRef, {
        memberIds: arrayUnion(userId),
        [`memberships.${userId}`]: {
            role: membershipRole,
            status: "active",
            assignedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
    });

    // Update member status to active and link to user
    await updateDoc(memberRef, {
        status: "active",
        userId: userId,
        updatedAt: serverTimestamp(),
    });

    return {
        userId,
        email: memberData.email,
        tempPassword: generatedPassword,
    };
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);
}

function generatePassword(length = 12): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

const USER_COLLECTION = "users";

/**
 * Look up a user's Firebase Auth UID by their email address
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
    const usersRef = collection(db, USER_COLLECTION);
    const q = query(usersRef, where("email", "==", email), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return null;
    }
    
    return snapshot.docs[0].id;
}

/**
 * Look up multiple user IDs by their email addresses
 * Returns a map of email -> userId (null if not found)
 */
export async function getUserIdsByEmails(emails: string[]): Promise<Map<string, string | null>> {
    const result = new Map<string, string | null>();
    
    // Initialize all emails with null
    emails.forEach(email => result.set(email, null));
    
    if (emails.length === 0) return result;
    
    // Firestore 'in' query is limited to 30 items, so batch if needed
    const batches: string[][] = [];
    for (let i = 0; i < emails.length; i += 30) {
        batches.push(emails.slice(i, i + 30));
    }
    
    for (const batch of batches) {
        const usersRef = collection(db, USER_COLLECTION);
        const q = query(usersRef, where("email", "in", batch));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
            const email = doc.data().email;
            if (email) {
                result.set(email, doc.id);
            }
        });
    }
    
    return result;
}

/**
 * Update a club member's userId field
 */
export async function linkMemberToUser(
    clubId: string,
    memberId: string,
    userId: string
): Promise<void> {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    await updateDoc(memberRef, {
        userId,
        updatedAt: serverTimestamp(),
    });
}

export { generatePassword };


