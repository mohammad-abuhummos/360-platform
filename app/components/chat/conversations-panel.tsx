import { useState, useMemo } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Input, InputGroup } from "../input";
import { Subheading } from "../heading";
import { Text } from "../text";
import { PlusIcon, SearchIcon, UsersIcon } from "./icons";
import type { Conversation } from "~/lib/firestore-chat";
import { formatMessageTime } from "~/lib/firestore-chat";

type FilterType = "all" | "unread" | "pinned";

type ConversationsPanelProps = {
    conversations: Conversation[];
    activeConversationId: string | null;
    currentUserId: string;
    onSelectConversation: (id: string) => void;
    onCreateGroup?: () => void;
    loading?: boolean;
};

export function ConversationsPanel({
    conversations,
    activeConversationId,
    currentUserId,
    onSelectConversation,
    onCreateGroup,
    loading = false,
}: ConversationsPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (conv) =>
                    conv.name.toLowerCase().includes(query) ||
                    conv.lastMessage?.content.toLowerCase().includes(query)
            );
        }

        // Apply filter
        if (filter === "unread") {
            filtered = filtered.filter((conv) => (conv.unreadCount[currentUserId] ?? 0) > 0);
        } else if (filter === "pinned") {
            filtered = filtered.filter((conv) => conv.isPinned[currentUserId]);
        }

        return filtered;
    }, [conversations, searchQuery, filter, currentUserId]);

    return (
        <section className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/30 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:from-zinc-900 dark:to-black h-screen">
            {/* Header */}
            <div className="space-y-3 border-b border-zinc-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="flex items-center justify-between">
                    <Subheading level={2} className="text-base font-bold dark:text-white">
                        Messages
                    </Subheading>
                    {onCreateGroup && (
                        <Button
                            color="blue"
                            onClick={onCreateGroup}
                            className="text-xs shadow-lg shadow-blue-500/30"
                        >
                            <PlusIcon data-slot="icon" className="size-4" />
                            New Group
                        </Button>
                    )}
                </div>

                <InputGroup className="shadow-sm">
                    <SearchIcon data-slot="icon" />
                    <Input
                        type="search"
                        placeholder="Search messages..."
                        aria-label="Search conversations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                    />
                </InputGroup>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === "all"
                            ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === "unread"
                            ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter("pinned")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === "pinned"
                            ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        Pinned
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <ul className="flex-1 divide-y divide-zinc-100/80 overflow-y-auto dark:divide-zinc-800">
                {loading ? (
                    <li className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-3">
                            <div className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                            <div className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                            <div className="size-2 animate-bounce rounded-full bg-blue-500" />
                        </div>
                    </li>
                ) : filteredConversations.length === 0 ? (
                    <li className="flex flex-col items-center justify-center gap-3 py-20">
                        <UsersIcon className="size-12 text-zinc-300 dark:text-zinc-600" />
                        <Text className="text-zinc-500 dark:text-zinc-400">
                            {searchQuery ? "No conversations found" : "No conversations yet"}
                        </Text>
                        {!searchQuery && onCreateGroup && (
                            <Button color="blue" onClick={onCreateGroup} className="mt-2">
                                <PlusIcon data-slot="icon" className="size-4" />
                                Create your first group
                            </Button>
                        )}
                    </li>
                ) : (
                    filteredConversations.map((conversation) => {
                        const isActive = conversation.id === activeConversationId;
                        const unreadCount = conversation.unreadCount[currentUserId] ?? 0;
                        const isPinned = conversation.isPinned[currentUserId];
                        const preview = conversation.lastMessage?.content ?? conversation.description ?? "No messages yet";
                        const timestamp = conversation.lastMessage?.timestamp
                            ? formatMessageTime(conversation.lastMessage.timestamp)
                            : "";

                        return (
                            <li
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`group relative flex cursor-pointer gap-3 p-4 transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 shadow-sm dark:from-blue-950/40 dark:to-indigo-950/30"
                                    : "bg-white/50 hover:bg-zinc-50 hover:shadow-sm dark:bg-zinc-900/30 dark:hover:bg-zinc-800/50"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
                                )}

                                {isPinned && (
                                    <div className="absolute right-2 top-2">
                                        <svg className="size-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm4 4a3 3 0 11-6 0 3 3 0 016 0zm5.657-1.596a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zm-1.06 9.193a.75.75 0 101.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.061zM10 16a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 16zm-6.596-5.657a.75.75 0 00-1.06-1.06l-1.061 1.06a.75.75 0 101.06 1.061l1.061-1.06zM2.343 5.657a.75.75 0 011.06-1.06l1.061 1.06a.75.75 0 11-1.06 1.061l-1.061-1.06z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="relative">
                                    <Avatar
                                        initials={conversation.initials}
                                        alt={conversation.name}
                                        src={conversation.avatarUrl}
                                        className={`size-12 ring-2 ${isActive
                                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-blue-200 dark:ring-blue-900"
                                            : "bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-700 ring-zinc-200/50 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
                                            }`}
                                    />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <Subheading
                                            level={3}
                                            className={`text-sm font-bold ${isActive
                                                ? "text-zinc-900 dark:text-white"
                                                : "text-zinc-800 dark:text-zinc-200"
                                                }`}
                                        >
                                            {conversation.name}
                                        </Subheading>
                                        <span className="whitespace-nowrap text-xs font-medium text-zinc-500 dark:text-zinc-500">
                                            {timestamp.split("·")[1]?.trim() || timestamp}
                                        </span>
                                    </div>

                                    <Text
                                        className={`line-clamp-2 text-sm ${unreadCount > 0
                                            ? "font-medium text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-600 dark:text-zinc-400"
                                            }`}
                                    >
                                        {conversation.lastMessage?.senderName
                                            ? `${conversation.lastMessage.senderName}: ${preview}`
                                            : preview}
                                    </Text>

                                    <div className="flex items-center justify-between">
                                        <Text className="text-xs text-zinc-400 dark:text-zinc-600">
                                            {conversation.participantIds.length} members
                                        </Text>
                                        <Badge color={isActive ? "blue" : "zinc"} className="text-xs">
                                            {conversation.tag}
                                        </Badge>
                                    </div>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </section>
    );
}
