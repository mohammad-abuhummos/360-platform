export { AttachmentPreview } from "./attachment-preview";
export { ChatPanel } from "./chat-panel";
export { ChatPageHeader } from "./page-header";
export { ConversationsPanel } from "./conversations-panel";
export { DetailsPanel } from "./details-panel";
export { MessageComposer } from "./message-composer";

// Re-export types from firestore
export type {
    ChatMessage,
    Conversation,
    MessageAttachment,
    MessageType,
    ConversationType,
    ConversationTag,
    ConversationParticipant,
} from "~/lib/firestore-chat";

// Legacy type exports for backward compatibility
export type { QuickFile, LegacyMessage, LegacyConversation, LegacyMessageAttachment } from "./types";
