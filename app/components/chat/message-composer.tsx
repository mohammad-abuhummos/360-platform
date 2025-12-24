import { useCallback, useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Button } from "../button";
import { Textarea } from "../textarea";
import {
    DotsIcon,
    ImageIcon,
    MicIcon,
    PaperclipIcon,
    SendIcon,
    VideoIcon,
    XIcon,
} from "./icons";
import type { MessageAttachment, MessageType } from "~/lib/firestore-chat";
import { generateAttachmentId, formatFileSize } from "~/lib/firestore-chat";

type PendingAttachment = {
    id: string;
    file: File;
    type: "image" | "video" | "file" | "voice";
    preview?: string;
    duration?: number;
};

type MessageComposerProps = {
    onSendMessage: (
        content: string,
        type: MessageType,
        attachments?: MessageAttachment[],
        files?: File[]
    ) => void;
    disabled?: boolean;
    placeholder?: string;
    isUploading?: boolean;
    uploadProgress?: number;
};

export function MessageComposer({
    onSendMessage,
    disabled = false,
    placeholder = "Type your message here... (Press Enter to send)",
    isUploading = false,
    uploadProgress = 0,
}: MessageComposerProps) {
    const [messageContent, setMessageContent] = useState("");
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const pushMessage = useCallback(() => {
        const trimmed = messageContent.trim();
        const hasAttachments = pendingAttachments.length > 0;

        if (!trimmed && !hasAttachments) return;
        if (isUploading) return; // Prevent sending while uploading

        // Determine message type
        let type: MessageType = "text";
        if (pendingAttachments.length > 0) {
            const firstAttachment = pendingAttachments[0];
            if (firstAttachment.type === "voice") {
                type = "voice";
            } else if (firstAttachment.type === "image") {
                type = "image";
            } else if (firstAttachment.type === "video") {
                type = "video";
            } else {
                type = "file";
            }
        }

        // Convert pending attachments to MessageAttachment format (with local preview URLs)
        const attachments: MessageAttachment[] = pendingAttachments.map((pa) => ({
            id: pa.id,
            type: pa.type,
            url: pa.preview ?? "", // Will be replaced with actual URL after upload
            fileName: pa.file.name,
            fileSize: pa.file.size,
            mimeType: pa.file.type,
            duration: pa.duration,
            thumbnailUrl: pa.type === "image" || pa.type === "video" ? pa.preview : undefined,
        }));

        // Pass both attachments metadata and actual File objects
        const files = pendingAttachments.map((pa) => pa.file);

        console.log("[MessageComposer] Sending message with:", {
            content: trimmed,
            type,
            attachmentsCount: attachments.length,
            filesCount: files.length,
            files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        });

        onSendMessage(
            trimmed,
            type,
            attachments.length > 0 ? attachments : undefined,
            files.length > 0 ? files : undefined
        );
        setMessageContent("");
        setPendingAttachments([]);
    }, [messageContent, pendingAttachments, onSendMessage, isUploading]);

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            pushMessage();
        }
    };

    const handleFileSelect = (
        event: ChangeEvent<HTMLInputElement>,
        type: "image" | "video" | "file"
    ) => {
        const files = event.target.files;
        if (!files) return;

        const newAttachments: PendingAttachment[] = [];

        Array.from(files).forEach((file) => {
            const attachment: PendingAttachment = {
                id: generateAttachmentId(),
                file,
                type,
            };

            // Create preview for images
            if (type === "image" && file.type.startsWith("image/")) {
                attachment.preview = URL.createObjectURL(file);
            }

            // Create preview for videos
            if (type === "video" && file.type.startsWith("video/")) {
                attachment.preview = URL.createObjectURL(file);
            }

            newAttachments.push(attachment);
        });

        setPendingAttachments((prev) => [...prev, ...newAttachments]);

        // Reset input
        event.target.value = "";
    };

    const removeAttachment = (id: string) => {
        setPendingAttachments((prev) => {
            const attachment = prev.find((a) => a.id === id);
            if (attachment?.preview) {
                URL.revokeObjectURL(attachment.preview);
            }
            return prev.filter((a) => a.id !== id);
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, {
                    type: "audio/webm",
                });

                setPendingAttachments((prev) => [
                    ...prev,
                    {
                        id: generateAttachmentId(),
                        file: audioFile,
                        type: "voice",
                        duration: recordingDuration,
                    },
                ]);

                stream.getTracks().forEach((track) => track.stop());
                setRecordingDuration(0);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start duration counter
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Failed to start recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="border-t border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
            {/* Pending Attachments Preview */}
            {pendingAttachments.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            {attachment.type === "image" && attachment.preview ? (
                                <img
                                    src={attachment.preview}
                                    alt={attachment.file.name}
                                    className="h-20 w-20 object-cover"
                                />
                            ) : attachment.type === "video" && attachment.preview ? (
                                <div className="relative h-20 w-20">
                                    <video
                                        src={attachment.preview}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <VideoIcon className="size-6 text-white" />
                                    </div>
                                </div>
                            ) : attachment.type === "voice" ? (
                                <div className="flex h-20 w-32 flex-col items-center justify-center gap-1 px-3">
                                    <MicIcon className="size-6 text-red-500" />
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        {formatDuration(attachment.duration ?? 0)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex h-20 w-32 flex-col items-center justify-center gap-1 px-3">
                                    <PaperclipIcon className="size-6 text-zinc-500" />
                                    <span className="max-w-full truncate text-xs text-zinc-600 dark:text-zinc-400">
                                        {attachment.file.name}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {formatFileSize(attachment.file.size)}
                                    </span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                            >
                                <XIcon className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress Indicator */}
            {isUploading && (
                <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
                    <div className="flex items-center gap-3">
                        <svg className="size-5 animate-spin text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="flex-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                            Uploading files... {Math.round(uploadProgress)}%
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 px-4 py-2 dark:bg-red-950/30">
                    <span className="relative flex size-3">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex size-3 rounded-full bg-red-500" />
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        Recording... {formatDuration(recordingDuration)}
                    </span>
                    <Button
                        color="red"
                        onClick={stopRecording}
                        className="ml-auto text-sm"
                    >
                        Stop
                    </Button>
                </div>
            )}

            <div className="relative">
                <Textarea
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={3}
                    disabled={disabled || isRecording}
                    resizable={false}
                    className="w-full resize-none rounded-xl border-zinc-200/60 bg-white pr-28 shadow-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                        className="group rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                        title="Attach files"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isRecording}
                    >
                        <PaperclipIcon className="size-4 transition-transform group-hover:rotate-45" />
                    </button>
                    <Button
                        color="blue"
                        className="shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                        onClick={pushMessage}
                        disabled={disabled || isRecording || (!messageContent.trim() && pendingAttachments.length === 0)}
                    >
                        <SendIcon data-slot="icon" className="size-4" />
                        Send
                    </Button>
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, "file")}
            />
            <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "image")}
            />
            <input
                ref={videoInputRef}
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "video")}
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={disabled || isRecording}
                    className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                >
                    <VideoIcon className="size-3.5 transition-transform group-hover:scale-110" />
                    Video
                </button>
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={disabled || isRecording}
                    className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-purple-950 dark:hover:text-purple-400"
                >
                    <ImageIcon className="size-3.5 transition-transform group-hover:scale-110" />
                    Images
                </button>
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={disabled}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isRecording
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        : "bg-zinc-100/80 text-zinc-700 hover:bg-red-100 hover:text-red-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                        }`}
                >
                    <MicIcon className="size-3.5 transition-transform group-hover:scale-110" />
                    {isRecording ? "Stop" : "Voice"}
                </button>

            </div>
        </div>
    );
}
