import { useEffect, useRef } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Heading } from "../heading";
import { Text } from "../text";
import { AttachmentPreview } from "./attachment-preview";
import { BroadcastIcon, VideoIcon, MicIcon, FileIcon, PlayIcon, DownloadIcon } from "./icons";
import { MessageComposer } from "./message-composer";
import type { ChatMessage, Conversation, MessageAttachment, MessageType } from "~/lib/firestore-chat";
import { formatMessageTime, formatFileSize } from "~/lib/firestore-chat";

type ChatPanelProps = {
    conversation?: Conversation;
    messages: ChatMessage[];
    currentUserId: string;
    onSendMessage: (content: string, type: MessageType, attachments?: MessageAttachment[], files?: File[]) => void;
    loading?: boolean;
    isUploading?: boolean;
    uploadProgress?: number;
};

export function ChatPanel({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    loading = false,
    isUploading = false,
    uploadProgress = 0,
}: ChatPanelProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!conversation) {
        return (
            <section className="flex min-h-[640px] flex-col items-center justify-center rounded-2xl border border-zinc-200/60 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
                <Text className="text-zinc-500 dark:text-zinc-400">
                    Select a conversation to start chatting
                </Text>
            </section>
        );
    }

    const participantCount = conversation.participantIds.length;
    const seenText = `${participantCount} participant${participantCount !== 1 ? "s" : ""}`;

    return (
        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 border-b border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 p-5 backdrop-blur-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar
                            initials={conversation.initials}
                            alt={conversation.name}
                            className="size-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-zinc-900">
                            <span className="size-2 rounded-full bg-white" />
                        </span>
                    </div>

                    <div className="space-y-0.5">
                        <Heading level={2} className="text-lg font-bold text-zinc-900 dark:text-white">
                            {conversation.name}
                        </Heading>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-green-600 dark:text-green-500">Active</span>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <Badge color="zinc" className="text-xs">
                                {conversation.tag}
                            </Badge>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span className="text-zinc-500 dark:text-zinc-500">{seenText}</span>
                        </div>
                    </div>
                </div>

                {/* <div className="ml-auto flex flex-wrap gap-2">
                    <Button
                        outline
                        className="text-sm shadow-sm hover:shadow dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <VideoIcon data-slot="icon" />
                        Call
                    </Button>
                    <Button color="blue" className="text-sm shadow-lg shadow-blue-500/30">
                        <BroadcastIcon data-slot="icon" />
                        Broadcast
                    </Button>
                </div> */}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-50/30 to-white p-6 dark:from-black/30 dark:to-zinc-900">
                <div className="max-h-[500px] space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent dark:scrollbar-thumb-zinc-700">
                    {loading ? (
                        <div className="flex h-full items-center justify-center py-20">
                            <div className="flex items-center gap-3">
                                <div className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                                <div className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                                <div className="size-2 animate-bounce rounded-full bg-blue-500" />
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center py-20">
                            <Text className="text-zinc-500 dark:text-zinc-400">
                                No messages yet. Start the conversation!
                            </Text>
                        </div>
                    ) : (
                        messages.map((message, idx) => {
                            const isOwnMessage = message.senderId === currentUserId;
                            const isDeleted = !!message.deletedAt;

                            return (
                                <article
                                    key={message.id}
                                    className={`group flex gap-3 animate-in fade-in slide-in-from-bottom-4 ${isOwnMessage ? "flex-row-reverse" : ""
                                        }`}
                                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "backwards" }}
                                >
                                    <Avatar
                                        initials={message.senderInitials}
                                        alt={message.senderName}
                                        className={`size-10 shadow-md ring-2 ${isOwnMessage
                                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-green-100 dark:ring-green-900/50"
                                            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-blue-100 dark:ring-blue-900/50"
                                            }`}
                                    />
                                    <div className={`min-w-0 flex-1 space-y-2 ${isOwnMessage ? "text-right" : ""}`}>
                                        <div className={`flex flex-wrap items-center gap-2 ${isOwnMessage ? "justify-end" : ""}`}>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                {message.senderName}
                                            </p>
                                            <Badge color={isOwnMessage ? "green" : "blue"} className="text-xs font-semibold">
                                                {message.senderRole}
                                            </Badge>
                                            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                                {formatMessageTime(message.createdAt)}
                                            </span>
                                            {message.editedAt && (
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">(edited)</span>
                                            )}
                                        </div>

                                        <div
                                            className={`rounded-2xl border p-4 shadow-sm transition-all group-hover:shadow-md ${isOwnMessage
                                                ? "border-green-200/60 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                                : "border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-800/50"
                                                } ${isDeleted ? "opacity-60" : ""}`}
                                        >
                                            {/* Text content */}
                                            {message.content && (
                                                <Text
                                                    className={`text-sm leading-relaxed ${isDeleted
                                                        ? "italic text-zinc-400"
                                                        : "text-zinc-700 dark:text-zinc-300"
                                                        }`}
                                                >
                                                    {message.content}
                                                </Text>
                                            )}

                                            {/* Attachments */}
                                            {message.attachments && message.attachments.length > 0 && !isDeleted && (
                                                <div className="mt-4 space-y-3">
                                                    {message.attachments.map((attachment) => (
                                                        <MessageAttachmentView
                                                            key={attachment.id}
                                                            attachment={attachment}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply to */}
                                            {message.replyTo && (
                                                <div className="mt-3 border-l-2 border-zinc-300 pl-3 dark:border-zinc-600">
                                                    <p className="text-xs font-medium text-zinc-500">
                                                        Replying to {message.replyTo.senderName}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 line-clamp-2">
                                                        {message.replyTo.content}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {!isDeleted && (
                                                <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-700">
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                                                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                            />
                                                        </svg>
                                                        Reply
                                                    </button>
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500">
                                                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                                            />
                                                        </svg>
                                                        Save
                                                    </button>
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-green-600 dark:text-zinc-400 dark:hover:text-green-500">
                                                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                            />
                                                        </svg>
                                                        Share
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Composer */}
            <MessageComposer
                onSendMessage={onSendMessage}
                disabled={loading}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
            />
        </section>
    );
}

function MessageAttachmentView({ attachment }: { attachment: MessageAttachment }) {
    // Check if URL is valid (not a blob URL or empty)
    const isValidUrl = attachment.url &&
        (attachment.url.startsWith("http://") ||
            attachment.url.startsWith("https://") ||
            attachment.url.startsWith("blob:"));

    if (attachment.type === "image") {
        if (!isValidUrl) {
            return (
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <svg className="size-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                            {attachment.fileName || "Image"}
                        </p>
                        <p className="text-xs text-zinc-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <img
                        src={attachment.url}
                        alt={attachment.fileName || "Image"}
                        className="max-h-72 max-w-full cursor-pointer object-contain transition hover:opacity-90"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                                <div class="flex items-center gap-3 p-4">
                                    <svg class="size-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-sm text-zinc-500">Image failed to load</span>
                                </div>
                            `;
                        }}
                    />
                </a>
            </div>
        );
    }

    if (attachment.type === "video") {
        if (!isValidUrl) {
            return (
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <VideoIcon className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                            {attachment.fileName || "Video"}
                        </p>
                        <p className="text-xs text-zinc-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-zinc-700">
                <video
                    src={attachment.url}
                    controls
                    className="max-h-72 max-w-full"
                    poster={attachment.thumbnailUrl}
                    preload="metadata"
                    onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                            <div class="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800">
                                <svg class="size-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm text-zinc-500">Video failed to load</span>
                            </div>
                        `;
                    }}
                >
                    Your browser does not support video playback.
                </video>
            </div>
        );
    }

    if (attachment.type === "voice") {
        return (
            <div className="flex items-center gap-3 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                {isValidUrl ? (
                    <audio
                        src={attachment.url}
                        controls
                        className="h-10 w-full max-w-xs"
                        preload="metadata"
                    />
                ) : (
                    <>
                        <button className="flex size-10 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600">
                            <PlayIcon className="size-5" />
                        </button>
                        <div className="flex-1">
                            <div className="h-1 w-full rounded-full bg-zinc-300 dark:bg-zinc-600">
                                <div className="h-full w-0 rounded-full bg-blue-500" />
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                {attachment.duration ? `${Math.floor(attachment.duration / 60)}:${(attachment.duration % 60).toString().padStart(2, "0")}` : "Voice message"}
                            </p>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // File attachment
    return (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
                <FileIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {attachment.fileName}
                </p>
                <p className="text-xs text-zinc-500">{formatFileSize(attachment.fileSize)}</p>
            </div>
            {isValidUrl && (
                <a
                    href={attachment.url}
                    download={attachment.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                >
                    <DownloadIcon className="size-5" />
                </a>
            )}
        </div>
    );
}
