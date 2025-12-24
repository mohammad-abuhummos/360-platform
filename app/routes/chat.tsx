import type { Route } from "./+types/chat";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { ChatPageHeader, ChatPanel, ConversationsPanel, DetailsPanel } from "../components/chat";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToConversations,
    subscribeToMessages,
    sendMessage,
    createConversation,
    markConversationAsRead,
    toggleMuteConversation,
    removeParticipant,
    addParticipants,
    uploadChatFiles,
    getInitials,
    type Conversation,
    type ChatMessage,
    type MessageAttachment,
    type MessageType,
    type CreateConversationPayload,
    CONVERSATION_TAGS,
} from "~/lib/firestore-chat";
import { subscribeToClubMembers, getUserIdsByEmails, type ClubMember } from "~/lib/firestore-team";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "~/components/dialog";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Select } from "~/components/select";
import { Checkbox, CheckboxField, CheckboxGroup } from "~/components/checkbox";
import { Label, Description } from "~/components/fieldset";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Chat · Jordan Knights Dashboard" },
        { name: "description", content: "Real-time club conversations for teams and staff." },
    ];
}

export default function ChatRoute() {
    const { activeClub, profile } = useAuth();
    const clubId = activeClub?.id;
    const userId = profile?.id ?? "";
    const userName = profile?.displayName ?? "User";
    const userRole = activeClub?.membershipRole ?? "Member";
    const userInitials = getInitials(userName);

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create group dialog state
    const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const [newGroupTag, setNewGroupTag] = useState<string>("General");
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Add member dialog state
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [addMemberSelectedIds, setAddMemberSelectedIds] = useState<string[]>([]);
    const [isAddingMembers, setIsAddingMembers] = useState(false);

    // File upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Subscribe to conversations for the active club
    useEffect(() => {
        if (!clubId || !userId) {
            setConversations([]);
            setConversationsLoading(false);
            return;
        }

        setConversationsLoading(true);
        setError(null);

        const unsubscribe = subscribeToConversations(
            clubId,
            userId,
            (data) => {
                setConversations(data);
                setConversationsLoading(false);

                // Auto-select first conversation if none selected
                if (data.length > 0 && !activeConversationId) {
                    setActiveConversationId(data[0].id);
                }
            },
            (err) => {
                setError(err.message);
                setConversationsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [clubId, userId]);

    // Subscribe to messages for the active conversation
    useEffect(() => {
        if (!clubId || !activeConversationId) {
            setMessages([]);
            return;
        }

        setMessagesLoading(true);

        const unsubscribe = subscribeToMessages(
            clubId,
            activeConversationId,
            (data) => {
                setMessages(data);
                setMessagesLoading(false);

                // Mark conversation as read
                if (userId) {
                    void markConversationAsRead(clubId, activeConversationId, userId);
                }
            },
            (err) => {
                console.error("Error loading messages:", err);
                setMessagesLoading(false);
            }
        );

        return () => unsubscribe();
    }, [clubId, activeConversationId, userId]);

    // Subscribe to club members for creating groups
    useEffect(() => {
        if (!clubId) {
            setClubMembers([]);
            return;
        }

        const unsubscribe = subscribeToClubMembers(
            clubId,
            (data) => setClubMembers(data),
            (err) => console.error("Error loading members:", err)
        );

        return () => unsubscribe();
    }, [clubId]);

    // Get active conversation
    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId),
        [conversations, activeConversationId]
    );

    // Get participants for details panel
    const participants = useMemo(() => {
        if (!activeConversation) return [];

        return activeConversation.participantIds.map((id) => {
            const member = clubMembers.find((m) => m.id === id || m.email === activeConversation.participantNames[id]);
            return {
                id,
                name: activeConversation.participantNames[id] ?? member?.name ?? "Unknown",
                initials: member?.initials ?? getInitials(activeConversation.participantNames[id] ?? "U"),
                role: member?.title ?? member?.role ?? "Member",
                status: "Online" as const, // In a real app, track online status
                avatarUrl: undefined,
            };
        });
    }, [activeConversation, clubMembers]);

    // Count active members
    const activeMembersCount = useMemo(
        () => participants.filter((p) => p.status === "Online").length,
        [participants]
    );

    // Handle conversation selection
    const handleSelectConversation = useCallback((id: string) => {
        setActiveConversationId(id);
    }, []);

    // Handle sending a message with file uploads
    const handleSendMessage = useCallback(
        async (
            content: string,
            type: MessageType,
            pendingAttachments?: MessageAttachment[],
            files?: File[],
            replyTo?: { messageId: string; content: string; senderName: string }
        ) => {
            if (!clubId || !activeConversationId || !userId) return;

            console.log("[Chat] Sending message:", { content, type, hasAttachments: !!pendingAttachments?.length, hasFiles: !!files?.length, hasReply: !!replyTo });

            try {
                let uploadedAttachments: MessageAttachment[] | undefined;

                // If there are files to upload, upload them first
                if (files && files.length > 0) {
                    console.log("[Chat] Uploading files:", files.map(f => ({ name: f.name, type: f.type, size: f.size })));
                    setIsUploading(true);
                    setUploadProgress(0);

                    const totalFiles = files.length;
                    const uploadedFiles = await uploadChatFiles(
                        clubId,
                        activeConversationId,
                        files,
                        (fileIndex, progress) => {
                            // Calculate overall progress
                            const overallProgress = ((fileIndex + progress / 100) / totalFiles) * 100;
                            setUploadProgress(overallProgress);
                        }
                    );

                    console.log("[Chat] Files uploaded:", uploadedFiles);
                    uploadedAttachments = uploadedFiles;
                    setIsUploading(false);
                    setUploadProgress(0);
                } else if (pendingAttachments && pendingAttachments.length > 0) {
                    // If there are attachments but no files (shouldn't happen normally)
                    console.warn("[Chat] Attachments without files - using local URLs (may not work):", pendingAttachments);
                    uploadedAttachments = pendingAttachments;
                }

                console.log("[Chat] Sending to Firestore with attachments:", uploadedAttachments);

                await sendMessage(clubId, activeConversationId, {
                    senderId: userId,
                    senderName: userName,
                    senderInitials: userInitials,
                    senderRole: userRole,
                    type,
                    content,
                    attachments: uploadedAttachments,
                    replyTo: replyTo,
                });

                console.log("[Chat] Message sent successfully");
            } catch (err) {
                console.error("[Chat] Error sending message:", err);
                setIsUploading(false);
                setUploadProgress(0);
            }
        },
        [clubId, activeConversationId, userId, userName, userInitials, userRole]
    );

    // Handle creating a new group
    const handleCreateGroup = useCallback(async () => {
        if (!clubId || !userId || !newGroupName.trim()) return;

        setIsCreatingGroup(true);

        try {
            // Get the selected members
            const selectedMembers = selectedMemberIds
                .map((memberId) => clubMembers.find((m) => m.id === memberId))
                .filter((m): m is ClubMember => m !== undefined);

            // Get emails of selected members
            const emails = selectedMembers.map((m) => m.email);

            // Look up user IDs by email
            const emailToUserId = await getUserIdsByEmails(emails);

            // Build participant IDs and names with actual user IDs
            const participantIds: string[] = [userId];
            const participantNames: Record<string, string> = {
                [userId]: userName,
            };
            const membersWithoutAccounts: string[] = [];

            selectedMembers.forEach((member) => {
                // First check if member already has userId field
                const memberUserId = member.userId || emailToUserId.get(member.email);
                
                if (memberUserId) {
                    participantIds.push(memberUserId);
                    participantNames[memberUserId] = member.name;
                } else {
                    membersWithoutAccounts.push(member.name);
                }
            });

            if (membersWithoutAccounts.length > 0) {
                console.warn(
                    "[Chat] Some members don't have user accounts:",
                    membersWithoutAccounts
                );
            }

            const payload: CreateConversationPayload = {
                type: "group",
                name: newGroupName.trim(),
                description: newGroupDescription.trim() || undefined,
                participantIds,
                participantNames,
                tag: newGroupTag,
            };

            const conversationId = await createConversation(clubId, userId, payload);

            // Select the new conversation
            setActiveConversationId(conversationId);

            // Reset form
            setNewGroupName("");
            setNewGroupDescription("");
            setNewGroupTag("General");
            setSelectedMemberIds([]);
            setShowCreateGroupDialog(false);

            if (membersWithoutAccounts.length > 0) {
                alert(
                    `Group created! Note: ${membersWithoutAccounts.join(", ")} could not be added (no user accounts).`
                );
            }
        } catch (err) {
            console.error("Error creating group:", err);
        } finally {
            setIsCreatingGroup(false);
        }
    }, [clubId, userId, userName, newGroupName, newGroupDescription, newGroupTag, selectedMemberIds, clubMembers]);

    // Handle toggle mute
    const handleToggleMute = useCallback(async () => {
        if (!clubId || !activeConversationId || !userId || !activeConversation) return;

        const isMuted = activeConversation.isMuted[userId] ?? false;

        try {
            await toggleMuteConversation(clubId, activeConversationId, userId, !isMuted);
        } catch (err) {
            console.error("Error toggling mute:", err);
        }
    }, [clubId, activeConversationId, userId, activeConversation]);

    // Handle leave chat
    const handleLeaveChat = useCallback(async () => {
        if (!clubId || !activeConversationId || !userId) return;

        try {
            await removeParticipant(clubId, activeConversationId, userId);
            setActiveConversationId(null);
        } catch (err) {
            console.error("Error leaving chat:", err);
        }
    }, [clubId, activeConversationId, userId]);

    // Toggle member selection for new group
    const toggleMemberSelection = useCallback((memberId: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    }, []);

    // Toggle member selection for add member dialog
    const toggleAddMemberSelection = useCallback((memberId: string) => {
        setAddMemberSelectedIds((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    }, []);

    // Handle adding members to existing conversation
    const handleAddMembers = useCallback(async () => {
        if (!clubId || !activeConversationId || addMemberSelectedIds.length === 0) return;

        setIsAddingMembers(true);

        try {
            // Get the selected members
            const selectedMembers = addMemberSelectedIds
                .map((memberId) => clubMembers.find((m) => m.id === memberId))
                .filter((m): m is ClubMember => m !== undefined);

            // Get emails of selected members
            const emails = selectedMembers.map((m) => m.email);

            // Look up user IDs by email
            const emailToUserId = await getUserIdsByEmails(emails);

            // Build participants list with actual user IDs
            const participantsToAdd: { id: string; name: string }[] = [];
            const membersWithoutAccounts: string[] = [];

            selectedMembers.forEach((member) => {
                // First check if member already has userId field
                const userId = member.userId || emailToUserId.get(member.email);
                
                if (userId) {
                    participantsToAdd.push({
                        id: userId,
                        name: member.name,
                    });
                } else {
                    membersWithoutAccounts.push(member.name);
                }
            });

            if (membersWithoutAccounts.length > 0) {
                console.warn(
                    "[Chat] Some members don't have user accounts and cannot be added to chat:",
                    membersWithoutAccounts
                );
            }

            if (participantsToAdd.length > 0) {
                await addParticipants(clubId, activeConversationId, participantsToAdd);
                console.log("[Chat] Added participants:", participantsToAdd);
            }

            // Reset and close dialog
            setAddMemberSelectedIds([]);
            setShowAddMemberDialog(false);

            if (membersWithoutAccounts.length > 0 && participantsToAdd.length === 0) {
                alert(
                    `Could not add members: ${membersWithoutAccounts.join(", ")}. They need to have user accounts first.`
                );
            } else if (membersWithoutAccounts.length > 0) {
                alert(
                    `Added ${participantsToAdd.length} member(s). Could not add: ${membersWithoutAccounts.join(", ")} (no user accounts).`
                );
            }
        } catch (err) {
            console.error("Error adding members:", err);
        } finally {
            setIsAddingMembers(false);
        }
    }, [clubId, activeConversationId, addMemberSelectedIds, clubMembers]);

    // Get members not already in the conversation
    const availableMembersToAdd = useMemo(() => {
        if (!activeConversation) return clubMembers;
        return clubMembers.filter(
            (member) => !activeConversation.participantIds.includes(member.id)
        );
    }, [clubMembers, activeConversation]);

    // Extract shared files from messages
    const sharedFiles = useMemo(() => {
        const files: Array<{
            id: string;
            name: string;
            size: number;
            url: string;
            type: "image" | "video" | "file";
            uploadedAt: string;
        }> = [];

        messages.forEach((message) => {
            if (message.attachments && message.attachments.length > 0) {
                message.attachments.forEach((attachment) => {
                    if (attachment.url && attachment.url.startsWith("http")) {
                        files.push({
                            id: attachment.id,
                            name: attachment.fileName,
                            size: attachment.fileSize,
                            url: attachment.url,
                            type: attachment.type === "voice" ? "file" : attachment.type,
                            uploadedAt: message.createdAt
                                ? new Date(message.createdAt.toDate()).toLocaleDateString()
                                : "Unknown",
                        });
                    }
                });
            }
        });

        // Return most recent files first
        return files.reverse().slice(0, 10);
    }, [messages]);

    const isMuted = activeConversation?.isMuted[userId] ?? false;

    return (
        <DashboardLayout>
            <div className="space-y-6 dark">
                <ChatPageHeader activeMembersCount={activeMembersCount} />

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_300px]">
                    <ConversationsPanel
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        currentUserId={userId}
                        onSelectConversation={handleSelectConversation}
                        onCreateGroup={() => setShowCreateGroupDialog(true)}
                        loading={conversationsLoading}
                    />
                    <ChatPanel
                        conversation={activeConversation}
                        messages={messages}
                        currentUserId={userId}
                        onSendMessage={handleSendMessage}
                        loading={messagesLoading}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                    />
                    <DetailsPanel
                        conversation={activeConversation}
                        participants={participants}
                        sharedFiles={sharedFiles}
                        groupLabel={activeClub?.name ?? "Jordan Knights FC"}
                        onAddMember={() => setShowAddMemberDialog(true)}
                        onLeaveChat={handleLeaveChat}
                        onToggleMute={handleToggleMute}
                        isMuted={isMuted}
                    />
                </div>
            </div>

            {/* Create Group Dialog */}
            <Dialog open={showCreateGroupDialog} onClose={() => setShowCreateGroupDialog(false)}>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                    Create a group chat with members from {activeClub?.name ?? "your club"}.
                </DialogDescription>
                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Group Name
                            </label>
                            <Input
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Enter group name..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Description (optional)
                            </label>
                            <Input
                                value={newGroupDescription}
                                onChange={(e) => setNewGroupDescription(e.target.value)}
                                placeholder="What's this group about?"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Category
                            </label>
                            <Select value={newGroupTag} onChange={(e) => setNewGroupTag(e.target.value)}>
                                {CONVERSATION_TAGS.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Add Members
                            </label>
                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                                {clubMembers.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-zinc-500">
                                        No members available
                                    </p>
                                ) : (
                                    clubMembers.map((member) => (
                                        <label
                                            key={member.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMemberIds.includes(member.id)}
                                                onChange={() => toggleMemberSelection(member.id)}
                                                className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                                {member.initials}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">{member.title ?? member.role}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {selectedMemberIds.length > 0 && (
                                <p className="mt-2 text-xs text-zinc-500">
                                    {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? "s" : ""} selected
                                </p>
                            )}
                        </div>
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setShowCreateGroupDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        color="blue"
                        onClick={handleCreateGroup}
                        disabled={!newGroupName.trim() || isCreatingGroup}
                    >
                        {isCreatingGroup ? "Creating..." : "Create Group"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={showAddMemberDialog} onClose={() => setShowAddMemberDialog(false)}>
                <DialogTitle>Add Members</DialogTitle>
                <DialogDescription>
                    Add members from {activeClub?.name ?? "your club"} to this conversation.
                </DialogDescription>
                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Available Members
                            </label>
                            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                                {availableMembersToAdd.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-zinc-500">
                                        All club members are already in this conversation
                                    </p>
                                ) : (
                                    availableMembersToAdd.map((member) => (
                                        <label
                                            key={member.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={addMemberSelectedIds.includes(member.id)}
                                                onChange={() => toggleAddMemberSelection(member.id)}
                                                className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                                {member.initials}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">{member.title ?? member.role}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {addMemberSelectedIds.length > 0 && (
                                <p className="mt-2 text-xs text-zinc-500">
                                    {addMemberSelectedIds.length} member{addMemberSelectedIds.length !== 1 ? "s" : ""} selected
                                </p>
                            )}
                        </div>
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => {
                        setShowAddMemberDialog(false);
                        setAddMemberSelectedIds([]);
                    }}>
                        Cancel
                    </Button>
                    <Button
                        color="blue"
                        onClick={handleAddMembers}
                        disabled={addMemberSelectedIds.length === 0 || isAddingMembers}
                    >
                        {isAddingMembers ? "Adding..." : `Add ${addMemberSelectedIds.length || ""} Member${addMemberSelectedIds.length !== 1 ? "s" : ""}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}
