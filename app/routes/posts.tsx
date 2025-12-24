import { Menu, MenuButton, MenuItem, MenuItems, Transition, Tab } from "@headlessui/react";
import clsx from "clsx";
import type { Route } from "./+types/posts";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Input, InputGroup } from "../components/input";
import { Textarea } from "../components/textarea";
import { Select } from "../components/select";
import { Avatar } from "../components/avatar";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../components/dialog";
import { Checkbox, CheckboxField } from "../components/checkbox";
import { Label } from "../components/fieldset";
import type { SVGProps } from "react";
import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "~/context/auth-context";
import { PostsApi } from "~/api/generated/posts";
import { GroupsApi } from "~/api/generated/groups";

type IconProps = SVGProps<SVGSVGElement>;
type TabType = "published" | "draft" | "scheduled";
type PostScope = "Group" | "MultiGroup" | "ClubLobby";
type PublishMode = "Draft" | "PublishNow" | "Schedule";
type VisibilityRole = "AdminsAndStaff" | "Players" | "Parents" | "Public";

interface Post {
    id: string;
    title: string | null;
    content: string;
    authorId: string;
    authorName: string;
    scope: PostScope;
    targetGroupIds: string[];
    targetGroupNames: string[];
    visibilityRoles: VisibilityRole[];
    attachments: PostAttachment[];
    commentsEnabled: boolean;
    isSticky: boolean;
    postAsClub: boolean;
    status: "Draft" | "Published" | "Scheduled";
    publishedAt: string | null;
    scheduledPublishAtUtc: string | null;
    createdAt: string;
    viewCount: number;
    commentCount: number;
    reactionsCount: number;
}

interface PostAttachment {
    id: string;
    fileName: string;
    contentType: string;
    url: string;
    sizeBytes: number;
}

interface Group {
    id: string;
    name: string;
    parentId: string | null;
}

interface CreatePostFormData {
    title: string;
    content: string;
    scope: PostScope;
    targetGroupIds: string[];
    visibilityRoles: VisibilityRole[];
    attachments: File[];
    commentsEnabled: boolean;
    notifyRecipients: boolean;
    isSticky: boolean;
    postAsClub: boolean;
    publishMode: PublishMode;
    scheduledPublishAtUtc: string;
}

const defaultFormData: CreatePostFormData = {
    title: "",
    content: "",
    scope: "Group",
    targetGroupIds: [],
    visibilityRoles: ["Players", "Parents"],
    attachments: [],
    commentsEnabled: true,
    notifyRecipients: true,
    isSticky: false,
    postAsClub: false,
    publishMode: "PublishNow",
    scheduledPublishAtUtc: "",
};

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Posts · Dashboard" },
        { name: "description", content: "Manage posts and announcements for your club." },
    ];
}

export default function PostsPage() {
    const { activeClub, profile } = useAuth();
    const clubId = activeClub?.id ?? "";
    const isAdmin = activeClub?.membershipRole === "Administrator" || activeClub?.membershipRole === "Staff";

    const [activeTab, setActiveTab] = useState<TabType>("published");
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialogs
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [previewPost, setPreviewPost] = useState<Post | null>(null);
    const [formData, setFormData] = useState<CreatePostFormData>(defaultFormData);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch posts
    const fetchPosts = useCallback(async () => {
        if (!clubId) return;

        setLoading(true);
        try {
            const response = await PostsApi.getApiClubsClubIdPosts({
                pathParams: { clubId },
                query: {
                    IncludeDrafts: activeTab === "draft",
                    IncludeScheduled: activeTab === "scheduled",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data.items || data || []);
            } else {
                setError("Failed to fetch posts");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    }, [clubId, activeTab]);

    // Fetch groups
    const fetchGroups = useCallback(async () => {
        try {
            const response = await GroupsApi.getApiGroups({});
            if (response.ok) {
                const data = await response.json();
                setGroups(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    }, []);

    useEffect(() => {
        void fetchPosts();
        void fetchGroups();
    }, [fetchPosts, fetchGroups]);

    // Filter posts
    const filteredPosts = posts.filter((post) => {
        const matchesSearch = searchQuery.trim() === "" ||
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = true;
        if (activeTab === "published") {
            matchesTab = post.status === "Published";
        } else if (activeTab === "draft") {
            matchesTab = post.status === "Draft";
        } else if (activeTab === "scheduled") {
            matchesTab = post.status === "Scheduled";
        }

        return matchesSearch && matchesTab;
    });

    // Handle form changes
    const updateForm = (updates: Partial<CreatePostFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.attachments.length > 40) {
            alert("Maximum 40 attachments allowed");
            return;
        }
        updateForm({ attachments: [...formData.attachments, ...files] });
    };

    const removeAttachment = (index: number) => {
        updateForm({
            attachments: formData.attachments.filter((_, i) => i !== index),
        });
    };

    // Create/Update post
    const handleSubmit = async () => {
        if (!clubId || !formData.content.trim()) return;

        setSubmitting(true);
        try {
            // First upload attachments if any
            const attachmentRequests = formData.attachments.map((file) => ({
                fileName: file.name,
                contentType: file.type,
                sizeBytes: file.size,
            }));

            const body = {
                title: formData.title || null,
                content: formData.content,
                scope: formData.scope,
                targetGroupIds: formData.scope === "ClubLobby" ? null : formData.targetGroupIds,
                visibilityRoles: formData.visibilityRoles,
                attachments: attachmentRequests.length > 0 ? attachmentRequests : null,
                commentsEnabled: formData.commentsEnabled,
                notifyRecipients: formData.notifyRecipients,
                isSticky: formData.isSticky,
                postAsClub: formData.postAsClub,
                publishMode: formData.publishMode,
                scheduledPublishAtUtc: formData.publishMode === "Schedule" ? formData.scheduledPublishAtUtc : null,
            };

            let response: Response;
            if (editingPost) {
                response = await PostsApi.putApiClubsClubIdPostsPostId({
                    pathParams: { clubId, postId: editingPost.id },
                    body,
                });
            } else {
                response = await PostsApi.postApiClubsClubIdPosts({
                    pathParams: { clubId },
                    body,
                });
            }

            if (response.ok) {
                setShowCreateDialog(false);
                setEditingPost(null);
                setFormData(defaultFormData);
                void fetchPosts();
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || "Failed to save post");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save post");
        } finally {
            setSubmitting(false);
        }
    };

    // Delete post
    const handleDelete = async (post: Post) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const response = await PostsApi.deleteApiClubsClubIdPostsPostId({
                pathParams: { clubId, postId: post.id },
            });

            if (response.ok) {
                void fetchPosts();
            } else {
                setError("Failed to delete post");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete post");
        }
    };

    // Publish draft
    const handlePublish = async (post: Post) => {
        try {
            const response = await PostsApi.postApiClubsClubIdPostsPostIdPublish({
                pathParams: { clubId, postId: post.id },
            });

            if (response.ok) {
                void fetchPosts();
            } else {
                setError("Failed to publish post");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish post");
        }
    };

    // Open edit dialog
    const openEditDialog = (post: Post) => {
        setEditingPost(post);
        setFormData({
            title: post.title || "",
            content: post.content,
            scope: post.scope,
            targetGroupIds: post.targetGroupIds || [],
            visibilityRoles: post.visibilityRoles || [],
            attachments: [],
            commentsEnabled: post.commentsEnabled,
            notifyRecipients: true,
            isSticky: post.isSticky,
            postAsClub: post.postAsClub,
            publishMode: post.status === "Draft" ? "Draft" : post.status === "Scheduled" ? "Schedule" : "PublishNow",
            scheduledPublishAtUtc: post.scheduledPublishAtUtc || "",
        });
        setShowCreateDialog(true);
    };

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getVisibilityIcon = (roles: VisibilityRole[], type: string) => {
        const hasRole = roles.includes(type as VisibilityRole);
        return hasRole ? (
            <CheckCircleIcon className="size-5 text-emerald-500" />
        ) : (
            <XCircleIcon className="size-5 text-red-400" />
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4">
                    <Button plain className="px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-zinc-200" onClick={() => window.history.back()}>
                        <ChevronLeftIcon data-slot="icon" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                            <MegaphoneIcon className="size-5 text-white" />
                        </div>
                        <Heading level={1} className="text-2xl font-bold text-white">
                            Posts
                        </Heading>
                    </div>
                    {isAdmin && (
                        <Button
                            color="amber"
                            className="ml-auto"
                            onClick={() => {
                                setEditingPost(null);
                                setFormData(defaultFormData);
                                setShowCreateDialog(true);
                            }}
                        >
                            <PlusIcon data-slot="icon" />
                            New post
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-4 border-b border-zinc-700">
                    <Tab.Group selectedIndex={["published", "draft", "scheduled"].indexOf(activeTab)} onChange={(i) => setActiveTab(["published", "draft", "scheduled"][i] as TabType)}>
                        <Tab.List className="flex gap-6">
                            {[
                                { key: "published", label: "Published" },
                                { key: "draft", label: "Draft" },
                                { key: "scheduled", label: "Scheduled" },
                            ].map((tab) => (
                                <Tab
                                    key={tab.key}
                                    className={({ selected }) =>
                                        clsx(
                                            "pb-3 text-sm font-medium outline-none transition-colors",
                                            selected
                                                ? "border-b-2 border-amber-500 text-amber-400"
                                                : "text-zinc-400 hover:text-zinc-200"
                                        )
                                    }
                                >
                                    {tab.label}
                                </Tab>
                            ))}
                        </Tab.List>
                    </Tab.Group>
                </div>

                {/* Search */}
                <div className="flex flex-wrap items-center gap-4">
                    <InputGroup className="w-full max-w-md">
                        <SearchIcon data-slot="icon" className="size-5 text-zinc-500" />
                        <Input
                            type="search"
                            placeholder="Filter by title or content"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                </div>

                {/* Error message */}
                {error && (
                    <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 text-red-300">
                        <p>{error}</p>
                        <button className="mt-2 text-sm underline hover:text-red-200" onClick={() => setError(null)}>
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Posts Table */}
                <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-zinc-700 bg-zinc-800">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Title</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Published by</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Published as</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Status</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Created at</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Published at</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Sticky Until</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Players</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Parents</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Website</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Recipients</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Groups</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">View Count</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">Comments</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-12 text-center text-zinc-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <LoadingSpinner className="size-5" />
                                                Loading posts...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-12 text-center text-zinc-400">
                                            <MegaphoneIcon className="mx-auto mb-3 size-12 text-zinc-600" />
                                            <p className="font-medium text-zinc-300">No posts found</p>
                                            <p className="mt-1 text-sm">Create your first post to share with your club.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <button
                                                    className="max-w-xs truncate text-left font-medium text-amber-400 hover:text-amber-300 hover:underline"
                                                    onClick={() => {
                                                        setPreviewPost(post);
                                                        setShowPreviewDialog(true);
                                                    }}
                                                >
                                                    {post.title || post.content.slice(0, 50)}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar initials={getInitials(post.authorName)} className="size-7 bg-amber-900/50 text-amber-400 text-xs" />
                                                    <span className="text-zinc-300">{post.authorName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {post.postAsClub && post.targetGroupNames?.[0] ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-6 items-center justify-center rounded-full bg-blue-900/50">
                                                            <ShieldIcon className="size-3 text-blue-400" />
                                                        </div>
                                                        <span className="text-zinc-400">{post.targetGroupNames[0]}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    color={post.status === "Published" ? "green" : post.status === "Draft" ? "zinc" : "amber"}
                                                >
                                                    {post.status}
                                                </Badge>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                                                {formatDate(post.createdAt)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                                                {formatDate(post.publishedAt)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-zinc-500">-</td>
                                            <td className="px-4 py-3">{getVisibilityIcon(post.visibilityRoles, "Players")}</td>
                                            <td className="px-4 py-3">{getVisibilityIcon(post.visibilityRoles, "Parents")}</td>
                                            <td className="px-4 py-3">{getVisibilityIcon(post.visibilityRoles, "Public")}</td>
                                            <td className="px-4 py-3 text-zinc-400">{post.reactionsCount || "-"}</td>
                                            <td className="px-4 py-3 text-zinc-400">{post.targetGroupNames?.length || "-"}</td>
                                            <td className="px-4 py-3 text-zinc-400">{post.viewCount || "-"}</td>
                                            <td className="px-4 py-3">
                                                {post.commentsEnabled ? (
                                                    <span className="text-amber-400">{post.commentCount || 0}</span>
                                                ) : (
                                                    <span className="text-zinc-600">Disabled</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isAdmin && (
                                                    <Menu as="div" className="relative">
                                                        <MenuButton className="rounded p-1 hover:bg-zinc-700 transition-colors">
                                                            <EllipsisIcon className="size-5 text-zinc-400" />
                                                        </MenuButton>
                                                        <Transition
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            <MenuItems className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-lg bg-zinc-800 py-1 shadow-lg ring-1 ring-zinc-700 focus:outline-none">
                                                                <MenuItem>
                                                                    {({ active }) => (
                                                                        <button
                                                                            className={clsx(
                                                                                "flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-300",
                                                                                active ? "bg-zinc-700" : ""
                                                                            )}
                                                                            onClick={() => openEditDialog(post)}
                                                                        >
                                                                            <PencilIcon className="size-4" />
                                                                            Edit
                                                                        </button>
                                                                    )}
                                                                </MenuItem>
                                                                {post.status === "Draft" && (
                                                                    <MenuItem>
                                                                        {({ active }) => (
                                                                            <button
                                                                                className={clsx(
                                                                                    "flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400",
                                                                                    active ? "bg-zinc-700" : ""
                                                                                )}
                                                                                onClick={() => void handlePublish(post)}
                                                                            >
                                                                                <SendIcon className="size-4" />
                                                                                Publish
                                                                            </button>
                                                                        )}
                                                                    </MenuItem>
                                                                )}
                                                                <MenuItem>
                                                                    {({ active }) => (
                                                                        <button
                                                                            className={clsx(
                                                                                "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400",
                                                                                active ? "bg-zinc-700" : ""
                                                                            )}
                                                                            onClick={() => void handleDelete(post)}
                                                                        >
                                                                            <TrashIcon className="size-4" />
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </MenuItem>
                                                            </MenuItems>
                                                        </Transition>
                                                    </Menu>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredPosts.length > 0 && (
                        <div className="border-t border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-400">
                            Showing 1 to {filteredPosts.length} of {filteredPosts.length} results
                        </div>
                    )}
                </div>

                {/* Create/Edit Post Dialog */}
                <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} size="2xl">
                    <DialogTitle className="text-white">{editingPost ? "Edit post" : "New post"}</DialogTitle>

                    {/* Scope tabs */}
                    <div className="mt-4 flex gap-2">
                        {[
                            { key: "Group", label: "Group post" },
                            { key: "MultiGroup", label: "Multi group" },
                            { key: "ClubLobby", label: "Club lobby" },
                        ].map((scope) => (
                            <button
                                key={scope.key}
                                className={clsx(
                                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                                    formData.scope === scope.key
                                        ? "bg-amber-500 text-white"
                                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                )}
                                onClick={() => updateForm({ scope: scope.key as PostScope })}
                            >
                                {scope.label}
                            </button>
                        ))}
                    </div>

                    <DialogBody className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Title</label>
                            <Input
                                placeholder="Write your title here"
                                value={formData.title}
                                onChange={(e) => updateForm({ title: e.target.value })}
                                className="mt-1"
                            />
                            <p className="mt-1 text-xs text-zinc-500">Post titles are optional</p>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Content</label>
                            <Textarea
                                placeholder="Write a post, link a YouTube video"
                                value={formData.content}
                                onChange={(e) => updateForm({ content: e.target.value })}
                                rows={5}
                                className="mt-1"
                            />
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Attachments</label>
                            <p className="mb-2 text-xs text-zinc-500">Attachments are limited to 40 files.</p>

                            {formData.attachments.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {formData.attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2"
                                        >
                                            {file.type.startsWith("image/") ? (
                                                <ImageIcon className="size-4 text-zinc-400" />
                                            ) : file.type.startsWith("video/") ? (
                                                <VideoIcon className="size-4 text-zinc-400" />
                                            ) : (
                                                <FileIcon className="size-4 text-zinc-400" />
                                            )}
                                            <span className="max-w-32 truncate text-sm text-zinc-300">{file.name}</span>
                                            <button
                                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                <XIcon className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Button
                                outline
                                className="text-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PlusIcon data-slot="icon" />
                                Add attachments
                            </Button>
                        </div>

                        {/* Advanced settings toggle */}
                        <details className="group">
                            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors">
                                Advanced settings
                                <ChevronRightIcon className="size-4 transition-transform group-open:rotate-90" />
                            </summary>

                            <div className="mt-4 space-y-4 rounded-lg bg-zinc-800/50 p-4">
                                {/* Group selection */}
                                {formData.scope !== "ClubLobby" && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300">Target Groups</label>
                                        <Select
                                            value={formData.targetGroupIds[0] || ""}
                                            onChange={(e) => updateForm({ targetGroupIds: e.target.value ? [e.target.value] : [] })}
                                            className="mt-1"
                                        >
                                            <option value="">Select a group</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                )}

                                {/* Visibility roles */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300">Visibility</label>
                                    <div className="mt-2 space-y-2">
                                        {[
                                            { key: "Players", label: "Players" },
                                            { key: "Parents", label: "Parents" },
                                            { key: "AdminsAndStaff", label: "Admins & Staff" },
                                            { key: "Public", label: "Public (Website)" },
                                        ].map((role) => (
                                            <CheckboxField key={role.key}>
                                                <Checkbox
                                                    checked={formData.visibilityRoles.includes(role.key as VisibilityRole)}
                                                    onChange={(checked) => {
                                                        if (checked) {
                                                            updateForm({
                                                                visibilityRoles: [...formData.visibilityRoles, role.key as VisibilityRole],
                                                            });
                                                        } else {
                                                            updateForm({
                                                                visibilityRoles: formData.visibilityRoles.filter((r) => r !== role.key),
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Label>{role.label}</Label>
                                            </CheckboxField>
                                        ))}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-2">
                                    <CheckboxField>
                                        <Checkbox
                                            checked={formData.commentsEnabled}
                                            onChange={(checked) => updateForm({ commentsEnabled: checked })}
                                        />
                                        <Label>Enable comments</Label>
                                    </CheckboxField>

                                    <CheckboxField>
                                        <Checkbox
                                            checked={formData.notifyRecipients}
                                            onChange={(checked) => updateForm({ notifyRecipients: checked })}
                                        />
                                        <Label>Notify recipients</Label>
                                    </CheckboxField>

                                    <CheckboxField>
                                        <Checkbox
                                            checked={formData.isSticky}
                                            onChange={(checked) => updateForm({ isSticky: checked })}
                                        />
                                        <Label>Make sticky (pin to top)</Label>
                                    </CheckboxField>

                                    <CheckboxField>
                                        <Checkbox
                                            checked={formData.postAsClub}
                                            onChange={(checked) => updateForm({ postAsClub: checked })}
                                        />
                                        <Label>Post as club</Label>
                                    </CheckboxField>
                                </div>

                                {/* Publish mode */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300">Publish mode</label>
                                    <Select
                                        value={formData.publishMode}
                                        onChange={(e) => updateForm({ publishMode: e.target.value as PublishMode })}
                                        className="mt-1"
                                    >
                                        <option value="PublishNow">Publish now</option>
                                        <option value="Draft">Save as draft</option>
                                        <option value="Schedule">Schedule</option>
                                    </Select>
                                </div>

                                {/* Schedule date */}
                                {formData.publishMode === "Schedule" && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300">Schedule date & time</label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.scheduledPublishAtUtc}
                                            onChange={(e) => updateForm({ scheduledPublishAtUtc: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </details>
                    </DialogBody>

                    <DialogActions>
                        <Button plain onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleSubmit}
                            disabled={submitting || !formData.content.trim()}
                        >
                            {submitting ? (
                                <>
                                    <LoadingSpinner className="size-4" />
                                    Saving...
                                </>
                            ) : (
                                "Preview"
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={showPreviewDialog} onClose={() => setShowPreviewDialog(false)} size="xl">
                    <DialogTitle className="text-white">{previewPost?.title || "Post Preview"}</DialogTitle>
                    <DialogBody>
                        {previewPost && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar initials={getInitials(previewPost.authorName)} className="size-10 bg-amber-900/50 text-amber-400" />
                                    <div>
                                        <p className="font-medium text-zinc-100">{previewPost.authorName}</p>
                                        <p className="text-sm text-zinc-400">{formatDate(previewPost.publishedAt || previewPost.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="prose prose-sm prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-zinc-300">{previewPost.content}</p>
                                </div>

                                {previewPost.attachments?.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {previewPost.attachments.map((attachment) => (
                                            <div key={attachment.id} className="overflow-hidden rounded-lg border border-zinc-700">
                                                {attachment.contentType.startsWith("image/") ? (
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.fileName}
                                                        className="aspect-video w-full object-cover"
                                                    />
                                                ) : attachment.contentType.startsWith("video/") ? (
                                                    <video
                                                        src={attachment.url}
                                                        className="aspect-video w-full object-cover"
                                                        controls
                                                    />
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center bg-zinc-800">
                                                        <FileIcon className="size-8 text-zinc-500" />
                                                        <span className="ml-2 text-sm text-zinc-400">{attachment.fileName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 border-t border-zinc-700 pt-4 text-sm text-zinc-400">
                                    <span>{previewPost.viewCount} views</span>
                                    <span>{previewPost.commentCount} comments</span>
                                    <span>{previewPost.reactionsCount} reactions</span>
                                </div>
                            </div>
                        )}
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setShowPreviewDialog(false)}>
                            Close
                        </Button>
                        {isAdmin && previewPost && (
                            <Button color="amber" onClick={() => {
                                setShowPreviewDialog(false);
                                openEditDialog(previewPost);
                            }}>
                                Edit post
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

// Icons
function iconClasses(className?: string) {
    return ["size-5", className].filter(Boolean).join(" ");
}

function ChevronLeftIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronRightIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PlusIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
    );
}

function MegaphoneIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M4 11V7l13-4v16l-13-4v-4" strokeLinejoin="round" />
            <path d="M4 15v2a3 3 0 0 0 3 3h1" strokeLinecap="round" />
        </svg>
    );
}

function EllipsisIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
        </svg>
    );
}

function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M17 3l4 4-12 12H5v-4L17 3z" strokeLinejoin="round" />
        </svg>
    );
}

function TrashIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SendIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
        </svg>
    );
}

function CheckCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function XCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
        </svg>
    );
}

function XIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
    );
}

function ImageIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

function VideoIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <rect x="2" y="4" width="14" height="16" rx="2" />
            <path d="M16 10l6-4v12l-6-4v-4z" />
        </svg>
    );
}

function FileIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ShieldIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M12 3 4 6v6c0 4.28 2.99 8.42 8 9.99 5.01-1.57 8-5.71 8-9.99V6z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LoadingSpinner({ className }: { className?: string }) {
    return (
        <svg className={clsx("animate-spin", className)} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

