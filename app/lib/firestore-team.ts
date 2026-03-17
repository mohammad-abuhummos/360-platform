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
import { db, storage, ref, uploadBytesResumable, getDownloadURL } from "~/lib/firebase";
import { updateUserStatus } from "~/lib/firestore-users";

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
export type MemberStatus = "active" | "invited" | "inactive";

export type BillingAddress = {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
};

export type PlayerProfile = {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    taxValue?: string;
    taxType?: string;
    taxId?: string;
    gender?: string;
    emergencyContactNumber?: string;
    englishFullName?: string;
    arabicFullName?: string;
    phoneNumber2?: string;
    phoneNumber3?: string;
    imageConsent?: boolean | string;
    hasSiblingsAtClub?: boolean | string;
    codeOfConductAccepted?: boolean | string;
    kitSize?: string;
    faNumber?: string;
    headshotImageUrl?: string;
    additionalImageUrls?: string[];
    billingAddress?: BillingAddress;
};

export type ClubMember = {
    id: string;
    name: string;
    initials: string;
    role: MemberRole;
    roleId?: string | null;
    roleName?: string | null;
    title?: string | null;
    email: string;
    segment: MemberSegment;
    status: MemberStatus;
    clubId: string;
    userId?: string;
    phoneNumber?: string | null;
    dateOfBirth?: string | null;
    profileImageUrl?: string | null;
    playerProfile?: PlayerProfile | null;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

type FirestoreMember = Omit<ClubMember, "id">;

export type InviteMemberPayload = {
    name: string;
    email: string;
    roleId: string;
    roleName?: string;
    segment: MemberSegment;
    title?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    playerProfile?: Partial<PlayerProfile>;
    status?: "active" | "invited" | "inactive";
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

export async function inviteClubMember(clubId: string, payload: InviteMemberPayload): Promise<string> {
    const membersRef = membersCollection(clubId);
    const trimmedName = payload.name.trim();
    const trimmedEmail = payload.email.trim().toLowerCase();

    const memberData: Record<string, unknown> = {
        clubId,
        name: trimmedName,
        initials: getInitials(trimmedName),
        roleId: payload.roleId || null,
        roleName: payload.roleName || null,
        title: payload.title?.trim() || null,
        email: trimmedEmail,
        segment: payload.segment,
        status: payload.status ?? "active",
        phoneNumber: payload.phoneNumber?.trim() || null,
        dateOfBirth: payload.dateOfBirth?.trim() || null,
        profileImageUrl: payload.profileImageUrl || null,
        playerProfile: payload.playerProfile || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(membersRef, memberData);
    return docRef.id;
}

export type UpdateMemberPayload = {
    name?: string;
    roleId?: string | null;
    roleName?: string | null;
    title?: string | null;
    segment?: MemberSegment;
    phoneNumber?: string | null;
    dateOfBirth?: string | null;
    profileImageUrl?: string | null;
    playerProfile?: Partial<PlayerProfile> | null;
    status?: "active" | "invited" | "inactive";
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

    if (payload.roleId !== undefined) {
        updates.roleId = payload.roleId;
    }
    if (payload.roleName !== undefined) {
        updates.roleName = payload.roleName;
    }

    if (payload.title !== undefined) {
        updates.title = payload.title?.trim() || null;
    }

    if (payload.segment !== undefined) {
        updates.segment = payload.segment;
    }

    if (payload.phoneNumber !== undefined) {
        updates.phoneNumber = payload.phoneNumber?.trim() || null;
    }

    if (payload.dateOfBirth !== undefined) {
        updates.dateOfBirth = payload.dateOfBirth?.trim() || null;
    }

    if (payload.profileImageUrl !== undefined) {
        updates.profileImageUrl = payload.profileImageUrl;
    }

    if (payload.playerProfile !== undefined) {
        updates.playerProfile = payload.playerProfile;
    }

    if (payload.status !== undefined) {
        updates.status = payload.status;
        const memberSnap = await getDoc(memberRef);
        const userId = memberSnap.exists() ? (memberSnap.data() as FirestoreMember).userId : undefined;
        if (userId) {
            if (payload.status === "inactive") {
                await updateUserStatus(userId, "inactive");
            } else if (payload.status === "active") {
                await updateUserStatus(userId, "active");
            }
        }
    }

    await updateDoc(memberRef, updates);
}

export async function getClubMemberById(clubId: string, memberId: string): Promise<ClubMember | null> {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    const snap = await getDoc(memberRef);
    if (!snap.exists()) return null;
    return formatMember(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function removeClubMember(clubId: string, memberId: string) {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    await deleteDoc(memberRef);
}

export async function getClubMemberByUserId(clubId: string, userId: string): Promise<ClubMember | null> {
    const membersRef = membersCollection(clubId);
    const q = query(membersRef, where("userId", "==", userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return formatMember(snapshot.docs[0]);
}

export async function uploadMemberProfileImage(
    clubId: string,
    memberId: string,
    file: File
): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const storagePath = `clubs/${clubId}/members/${memberId}/profile.${ext}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            () => {},
            reject,
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

export async function uploadMemberHeadshotImage(
    clubId: string,
    memberId: string,
    file: File
): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const storagePath = `clubs/${clubId}/members/${memberId}/headshot.${ext}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            () => {},
            reject,
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

export async function uploadMemberAdditionalImage(
    clubId: string,
    memberId: string,
    file: File,
    index: number
): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const storagePath = `clubs/${clubId}/members/${memberId}/additional_${index}.${ext}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            () => {},
            reject,
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

export async function activateClubMember(clubId: string, memberId: string, generatedPassword: string) {
    const memberRef = doc(db, CLUBS_COLLECTION, clubId, MEMBERS_SUBCOLLECTION, memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
        throw new Error("Member not found");
    }

    const memberData = memberSnap.data() as FirestoreMember;

    if (memberData.status === "active") {
        throw new Error("Member is already active");
    }

    let secondaryApp;
    let userId: string;

    try {
        const existingApps = getApps();
        const existingSecondary = existingApps.find(app => app.name === "Secondary");
        if (existingSecondary) {
            await deleteApp(existingSecondary);
        }

        secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            memberData.email,
            generatedPassword
        );

        userId = userCredential.user.uid;

        await updateProfile(userCredential.user, {
            displayName: memberData.name,
        });

        await secondaryAuth.signOut();

    } catch (authError: unknown) {
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch {
                // ignore
            }
        }

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
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch {
                // ignore
            }
        }
    }

    const userRole = memberData.role === "Admin" ? "admin" : memberData.role === "Staff" ? "staff" : "player";

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
        email: memberData.email,
        displayName: memberData.name,
        role: userRole,
        roleId: memberData.roleId ?? null,
        clubIds: [clubId],
        activeClubId: clubId,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

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

export async function getUserIdByEmail(email: string): Promise<string | null> {
    const usersRef = collection(db, USER_COLLECTION);
    const q = query(usersRef, where("email", "==", email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
}

export async function getUserIdsByEmails(emails: string[]): Promise<Map<string, string | null>> {
    const result = new Map<string, string | null>();
    emails.forEach(email => result.set(email, null));
    if (emails.length === 0) return result;

    const batches: string[][] = [];
    for (let i = 0; i < emails.length; i += 30) {
        batches.push(emails.slice(i, i + 30));
    }

    for (const batch of batches) {
        const usersRef = collection(db, USER_COLLECTION);
        const q = query(usersRef, where("email", "in", batch));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(docSnap => {
            const email = docSnap.data().email;
            if (email) result.set(email, docSnap.id);
        });
    }
    return result;
}

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
