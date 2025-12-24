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
    Timestamp,
    updateDoc,
    where,
    type DocumentData,
    type QueryDocumentSnapshot,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "~/lib/firebase";

// ==================== Types ====================

export type EventType = "game" | "practice" | "meeting" | "camp" | "cup" | "other";

export type EventStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type AttendanceStatus = "accepted" | "declined" | "pending" | "waiting";

export type EventParticipant = {
    id: string;
    name: string;
    initials: string;
    role: "organizer" | "participant";
    attendanceStatus: AttendanceStatus;
    attendedAt?: Timestamp;
};

export type GameDetails = {
    homeTeam?: {
        id?: string;
        name: string;
        logoUrl?: string;
    };
    awayTeam?: {
        id?: string;
        name: string;
        logoUrl?: string;
    };
    gameStart?: string;
    competition?: string;
    competitionId?: string;
    isFriendlyMatch: boolean;
    gameFormat: string; // e.g., "11v11", "7v7", "5v5"
    periods: number;
    periodLength: number; // minutes
    field?: string;
    fieldType?: "grass" | "artificial" | "indoor" | "unknown";
};

export type EventResource = {
    id: string;
    name: string;
    type: string;
    location?: string;
    tags?: string[];
};

export type EventSession = {
    id: string;
    name: string;
    description?: string;
    drills?: string[];
};

export type EventAttachment = {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
};

export type CalendarEvent = {
    id: string;
    clubId: string;
    type: EventType;
    title: string;
    description?: string;
    location: string;
    locationCoords?: {
        lat: number;
        lng: number;
    };
    startTime: Timestamp;
    endTime: Timestamp;
    meetTimeBefore: number; // minutes
    rsvpBefore?: Timestamp;
    repeat: "none" | "daily" | "weekly" | "biweekly" | "monthly";
    repeatUntil?: Timestamp;

    // Auto-add settings
    autoAddAdmins: boolean;
    autoAddPlayers: boolean;

    // Visibility settings
    hideParticipants: boolean;
    visibility: "everyone" | "organizers_only" | "participants_only";
    showOnWebsite: boolean;

    // Physical strain (0-100)
    physicalStrain: number;

    // Attachments
    attachments: EventAttachment[];

    // Game-specific details (only for type === "game" or "cup")
    gameDetails?: GameDetails;

    // Resources (e.g., field, equipment)
    resources: EventResource[];

    // Training session (for practice events)
    session?: EventSession;

    // Participants
    organizers: EventParticipant[];
    participants: EventParticipant[];

    // Stats
    attendanceStats: {
        accepted: number;
        declined: number;
        pending: number;
        waiting: number;
    };

    // Metadata
    createdBy: string;
    createdByName: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    // Comments
    commentsCount: number;
};

export type EventComment = {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userInitials: string;
    content: string;
    createdAt: Timestamp;
};

export type EventNote = {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userInitials: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// ==================== Helper Functions ====================

function getEventsCollectionPath(clubId: string) {
    return `clubs/${clubId}/events`;
}

function getCommentsCollectionPath(clubId: string, eventId: string) {
    return `clubs/${clubId}/events/${eventId}/comments`;
}

function getNotesCollectionPath(clubId: string, eventId: string) {
    return `clubs/${clubId}/events/${eventId}/notes`;
}

function mapDocToEvent(doc: QueryDocumentSnapshot<DocumentData>): CalendarEvent {
    const data = doc.data();
    return {
        id: doc.id,
        clubId: data.clubId,
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location,
        locationCoords: data.locationCoords,
        startTime: data.startTime,
        endTime: data.endTime,
        meetTimeBefore: data.meetTimeBefore ?? 0,
        rsvpBefore: data.rsvpBefore,
        repeat: data.repeat ?? "none",
        repeatUntil: data.repeatUntil,
        autoAddAdmins: data.autoAddAdmins ?? false,
        autoAddPlayers: data.autoAddPlayers ?? false,
        hideParticipants: data.hideParticipants ?? false,
        visibility: data.visibility ?? "everyone",
        showOnWebsite: data.showOnWebsite ?? true,
        physicalStrain: data.physicalStrain ?? 50,
        attachments: data.attachments ?? [],
        gameDetails: data.gameDetails,
        resources: data.resources ?? [],
        session: data.session,
        organizers: data.organizers ?? [],
        participants: data.participants ?? [],
        attendanceStats: data.attendanceStats ?? { accepted: 0, declined: 0, pending: 0, waiting: 0 },
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        commentsCount: data.commentsCount ?? 0,
    };
}

// ==================== CRUD Operations ====================

/**
 * Create a new event
 */
export async function createEvent(
    clubId: string,
    eventData: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "commentsCount">
): Promise<string> {
    const collectionPath = getEventsCollectionPath(clubId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...eventData,
        clubId,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Get a single event by ID
 */
export async function getEvent(clubId: string, eventId: string): Promise<CalendarEvent | null> {
    const docRef = doc(db, getEventsCollectionPath(clubId), eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return mapDocToEvent(docSnap as QueryDocumentSnapshot<DocumentData>);
}

/**
 * Get all events for a club
 */
export async function getEvents(clubId: string): Promise<CalendarEvent[]> {
    const q = query(
        collection(db, getEventsCollectionPath(clubId)),
        orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToEvent);
}

/**
 * Get events for a specific date range
 */
export async function getEventsByDateRange(
    clubId: string,
    startDate: Date,
    endDate: Date
): Promise<CalendarEvent[]> {
    const q = query(
        collection(db, getEventsCollectionPath(clubId)),
        where("startTime", ">=", startDate),
        where("startTime", "<=", endDate),
        orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToEvent);
}

/**
 * Subscribe to events for a club
 */
export function subscribeToEvents(
    clubId: string,
    callback: (events: CalendarEvent[]) => void
): Unsubscribe {
    const q = query(
        collection(db, getEventsCollectionPath(clubId)),
        orderBy("startTime", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(mapDocToEvent);
        callback(events);
    });
}

/**
 * Update an event
 */
export async function updateEvent(
    clubId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
): Promise<void> {
    const docRef = doc(db, getEventsCollectionPath(clubId), eventId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete an event
 */
export async function deleteEvent(clubId: string, eventId: string): Promise<void> {
    const docRef = doc(db, getEventsCollectionPath(clubId), eventId);
    await deleteDoc(docRef);
}

/**
 * Update attendance status for a participant
 */
export async function updateAttendance(
    clubId: string,
    eventId: string,
    participantId: string,
    status: AttendanceStatus,
    isOrganizer: boolean = false
): Promise<void> {
    const event = await getEvent(clubId, eventId);
    if (!event) throw new Error("Event not found");

    const listKey = isOrganizer ? "organizers" : "participants";
    const list = event[listKey];
    const participantIndex = list.findIndex((p) => p.id === participantId);

    if (participantIndex === -1) {
        throw new Error("Participant not found");
    }

    list[participantIndex].attendanceStatus = status;
    if (status === "accepted") {
        // Use Timestamp.now() instead of serverTimestamp() since it's inside an array
        list[participantIndex].attendedAt = Timestamp.now();
    }

    // Recalculate stats
    const allParticipants = [...event.organizers, ...event.participants];
    const stats = {
        accepted: allParticipants.filter((p) => p.attendanceStatus === "accepted").length,
        declined: allParticipants.filter((p) => p.attendanceStatus === "declined").length,
        pending: allParticipants.filter((p) => p.attendanceStatus === "pending").length,
        waiting: allParticipants.filter((p) => p.attendanceStatus === "waiting").length,
    };

    await updateEvent(clubId, eventId, {
        [listKey]: list,
        attendanceStats: stats,
    });
}

/**
 * Add a participant to an event
 */
export async function addParticipant(
    clubId: string,
    eventId: string,
    participant: EventParticipant
): Promise<void> {
    const event = await getEvent(clubId, eventId);
    if (!event) throw new Error("Event not found");

    const listKey = participant.role === "organizer" ? "organizers" : "participants";
    const list = [...event[listKey], participant];

    // Recalculate stats
    const allParticipants = [...event.organizers, ...event.participants, participant];
    const stats = {
        accepted: allParticipants.filter((p) => p.attendanceStatus === "accepted").length,
        declined: allParticipants.filter((p) => p.attendanceStatus === "declined").length,
        pending: allParticipants.filter((p) => p.attendanceStatus === "pending").length,
        waiting: allParticipants.filter((p) => p.attendanceStatus === "waiting").length,
    };

    await updateEvent(clubId, eventId, {
        [listKey]: list,
        attendanceStats: stats,
    });
}

/**
 * Remove a participant from an event
 */
export async function removeParticipant(
    clubId: string,
    eventId: string,
    participantId: string,
    isOrganizer: boolean = false
): Promise<void> {
    const event = await getEvent(clubId, eventId);
    if (!event) throw new Error("Event not found");

    const listKey = isOrganizer ? "organizers" : "participants";
    const list = event[listKey].filter((p) => p.id !== participantId);

    // Recalculate stats
    const otherList = isOrganizer ? event.participants : event.organizers;
    const allParticipants = [...list, ...otherList];
    const stats = {
        accepted: allParticipants.filter((p) => p.attendanceStatus === "accepted").length,
        declined: allParticipants.filter((p) => p.attendanceStatus === "declined").length,
        pending: allParticipants.filter((p) => p.attendanceStatus === "pending").length,
        waiting: allParticipants.filter((p) => p.attendanceStatus === "waiting").length,
    };

    await updateEvent(clubId, eventId, {
        [listKey]: list,
        attendanceStats: stats,
    });
}

// ==================== Comments ====================

/**
 * Add a comment to an event
 */
export async function addComment(
    clubId: string,
    eventId: string,
    comment: Omit<EventComment, "id" | "createdAt">
): Promise<string> {
    const collectionPath = getCommentsCollectionPath(clubId, eventId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...comment,
        createdAt: serverTimestamp(),
    });

    // Increment comments count
    const event = await getEvent(clubId, eventId);
    if (event) {
        await updateEvent(clubId, eventId, {
            commentsCount: (event.commentsCount || 0) + 1,
        });
    }

    return docRef.id;
}

/**
 * Get comments for an event
 */
export async function getComments(clubId: string, eventId: string): Promise<EventComment[]> {
    const q = query(
        collection(db, getCommentsCollectionPath(clubId, eventId)),
        orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as EventComment[];
}

/**
 * Subscribe to comments for an event
 */
export function subscribeToComments(
    clubId: string,
    eventId: string,
    callback: (comments: EventComment[]) => void
): Unsubscribe {
    const q = query(
        collection(db, getCommentsCollectionPath(clubId, eventId)),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as EventComment[];
        callback(comments);
    });
}

// ==================== Notes ====================

/**
 * Add a note to an event
 */
export async function addNote(
    clubId: string,
    eventId: string,
    note: Omit<EventNote, "id" | "createdAt" | "updatedAt">
): Promise<string> {
    const collectionPath = getNotesCollectionPath(clubId, eventId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Update a note
 */
export async function updateNote(
    clubId: string,
    eventId: string,
    noteId: string,
    updates: Partial<Pick<EventNote, "title" | "content">>
): Promise<void> {
    const docRef = doc(db, getNotesCollectionPath(clubId, eventId), noteId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a note
 */
export async function deleteNote(
    clubId: string,
    eventId: string,
    noteId: string
): Promise<void> {
    const docRef = doc(db, getNotesCollectionPath(clubId, eventId), noteId);
    await deleteDoc(docRef);
}

/**
 * Subscribe to notes for an event
 */
export function subscribeToNotes(
    clubId: string,
    eventId: string,
    callback: (notes: EventNote[]) => void
): Unsubscribe {
    const q = query(
        collection(db, getNotesCollectionPath(clubId, eventId)),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as EventNote[];
        callback(notes);
    });
}

// ==================== Event Type Helpers ====================

export const eventTypeConfig: Record<EventType, { label: string; color: string; dotColor: string }> = {
    game: { label: "Game", color: "green", dotColor: "bg-green-500" },
    practice: { label: "Practice", color: "amber", dotColor: "bg-amber-500" },
    meeting: { label: "Meeting", color: "blue", dotColor: "bg-blue-500" },
    camp: { label: "Camp", color: "purple", dotColor: "bg-purple-500" },
    cup: { label: "Cup", color: "red", dotColor: "bg-red-500" },
    other: { label: "Other", color: "zinc", dotColor: "bg-zinc-500" },
};

export function getEventTypeLabel(type: EventType): string {
    return eventTypeConfig[type]?.label ?? type;
}

export function getEventTypeColor(type: EventType): string {
    return eventTypeConfig[type]?.color ?? "zinc";
}

/**
 * Check if event type requires game details
 */
export function isGameEvent(type: EventType): boolean {
    return type === "game" || type === "cup";
}

