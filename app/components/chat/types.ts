import type { Timestamp } from "firebase/firestore";

// Re-export Firestore types for backward compatibility
export type {
    ChatMessage,
    Conversation,
    MessageAttachment,
    ConversationParticipant as Participant,
    MessageType,
    ConversationType,
    ConversationTag,
} from "~/lib/firestore-chat";

// Legacy types for backwards compatibility with existing components
export type LegacyMessage = {
    id: number;
    sender: string;
    initials: string;
    role: string;
    time: string;
    content: string;
    attachments?: LegacyMessageAttachment[];
};

export type LegacyMessageAttachment = {
    id: number;
    type: "video" | "link" | "image" | "file" | "voice";
    src: string;
    duration?: string;
    poster?: string;
    label?: string;
    fileName?: string;
    fileSize?: string;
};

export type LegacyConversation = {
    id: number;
    name: string;
    initials: string;
    preview: string;
    timestamp: string;
    seen: string;
    tag: string;
    unread?: number;
};

export type QuickFile = {
    id: string;
    name: string;
    size: string;
    updatedAt: string;
    url: string;
    type: "image" | "video" | "file";
};
