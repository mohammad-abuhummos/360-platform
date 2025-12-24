import {
    addDoc,
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
    arrayUnion,
    arrayRemove,
    increment,
    writeBatch,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db, storage, ref, uploadBytesResumable, getDownloadURL } from "~/lib/firebase";

// ==================== Types ====================

export type MessageType = "text" | "image" | "video" | "file" | "voice";
export type ConversationType = "direct" | "group";

export type MessageAttachment = {
    id: string;
    type: "image" | "video" | "file" | "voice";
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    duration?: number; // For voice/video in seconds
    thumbnailUrl?: string; // For images/videos
    width?: number;
    height?: number;
};

export type ChatMessage = {
    id: string;
    conversationId: string;
    clubId: string;
    senderId: string;
    senderName: string;
    senderInitials: string;
    senderRole: string;
    type: MessageType;
    content: string;
    attachments: MessageAttachment[];
    replyTo?: {
        messageId: string;
        content: string;
        senderName: string;
    };
    readBy: string[];
    editedAt?: Timestamp;
    deletedAt?: Timestamp;
    createdAt?: Timestamp;
};

export type LastMessage = {
    content: string;
    senderId: string;
    senderName: string;
    type: MessageType;
    timestamp: Timestamp;
};

export type Conversation = {
    id: string;
    clubId: string;
    type: ConversationType;
    name: string;
    description?: string;
    avatarUrl?: string;
    initials: string;
    participantIds: string[];
    participantNames: Record<string, string>;
    adminIds: string[];
    createdBy: string;
    lastMessage?: LastMessage;
    unreadCount: Record<string, number>;
    tag: string; // "Teams", "Staff", "Media", etc.
    isPinned: Record<string, boolean>;
    isMuted: Record<string, boolean>;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type ConversationParticipant = {
    id: string;
    name: string;
    initials: string;
    role: string;
    status: "Online" | "Offline";
    avatarUrl?: string;
};

// ==================== Payloads ====================

export type CreateConversationPayload = {
    type: ConversationType;
    name: string;
    description?: string;
    avatarUrl?: string;
    participantIds: string[];
    participantNames: Record<string, string>;
    tag: string;
};

export type SendMessagePayload = {
    senderId: string;
    senderName: string;
    senderInitials: string;
    senderRole: string;
    type: MessageType;
    content: string;
    attachments?: MessageAttachment[];
    replyTo?: {
        messageId: string;
        content: string;
        senderName: string;
    };
};

// ==================== Constants ====================

const CLUBS_COLLECTION = "clubs";
const CONVERSATIONS_SUBCOLLECTION = "conversations";
const MESSAGES_SUBCOLLECTION = "messages";

const CONVERSATION_TAGS = [
    "Teams",
    "Staff",
    "Media",
    "Parents",
    "Scheduling",
    "General",
] as const;

export type ConversationTag = typeof CONVERSATION_TAGS[number];

// Default conversations for seeding
const DEFAULT_CONVERSATIONS: Omit<Conversation, "id" | "clubId" | "createdAt" | "updatedAt">[] = [
    {
        type: "group",
        name: "Coaches",
        initials: "CH",
        description: "Staff coordination and planning",
        participantIds: [],
        participantNames: {},
        adminIds: [],
        createdBy: "",
        tag: "Staff",
        unreadCount: {},
        isPinned: {},
        isMuted: {},
    },
    {
        type: "group",
        name: "U15 Team",
        initials: "U15",
        description: "Under-15 team communication",
        participantIds: [],
        participantNames: {},
        adminIds: [],
        createdBy: "",
        tag: "Teams",
        unreadCount: {},
        isPinned: {},
        isMuted: {},
    },
    {
        type: "group",
        name: "U13 Team",
        initials: "U13",
        description: "Under-13 team communication",
        participantIds: [],
        participantNames: {},
        adminIds: [],
        createdBy: "",
        tag: "Teams",
        unreadCount: {},
        isPinned: {},
        isMuted: {},
    },
    {
        type: "group",
        name: "Media Team",
        initials: "MT",
        description: "Media and content coordination",
        participantIds: [],
        participantNames: {},
        adminIds: [],
        createdBy: "",
        tag: "Media",
        unreadCount: {},
        isPinned: {},
        isMuted: {},
    },
];

// Default messages for seeding
const DEFAULT_MESSAGES: Omit<ChatMessage, "id" | "conversationId" | "clubId" | "createdAt">[] = [
    {
        senderId: "system",
        senderName: "Coach Ahmad",
        senderInitials: "CA",
        senderRole: "Head Coach",
        type: "text",
        content: "مرحباً بالجميع! هذه مجموعة للتواصل حول التدريبات والمباريات.",
        attachments: [],
        readBy: [],
    },
    {
        senderId: "system",
        senderName: "Bashar",
        senderInitials: "BA",
        senderRole: "Administrator",
        type: "text",
        content: "Welcome everyone! Let's use this group to coordinate our activities.",
        attachments: [],
        readBy: [],
    },
];

// ==================== Collection References ====================

function conversationsCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION);
}

function messagesCollection(clubId: string, conversationId: string) {
    return collection(
        db,
        CLUBS_COLLECTION,
        clubId,
        CONVERSATIONS_SUBCOLLECTION,
        conversationId,
        MESSAGES_SUBCOLLECTION
    );
}

// ==================== Formatters ====================

function formatConversation(docSnap: QueryDocumentSnapshot<DocumentData>): Conversation {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        clubId: data.clubId ?? "",
        type: data.type ?? "group",
        name: data.name ?? "",
        description: data.description,
        avatarUrl: data.avatarUrl,
        initials: data.initials ?? "",
        participantIds: data.participantIds ?? [],
        participantNames: data.participantNames ?? {},
        adminIds: data.adminIds ?? [],
        createdBy: data.createdBy ?? "",
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount ?? {},
        tag: data.tag ?? "General",
        isPinned: data.isPinned ?? {},
        isMuted: data.isMuted ?? {},
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

function formatMessage(docSnap: QueryDocumentSnapshot<DocumentData>): ChatMessage {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        conversationId: data.conversationId ?? "",
        clubId: data.clubId ?? "",
        senderId: data.senderId ?? "",
        senderName: data.senderName ?? "",
        senderInitials: data.senderInitials ?? "",
        senderRole: data.senderRole ?? "",
        type: data.type ?? "text",
        content: data.content ?? "",
        attachments: data.attachments ?? [],
        replyTo: data.replyTo,
        readBy: data.readBy ?? [],
        editedAt: data.editedAt,
        deletedAt: data.deletedAt,
        createdAt: data.createdAt,
    };
}

// ==================== Seeding ====================

const seededClubs = new Set<string>();

async function ensureSeedConversations(clubId: string, userId: string) {
    if (seededClubs.has(clubId)) {
        return;
    }

    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const clubSnap = await getDoc(clubRef);
    if (clubSnap.exists() && clubSnap.data()?.conversationsSeeded) {
        seededClubs.add(clubId);
        return;
    }

    // Check if conversations exist
    const convsRef = conversationsCollection(clubId);
    const snapshot = await getDocs(query(convsRef, limit(1)));

    if (snapshot.empty) {
        // Seed default conversations
        for (const conv of DEFAULT_CONVERSATIONS) {
            const convRef = await addDoc(convsRef, {
                ...conv,
                clubId,
                participantIds: [userId],
                participantNames: { [userId]: "Admin" },
                adminIds: [userId],
                createdBy: userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Add default messages to first conversation
            if (conv.name === "Coaches") {
                const msgsRef = messagesCollection(clubId, convRef.id);
                for (const msg of DEFAULT_MESSAGES) {
                    await addDoc(msgsRef, {
                        ...msg,
                        conversationId: convRef.id,
                        clubId,
                        createdAt: serverTimestamp(),
                    });
                }

                // Update last message
                await updateDoc(convRef, {
                    lastMessage: {
                        content: DEFAULT_MESSAGES[DEFAULT_MESSAGES.length - 1].content,
                        senderId: "system",
                        senderName: DEFAULT_MESSAGES[DEFAULT_MESSAGES.length - 1].senderName,
                        type: "text",
                        timestamp: serverTimestamp(),
                    },
                });
            }
        }
    }

    await setDoc(
        clubRef,
        {
            conversationsSeeded: true,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    seededClubs.add(clubId);
}

// ==================== Conversation CRUD ====================

export function subscribeToConversations(
    clubId: string,
    userId: string,
    onData: (conversations: Conversation[]) => void,
    onError?: (error: Error | FirestoreError) => void
): Unsubscribe {
    void ensureSeedConversations(clubId, userId).catch((error) => {
        if (onError && error instanceof Error) {
            onError(error);
        }
    });

    const convsRef = conversationsCollection(clubId);
    // Get conversations where user is a participant
    const convsQuery = query(
        convsRef,
        where("participantIds", "array-contains", userId),
        orderBy("updatedAt", "desc")
    );

    return onSnapshot(
        convsQuery,
        (snapshot) => {
            const conversations = snapshot.docs.map(formatConversation);
            onData(conversations);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function createConversation(
    clubId: string,
    userId: string,
    payload: CreateConversationPayload
): Promise<string> {
    const convsRef = conversationsCollection(clubId);

    // Ensure creator is in participants
    const participantIds = payload.participantIds.includes(userId)
        ? payload.participantIds
        : [userId, ...payload.participantIds];

    const initials = payload.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const docRef = await addDoc(convsRef, {
        ...payload,
        clubId,
        participantIds,
        adminIds: [userId],
        createdBy: userId,
        initials,
        unreadCount: {},
        isPinned: {},
        isMuted: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function updateConversation(
    clubId: string,
    conversationId: string,
    updates: Partial<Pick<Conversation, "name" | "description" | "avatarUrl" | "tag">>
): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(convRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteConversation(clubId: string, conversationId: string): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);
    await deleteDoc(convRef);
}

export async function removeParticipant(
    clubId: string,
    conversationId: string,
    userId: string
): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(convRef, {
        participantIds: arrayRemove(userId),
        [`participantNames.${userId}`]: null,
        updatedAt: serverTimestamp(),
    });
}

export async function togglePinConversation(
    clubId: string,
    conversationId: string,
    userId: string,
    isPinned: boolean
): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(convRef, {
        [`isPinned.${userId}`]: isPinned,
    });
}

export async function toggleMuteConversation(
    clubId: string,
    conversationId: string,
    userId: string,
    isMuted: boolean
): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(convRef, {
        [`isMuted.${userId}`]: isMuted,
    });
}

// ==================== Message CRUD ====================

export function subscribeToMessages(
    clubId: string,
    conversationId: string,
    onData: (messages: ChatMessage[]) => void,
    onError?: (error: Error | FirestoreError) => void,
    messageLimit: number = 100
): Unsubscribe {
    const msgsRef = messagesCollection(clubId, conversationId);
    const msgsQuery = query(msgsRef, orderBy("createdAt", "asc"), limit(messageLimit));

    return onSnapshot(
        msgsQuery,
        (snapshot) => {
            const messages = snapshot.docs.map(formatMessage);
            onData(messages);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function sendMessage(
    clubId: string,
    conversationId: string,
    payload: SendMessagePayload
): Promise<string> {
    const msgsRef = messagesCollection(clubId, conversationId);
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    // Build message data
    const messageData = {
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderInitials: payload.senderInitials,
        senderRole: payload.senderRole,
        type: payload.type,
        content: payload.content,
        conversationId,
        clubId,
        attachments: payload.attachments ?? [],
        replyTo: payload.replyTo ?? null,
        readBy: [payload.senderId],
        createdAt: serverTimestamp(),
    };

    console.log("[Firestore] Saving message with data:", JSON.stringify(messageData, null, 2));
    console.log("[Firestore] Attachments count:", messageData.attachments.length);

    // Create message
    const msgRef = await addDoc(msgsRef, messageData);
    console.log("[Firestore] Message saved with ID:", msgRef.id);

    // Update conversation's last message
    const lastMessageContent =
        payload.type === "text"
            ? payload.content
            : payload.type === "image"
                ? "📷 Image"
                : payload.type === "video"
                    ? "🎥 Video"
                    : payload.type === "voice"
                        ? "🎤 Voice message"
                        : "📎 File";

    await updateDoc(convRef, {
        lastMessage: {
            content: lastMessageContent.slice(0, 100),
            senderId: payload.senderId,
            senderName: payload.senderName,
            type: payload.type,
            timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
    });

    return msgRef.id;
}

export async function editMessage(
    clubId: string,
    conversationId: string,
    messageId: string,
    newContent: string
): Promise<void> {
    const msgRef = doc(
        db,
        CLUBS_COLLECTION,
        clubId,
        CONVERSATIONS_SUBCOLLECTION,
        conversationId,
        MESSAGES_SUBCOLLECTION,
        messageId
    );

    await updateDoc(msgRef, {
        content: newContent,
        editedAt: serverTimestamp(),
    });
}

export async function deleteMessage(
    clubId: string,
    conversationId: string,
    messageId: string,
    softDelete: boolean = true
): Promise<void> {
    const msgRef = doc(
        db,
        CLUBS_COLLECTION,
        clubId,
        CONVERSATIONS_SUBCOLLECTION,
        conversationId,
        MESSAGES_SUBCOLLECTION,
        messageId
    );

    if (softDelete) {
        await updateDoc(msgRef, {
            deletedAt: serverTimestamp(),
            content: "This message was deleted",
            attachments: [],
        });
    } else {
        await deleteDoc(msgRef);
    }
}

export async function markMessageAsRead(
    clubId: string,
    conversationId: string,
    messageId: string,
    userId: string
): Promise<void> {
    const msgRef = doc(
        db,
        CLUBS_COLLECTION,
        clubId,
        CONVERSATIONS_SUBCOLLECTION,
        conversationId,
        MESSAGES_SUBCOLLECTION,
        messageId
    );

    await updateDoc(msgRef, {
        readBy: arrayUnion(userId),
    });
}

export async function markConversationAsRead(
    clubId: string,
    conversationId: string,
    userId: string
): Promise<void> {
    const convRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(convRef, {
        [`unreadCount.${userId}`]: 0,
    });
}

// ==================== Helpers ====================

export function generateAttachmentId(): string {
    return `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);
}

export function formatMessageTime(timestamp?: Timestamp): string {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (diffDays === 0) {
        return `Today · ${timeStr}`;
    } else if (diffDays === 1) {
        return `Yesterday · ${timeStr}`;
    } else if (diffDays < 7) {
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        return `${dayName} · ${timeStr}`;
    } else {
        const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
        return `${dateStr} · ${timeStr}`;
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getMessagePreview(message: ChatMessage): string {
    if (message.deletedAt) {
        return "Message deleted";
    }

    if (message.type === "text") {
        return message.content.length > 50
            ? `${message.content.slice(0, 50)}...`
            : message.content;
    }

    switch (message.type) {
        case "image":
            return "📷 Sent an image";
        case "video":
            return "🎥 Sent a video";
        case "voice":
            return "🎤 Voice message";
        case "file":
            return `📎 ${message.attachments[0]?.fileName ?? "File"}`;
        default:
            return message.content;
    }
}

// ==================== File Upload ====================

export type UploadProgress = {
    fileName: string;
    progress: number;
    status: "uploading" | "completed" | "error";
    error?: string;
};

export type UploadedFile = {
    id: string;
    type: "image" | "video" | "file" | "voice";
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    duration?: number;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
};

/**
 * Upload a file to Firebase Storage for chat attachments
 */
export async function uploadChatFile(
    clubId: string,
    conversationId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<UploadedFile> {
    const fileId = generateAttachmentId();
    const fileExtension = file.name.split(".").pop() || "";
    const storagePath = `clubs/${clubId}/chat/${conversationId}/${fileId}.${fileExtension}`;

    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

                    // Determine file type
                    let type: "image" | "video" | "file" | "voice" = "file";
                    if (file.type.startsWith("image/")) {
                        type = "image";
                    } else if (file.type.startsWith("video/")) {
                        type = "video";
                    } else if (file.type.startsWith("audio/") || file.name.endsWith(".webm")) {
                        type = "voice";
                    }

                    const uploadedFile: UploadedFile = {
                        id: fileId,
                        type,
                        url: downloadUrl,
                        fileName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                    };

                    resolve(uploadedFile);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Upload multiple files and return their attachment data
 */
export async function uploadChatFiles(
    clubId: string,
    conversationId: string,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<MessageAttachment[]> {
    console.log("[Upload] Starting upload of", files.length, "files");
    const attachments: MessageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[Upload] Uploading file ${i + 1}/${files.length}:`, file.name, file.type, file.size);

        const uploadedFile = await uploadChatFile(
            clubId,
            conversationId,
            file,
            (progress) => onProgress?.(i, progress)
        );

        console.log(`[Upload] File ${i + 1} uploaded successfully:`, uploadedFile.url);

        const attachment: MessageAttachment = {
            id: uploadedFile.id,
            type: uploadedFile.type,
            url: uploadedFile.url,
            fileName: uploadedFile.fileName,
            fileSize: uploadedFile.fileSize,
            mimeType: uploadedFile.mimeType,
        };

        // Only add optional fields if they have values
        if (uploadedFile.duration !== undefined) {
            attachment.duration = uploadedFile.duration;
        }
        if (uploadedFile.thumbnailUrl) {
            attachment.thumbnailUrl = uploadedFile.thumbnailUrl;
        }
        if (uploadedFile.width !== undefined) {
            attachment.width = uploadedFile.width;
        }
        if (uploadedFile.height !== undefined) {
            attachment.height = uploadedFile.height;
        }

        attachments.push(attachment);
    }

    console.log("[Upload] All files uploaded, returning attachments:", attachments);
    return attachments;
}

/**
 * Add a participant to an existing conversation
 */
export async function addParticipant(
    clubId: string,
    conversationId: string,
    userId: string,
    userName: string
): Promise<void> {
    const conversationRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    await updateDoc(conversationRef, {
        participantIds: arrayUnion(userId),
        [`participantNames.${userId}`]: userName,
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Add multiple participants to an existing conversation
 */
export async function addParticipants(
    clubId: string,
    conversationId: string,
    participants: { id: string; name: string }[]
): Promise<void> {
    const conversationRef = doc(db, CLUBS_COLLECTION, clubId, CONVERSATIONS_SUBCOLLECTION, conversationId);

    const participantIds = participants.map((p) => p.id);
    const participantNamesUpdates: Record<string, string> = {};
    const unreadCountUpdates: Record<string, number> = {};

    participants.forEach((p) => {
        participantNamesUpdates[`participantNames.${p.id}`] = p.name;
        unreadCountUpdates[`unreadCount.${p.id}`] = 0;
    });

    await updateDoc(conversationRef, {
        participantIds: arrayUnion(...participantIds),
        ...participantNamesUpdates,
        ...unreadCountUpdates,
        updatedAt: serverTimestamp(),
    });
}

export { CONVERSATION_TAGS };


