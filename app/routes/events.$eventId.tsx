import { useEffect, useState, type SVGProps, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router";
import type { Route } from "./+types/events.$eventId";
import clsx from "clsx";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Avatar } from "../components/avatar";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { useAuth } from "~/context/auth-context";
import {
    getEvent,
    subscribeToComments,
    subscribeToNotes,
    addComment,
    addNote,
    deleteNote,
    updateAttendance,
    addParticipant,
    removeParticipant,
    type CalendarEvent,
    type EventComment,
    type EventNote,
    type EventParticipant,
    type AttendanceStatus,
    eventTypeConfig,
    isGameEvent,
} from "~/lib/firestore-events";
import { subscribeToClubMembers, type ClubMember } from "~/lib/firestore-team";
import { Timestamp } from "firebase/firestore";
import {
    getMatchResultByEventId,
    createMatchResult,
    updateMatchResult,
    endMatch,
    addCardToMatch,
    removeCardFromMatch,
    addGoalToMatch,
    type MatchResult,
    type CardEvent,
    type GoalEvent,
    type CardType,
    type GoalType,
    goalTypeLabels,
} from "~/lib/firestore-games";

export function meta({ params }: Route.MetaArgs) {
    return [
        { title: "Event Details · Jordan Knights Dashboard" },
        { name: "description", content: "View event details, attendees, and resources." },
    ];
}

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { activeClub, profile } = useAuth();
    const [event, setEvent] = useState<CalendarEvent | null>(null);
    const [comments, setComments] = useState<EventComment[]>([]);
    const [notes, setNotes] = useState<EventNote[]>([]);
    const [members, setMembers] = useState<ClubMember[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"event" | "notes">("event");
    
    // Modal states
    const [showAddOrganizer, setShowAddOrganizer] = useState(false);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [newNote, setNewNote] = useState({ title: "", content: "" });

    // Find the current user's ClubMember record (links Firebase Auth UID to ClubMember ID)
    const currentUserMember = members.find(m => m.userId === profile?.id);
    const currentUserMemberId = currentUserMember?.id;
    
    // Check if current user is admin/organizer
    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
    const isOrganizer = event?.organizers.some(o => o.id === currentUserMemberId);
    const canManage = isAdmin || isOrganizer;

    useEffect(() => {
        if (!activeClub?.id || !eventId) return;

        const loadEvent = async () => {
            setLoading(true);
            const eventData = await getEvent(activeClub.id, eventId);
            setEvent(eventData);
            setLoading(false);
        };

        void loadEvent();

        const unsubComments = subscribeToComments(activeClub.id, eventId, setComments);
        const unsubNotes = subscribeToNotes(activeClub.id, eventId, setNotes);
        const unsubMembers = subscribeToClubMembers(activeClub.id, setMembers);
        
        return () => {
            unsubComments();
            unsubNotes();
            unsubMembers();
        };
    }, [activeClub?.id, eventId]);

    const refreshEvent = async () => {
        if (!activeClub?.id || !eventId) return;
        const eventData = await getEvent(activeClub.id, eventId);
        setEvent(eventData);
    };

    const handleAddComment = async () => {
        if (!activeClub?.id || !eventId || !profile || !newComment.trim()) return;

        await addComment(activeClub.id, eventId, {
            eventId,
            userId: profile.id,
            userName: profile.displayName,
            userInitials: getInitials(profile.displayName),
            content: newComment.trim(),
        });
        setNewComment("");
    };

    const handleUpdateAttendance = async (participantId: string, status: AttendanceStatus, isOrganizerList: boolean) => {
        if (!activeClub?.id || !eventId) return;
        
        // Check permission: admin can change anyone, user can only change their own
        if (!canManage && participantId !== currentUserMemberId) {
            return;
        }
        
        await updateAttendance(activeClub.id, eventId, participantId, status, isOrganizerList);
        await refreshEvent();
    };

    const handleAddMember = async (member: ClubMember, asOrganizer: boolean) => {
        if (!activeClub?.id || !eventId) return;
        
        const participant: EventParticipant = {
            id: member.id,
            name: member.name,
            initials: member.initials,
            role: asOrganizer ? "organizer" : "participant",
            attendanceStatus: "pending",
        };
        
        await addParticipant(activeClub.id, eventId, participant);
        await refreshEvent();
        
        if (asOrganizer) {
            setShowAddOrganizer(false);
        } else {
            setShowAddParticipant(false);
        }
        setMemberSearch("");
    };

    const handleRemoveMember = async (memberId: string, isOrganizerList: boolean) => {
        if (!activeClub?.id || !eventId || !canManage) return;
        
        await removeParticipant(activeClub.id, eventId, memberId, isOrganizerList);
        await refreshEvent();
    };

    const handleAddNote = async () => {
        if (!activeClub?.id || !eventId || !profile || !newNote.title.trim()) return;

        await addNote(activeClub.id, eventId, {
            eventId,
            userId: profile.id,
            userName: profile.displayName,
            userInitials: getInitials(profile.displayName),
            title: newNote.title.trim(),
            content: newNote.content.trim(),
        });
        setNewNote({ title: "", content: "" });
        setShowAddNote(false);
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!activeClub?.id || !eventId) return;
        await deleteNote(activeClub.id, eventId, noteId);
    };

    // Filter members not already in the event
    const getAvailableMembers = (forOrganizers: boolean) => {
        const existingIds = new Set([
            ...event?.organizers.map(o => o.id) || [],
            ...event?.participants.map(p => p.id) || [],
        ]);
        
        return members
            .filter(m => !existingIds.has(m.id))
            .filter(m => 
                memberSearch === "" ||
                m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                m.email.toLowerCase().includes(memberSearch.toLowerCase())
            );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout>
                <div className="min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950">
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <Text className="text-zinc-400">Event not found</Text>
                        <Button onClick={() => navigate("/calendar")}>Back to Calendar</Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const typeConfig = eventTypeConfig[event.type];
    const currentUserParticipant = [...event.organizers, ...event.participants].find(
        (p) => p.id === currentUserMemberId
    );
    const userAttendanceStatus = currentUserParticipant?.attendanceStatus;
    const isCurrentUserOrganizer = event.organizers.some(o => o.id === currentUserMemberId);

    return (
        <DashboardLayout>
            <div className="min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button plain onClick={() => navigate("/calendar")} className="p-2 hover:bg-zinc-800 rounded-lg">
                        <BackIcon className="size-5 text-zinc-400" />
                    </Button>
                    <CalendarIcon className="size-5 text-zinc-500" />
                    <Heading level={1} className="text-xl font-semibold text-zinc-100">
                        {event.title}
                    </Heading>
                </div>

                {/* Tabs - removed session tab */}
                <div className="flex gap-6 border-b border-zinc-700">
                    {(["event", "notes"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "pb-3 text-sm font-medium capitalize transition-colors",
                                activeTab === tab
                                    ? "border-b-2 border-blue-500 text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {activeTab === "event" && (
                            <EventTabContent
                                event={event}
                                typeConfig={typeConfig}
                                userAttendanceStatus={userAttendanceStatus}
                                currentUserId={currentUserMemberId}
                                isCurrentUserOrganizer={isCurrentUserOrganizer}
                                canManage={canManage}
                                onUpdateOwnAttendance={(status) => {
                                    if (currentUserMemberId && currentUserParticipant) {
                                        handleUpdateAttendance(
                                            currentUserMemberId,
                                            status,
                                            isCurrentUserOrganizer
                                        );
                                    }
                                }}
                                clubId={activeClub?.id ?? ""}
                                members={members}
                            />
                        )}
                        {activeTab === "notes" && (
                            <NotesTabContent
                                notes={notes}
                                onAddNote={() => setShowAddNote(true)}
                                onDeleteNote={handleDeleteNote}
                                canManage={canManage}
                                currentUserId={profile?.id} // Notes use profile.id since they store userId from profile
                            />
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-zinc-700 pt-6">
                            <h3 className="text-sm font-medium text-zinc-100 mb-4">Comments ({comments.length})</h3>
                            <div className="flex items-center gap-3">
                                <Avatar
                                    initials={getInitials(profile?.displayName || "")}
                                    className="size-9 bg-zinc-700 text-zinc-300"
                                />
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                void handleAddComment();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handleAddComment()}
                                        disabled={!newComment.trim()}
                                        className="p-2 text-blue-400 hover:text-blue-300 disabled:text-zinc-600 disabled:cursor-not-allowed"
                                    >
                                        <SendIcon className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {comments.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar
                                                initials={comment.userInitials}
                                                className="size-9 bg-zinc-700 text-zinc-300"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-zinc-100">
                                                        {comment.userName}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {formatTimestamp(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-400">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Your Attendance Status (if part of event) */}
                        {currentUserParticipant && currentUserMemberId && (
                            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                                <h3 className="font-medium text-zinc-100 mb-3">Your Attendance</h3>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateAttendance(
                                            currentUserMemberId,
                                            "accepted",
                                            isCurrentUserOrganizer
                                        )}
                                        className={clsx(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                            userAttendanceStatus === "accepted"
                                                ? "bg-green-600 text-white"
                                                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                        )}
                                    >
                                        <CheckIcon className="size-4 inline mr-1" />
                                        Attending
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateAttendance(
                                            currentUserMemberId,
                                            "declined",
                                            isCurrentUserOrganizer
                                        )}
                                        className={clsx(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                            userAttendanceStatus === "declined"
                                                ? "bg-red-600 text-white"
                                                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                        )}
                                    >
                                        <XIcon className="size-4 inline mr-1" />
                                        Not Attending
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Organizers */}
                        <ParticipantsList
                            title="Organizers"
                            participants={event.organizers}
                            onUpdateAttendance={(id, status) => handleUpdateAttendance(id, status, true)}
                            onRemove={(id) => handleRemoveMember(id, true)}
                            onAdd={() => setShowAddOrganizer(true)}
                            canManage={canManage}
                            currentUserId={currentUserMemberId}
                        />

                        {/* Participants */}
                        <ParticipantsList
                            title="Participants"
                            participants={event.participants}
                            onUpdateAttendance={(id, status) => handleUpdateAttendance(id, status, false)}
                            onRemove={(id) => handleRemoveMember(id, false)}
                            onAdd={() => setShowAddParticipant(true)}
                            canManage={canManage}
                            currentUserId={currentUserMemberId}
                        />

                        {/* Saved info */}
                        <div className="text-xs text-zinc-500">
                            Saved {formatTimestamp(event.updatedAt)} by {event.createdByName}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Add Organizer Modal */}
            <MemberPickerDialog
                isOpen={showAddOrganizer}
                onClose={() => {
                    setShowAddOrganizer(false);
                    setMemberSearch("");
                }}
                title="Add Organizer"
                members={getAvailableMembers(true)}
                searchQuery={memberSearch}
                onSearchChange={setMemberSearch}
                onSelectMember={(member) => handleAddMember(member, true)}
            />

            {/* Add Participant Modal */}
            <MemberPickerDialog
                isOpen={showAddParticipant}
                onClose={() => {
                    setShowAddParticipant(false);
                    setMemberSearch("");
                }}
                title="Add Participant"
                members={getAvailableMembers(false)}
                searchQuery={memberSearch}
                onSearchChange={setMemberSearch}
                onSelectMember={(member) => handleAddMember(member, false)}
            />

            {/* Add Note Modal */}
            <Dialog open={showAddNote} onClose={() => setShowAddNote(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 p-6">
                        <DialogTitle className="text-lg font-semibold text-zinc-100 mb-4">Add Note</DialogTitle>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    placeholder="Note title"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Content</label>
                                <textarea
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    placeholder="Write your note..."
                                    rows={4}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                outline
                                onClick={() => setShowAddNote(false)}
                                className="text-zinc-300 border-zinc-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => void handleAddNote()}
                                disabled={!newNote.title.trim()}
                                className="bg-blue-600 text-white hover:bg-blue-500"
                            >
                                Add Note
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </DashboardLayout>
    );
}

// ==================== Member Picker Dialog ====================

function MemberPickerDialog({
    isOpen,
    onClose,
    title,
    members,
    searchQuery,
    onSearchChange,
    onSelectMember,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    members: ClubMember[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectMember: (member: ClubMember) => void;
}) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 p-6 max-h-[80vh] flex flex-col">
                    <DialogTitle className="text-lg font-semibold text-zinc-100 mb-4">{title}</DialogTitle>
                    
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search members..."
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                        {members.length === 0 ? (
                            <p className="text-center text-zinc-500 py-8">No members found</p>
                        ) : (
                            members.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => onSelectMember(member)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                                >
                                    <Avatar
                                        initials={member.initials}
                                        className={clsx(
                                            "size-10",
                                            member.segment === "staff" ? "bg-blue-900/50 text-blue-300" : "bg-green-900/50 text-green-300"
                                        )}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-100 truncate">{member.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                                    </div>
                                    <Badge color={member.segment === "staff" ? "blue" : "green"} className="text-xs">
                                        {member.segment}
                                    </Badge>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t border-zinc-700">
                        <Button
                            outline
                            onClick={onClose}
                            className="text-zinc-300 border-zinc-700"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

// ==================== Event Tab Content ====================

function EventTabContent({
    event,
    typeConfig,
    userAttendanceStatus,
    currentUserId,
    isCurrentUserOrganizer,
    canManage,
    onUpdateOwnAttendance,
    clubId,
    members,
}: {
    event: CalendarEvent;
    typeConfig: { label: string; color: string; dotColor: string };
    userAttendanceStatus?: AttendanceStatus;
    currentUserId?: string;
    isCurrentUserOrganizer: boolean;
    canManage: boolean;
    onUpdateOwnAttendance: (status: AttendanceStatus) => void;
    clubId: string;
    members: ClubMember[];
}) {
    const startDate = event.startTime?.toDate();
    const endDate = event.endTime?.toDate();

    return (
        <div className="space-y-6">
            {/* Event Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge color={typeConfig.color as "green" | "amber" | "blue" | "purple" | "red" | "zinc"}>
                            {typeConfig.label}
                        </Badge>
                    </div>
                    <Heading level={2} className="text-2xl font-semibold text-zinc-100">
                        {event.title}
                    </Heading>

                    {userAttendanceStatus && (
                        <div className="flex items-center gap-2">
                            <span className={clsx(
                                "text-sm font-medium px-2 py-1 rounded-full",
                                userAttendanceStatus === "accepted" && "bg-green-900/50 text-green-400",
                                userAttendanceStatus === "declined" && "bg-red-900/50 text-red-400",
                                userAttendanceStatus === "pending" && "bg-yellow-900/50 text-yellow-400"
                            )}>
                                {userAttendanceStatus === "accepted" && "✓ You're attending"}
                                {userAttendanceStatus === "declined" && "✗ You declined"}
                                {userAttendanceStatus === "pending" && "⏳ Pending response"}
                            </span>
                        </div>
                    )}
                </div>

                <Button plain className="p-2 hover:bg-zinc-800 rounded-lg">
                    <MoreIcon className="size-5 text-zinc-400" />
                </Button>
            </div>

            {/* Event Details */}
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-zinc-400">
                    <CalendarIcon className="size-5 text-zinc-500" />
                    <span>
                        {startDate && formatEventDateTime(startDate, endDate)}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                    <LocationIcon className="size-5 text-zinc-500" />
                    <span>{event.location}</span>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <MapIcon className="size-4" />
                        Open in Maps
                    </a>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                    <Avatar initials={getInitials(event.createdByName)} className="size-5 bg-zinc-700 text-zinc-300" />
                    <span>
                        Created by{" "}
                        <span className="text-blue-400">
                            {event.createdByName}
                        </span>
                    </span>
                </div>
            </div>

            {/* Physical Strain */}
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-medium text-zinc-100">Physical strain</h3>
                        <p className="text-xs text-zinc-500">Expected intensity level</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Intensity</span>
                        <span className={clsx(
                            "font-medium",
                            event.physicalStrain < 30 && "text-green-400",
                            event.physicalStrain >= 30 && event.physicalStrain < 60 && "text-yellow-400",
                            event.physicalStrain >= 60 && "text-red-400"
                        )}>
                            {event.physicalStrain < 30 && "Low"}
                            {event.physicalStrain >= 30 && event.physicalStrain < 60 && "Moderate"}
                            {event.physicalStrain >= 60 && "High"}
                            {" "}({event.physicalStrain}%)
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
                        <div
                            className={clsx(
                                "h-full rounded-full transition-all",
                                event.physicalStrain < 30 && "bg-green-500",
                                event.physicalStrain >= 30 && event.physicalStrain < 60 && "bg-yellow-500",
                                event.physicalStrain >= 60 && "bg-red-500"
                            )}
                            style={{ width: `${event.physicalStrain}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Stats */}
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <h3 className="font-medium text-zinc-100 mb-3">Attendance Summary</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-green-400">{event.attendanceStats.accepted}</p>
                        <p className="text-xs text-zinc-500">Attending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-400">{event.attendanceStats.declined}</p>
                        <p className="text-xs text-zinc-500">Declined</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-400">{event.attendanceStats.pending}</p>
                        <p className="text-xs text-zinc-500">Pending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-zinc-400">{event.attendanceStats.waiting}</p>
                        <p className="text-xs text-zinc-500">Waiting</p>
                    </div>
                </div>
            </div>

            {/* Resources */}
            {event.resources.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-medium text-zinc-100">Resources</h3>
                    {event.resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-700">
                                <FieldIcon className="size-6 text-zinc-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-zinc-100">{resource.name}</p>
                                <p className="text-sm text-zinc-500">{resource.location}</p>
                            </div>
                            <div className="flex gap-2">
                                {resource.tags?.map((tag) => (
                                    <Badge key={tag} color="zinc" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Game Details (for game/cup events) */}
            {isGameEvent(event.type) && event.gameDetails && (
                <GameDetailsSection 
                    gameDetails={event.gameDetails} 
                    event={event}
                    clubId={clubId}
                    canManage={canManage}
                    members={members}
                />
            )}
        </div>
    );
}

// ==================== Notes Tab Content ====================

function NotesTabContent({
    notes,
    onAddNote,
    onDeleteNote,
    canManage,
    currentUserId,
}: {
    notes: EventNote[];
    onAddNote: () => void;
    onDeleteNote: (noteId: string) => void;
    canManage: boolean;
    currentUserId?: string;
}) {
    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <NotesIcon className="size-12 text-zinc-600 mb-4" />
                <p className="text-zinc-400 mb-4">No notes have been added yet</p>
                <Button onClick={onAddNote} className="bg-blue-600 text-white hover:bg-blue-500">
                    <PlusIcon className="size-4 mr-1" />
                    Add Note
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">Notes ({notes.length})</h3>
                <Button onClick={onAddNote} className="bg-blue-600 text-white hover:bg-blue-500 text-sm">
                    <PlusIcon className="size-4 mr-1" />
                    Add Note
                </Button>
            </div>

            <div className="space-y-3">
                {notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-zinc-100">{note.title}</h4>
                            {(canManage || note.userId === currentUserId) && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteNote(note.id)}
                                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <TrashIcon className="size-4" />
                                </button>
                            )}
                        </div>
                        {note.content && (
                            <p className="text-sm text-zinc-400 whitespace-pre-wrap">{note.content}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                            <Avatar initials={note.userInitials} className="size-5 bg-zinc-700 text-zinc-300" />
                            <span>{note.userName}</span>
                            <span>•</span>
                            <span>{formatTimestamp(note.createdAt)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==================== Game Details Section ====================

function GameDetailsSection({ 
    gameDetails, 
    event,
    clubId,
    canManage,
    members,
}: { 
    gameDetails: NonNullable<CalendarEvent["gameDetails"]>;
    event: CalendarEvent;
    clubId: string;
    canManage: boolean;
    members: ClubMember[];
}) {
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [showCardDialog, setShowCardDialog] = useState(false);
    const [showGoalDialog, setShowGoalDialog] = useState(false);
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);

    // Load match result
    useEffect(() => {
        const loadMatchResult = async () => {
            if (!clubId || !event.id) return;
            setLoading(true);
            try {
                const result = await getMatchResultByEventId(clubId, event.id);
                setMatchResult(result);
                if (result) {
                    setHomeScore(result.homeScore);
                    setAwayScore(result.awayScore);
                }
            } catch (error) {
                console.error("Error loading match result:", error);
            } finally {
                setLoading(false);
            }
        };
        void loadMatchResult();
    }, [clubId, event.id]);

    const handleCreateOrUpdateScore = async () => {
        if (!clubId || !event.id) return;

        try {
            if (matchResult) {
                await updateMatchResult(clubId, matchResult.id, {
                    homeScore,
                    awayScore,
                });
                setMatchResult({ ...matchResult, homeScore, awayScore });
            } else {
                const id = await createMatchResult(clubId, {
                    eventId: event.id,
                    competitionId: gameDetails.competitionId,
                    competitionName: gameDetails.competition,
                    opponentName: gameDetails.awayTeam?.name || gameDetails.homeTeam?.name || "Unknown",
                    opponentLogoUrl: gameDetails.awayTeam?.logoUrl || gameDetails.homeTeam?.logoUrl,
                    matchDate: event.startTime,
                    isHome: true,
                    status: "in_progress",
                    homeScore,
                    awayScore,
                    goals: [],
                    cards: [],
                    playerStats: [],
                });
                const result = await getMatchResultByEventId(clubId, event.id);
                setMatchResult(result);
            }
            setShowScoreDialog(false);
        } catch (error) {
            console.error("Error saving score:", error);
        }
    };

    const handleEndGame = async () => {
        if (!clubId || !matchResult) return;
        if (!confirm("Are you sure you want to end this game? This will mark the match as completed.")) return;

        try {
            await endMatch(clubId, matchResult.id, { home: homeScore, away: awayScore });
            setMatchResult({ ...matchResult, status: "completed" });
        } catch (error) {
            console.error("Error ending match:", error);
        }
    };

    const handleAddCard = async (cardData: { playerId: string; playerName: string; cardType: CardType; minute: number; reason?: string }) => {
        if (!clubId || !matchResult) return;

        try {
            await addCardToMatch(clubId, matchResult.id, cardData);
            const result = await getMatchResultByEventId(clubId, event.id);
            setMatchResult(result);
            setShowCardDialog(false);
        } catch (error) {
            console.error("Error adding card:", error);
        }
    };

    const handleRemoveCard = async (cardId: string) => {
        if (!clubId || !matchResult) return;

        try {
            await removeCardFromMatch(clubId, matchResult.id, cardId);
            const result = await getMatchResultByEventId(clubId, event.id);
            setMatchResult(result);
        } catch (error) {
            console.error("Error removing card:", error);
        }
    };

    const handleAddGoal = async (goalData: Omit<GoalEvent, "id">) => {
        if (!clubId || !matchResult) return;

        try {
            await addGoalToMatch(clubId, matchResult.id, goalData);
            const result = await getMatchResultByEventId(clubId, event.id);
            setMatchResult(result);
            if (result) {
                setHomeScore(result.homeScore);
                setAwayScore(result.awayScore);
            }
            setShowGoalDialog(false);
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const isGameCompleted = matchResult?.status === "completed";

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-4">
                <h3 className="font-medium text-zinc-100 flex items-center gap-2">
                    <GameIcon className="size-5 text-zinc-400" />
                    Game Details
                    {isGameCompleted && (
                        <Badge color="green" className="ml-2">Completed</Badge>
                    )}
                    {matchResult?.status === "in_progress" && (
                        <Badge color="amber" className="ml-2">In Progress</Badge>
                    )}
                </h3>

                {/* Teams and Score */}
                {(gameDetails.homeTeam || gameDetails.awayTeam) && (
                    <div className="flex items-center justify-center gap-6">
                        {gameDetails.homeTeam && (
                            <div className="text-center">
                                <div className="size-16 rounded-full bg-zinc-700 flex items-center justify-center mx-auto mb-2">
                                    {gameDetails.homeTeam.logoUrl ? (
                                        <img src={gameDetails.homeTeam.logoUrl} alt="" className="size-12" />
                                    ) : (
                                        <ShieldIcon className="size-8 text-zinc-500" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-zinc-100">{gameDetails.homeTeam.name}</p>
                                <p className="text-xs text-zinc-500">Home</p>
                            </div>
                        )}
                        
                        {/* Score Display */}
                        <div className="text-center px-4">
                            {matchResult ? (
                                <div className="text-3xl font-bold text-zinc-100">
                                    {matchResult.homeScore} - {matchResult.awayScore}
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-zinc-600">vs</span>
                            )}
                        </div>
                        
                        {gameDetails.awayTeam && (
                            <div className="text-center">
                                <div className="size-16 rounded-full bg-zinc-700 flex items-center justify-center mx-auto mb-2">
                                    {gameDetails.awayTeam.logoUrl ? (
                                        <img src={gameDetails.awayTeam.logoUrl} alt="" className="size-12" />
                                    ) : (
                                        <ShieldIcon className="size-8 text-zinc-500" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-zinc-100">{gameDetails.awayTeam.name}</p>
                                <p className="text-xs text-zinc-500">Away</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {gameDetails.competition && (
                        <div>
                            <p className="text-zinc-500">Competition</p>
                            <p className="font-medium text-zinc-100">{gameDetails.competition}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-zinc-500">Format</p>
                        <p className="font-medium text-zinc-100">{gameDetails.gameFormat}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Periods</p>
                        <p className="font-medium text-zinc-100">{gameDetails.periods} × {gameDetails.periodLength} min</p>
                    </div>
                    {gameDetails.field && (
                        <div>
                            <p className="text-zinc-500">Field</p>
                            <p className="font-medium text-zinc-100">{gameDetails.field}</p>
                        </div>
                    )}
                    {gameDetails.fieldType && (
                        <div>
                            <p className="text-zinc-500">Field Type</p>
                            <p className="font-medium text-zinc-100 capitalize">{gameDetails.fieldType}</p>
                        </div>
                    )}
                    {gameDetails.isFriendlyMatch && (
                        <div className="col-span-2">
                            <Badge color="blue">Friendly Match</Badge>
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {canManage && !isGameCompleted && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-700">
                        <Button onClick={() => setShowScoreDialog(true)} className="bg-blue-600 text-white hover:bg-blue-500">
                            {matchResult ? "Update Score" : "Set Score"}
                        </Button>
                        {matchResult && (
                            <>
                                <Button onClick={() => setShowGoalDialog(true)} outline className="text-zinc-300 border-zinc-600 hover:bg-zinc-700">
                                    Add Goal
                                </Button>
                                <Button onClick={() => setShowCardDialog(true)} outline className="text-zinc-300 border-zinc-600 hover:bg-zinc-700">
                                    Add Card
                                </Button>
                                <Button onClick={handleEndGame} color="green" className="ml-auto">
                                    End Game
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Cards Section */}
            {matchResult && matchResult.cards.length > 0 && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <h4 className="font-medium text-zinc-100 mb-3">Cards</h4>
                    <div className="space-y-2">
                        {matchResult.cards.map((card) => (
                            <div key={card.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "size-4 rounded",
                                        card.cardType === "yellow" ? "bg-yellow-400" : "bg-red-500"
                                    )} />
                                    <span className="text-zinc-100">{card.playerName}</span>
                                    <span className="text-zinc-500">{card.minute}'</span>
                                </div>
                                {canManage && !isGameCompleted && (
                                    <button
                                        onClick={() => handleRemoveCard(card.id)}
                                        className="text-zinc-500 hover:text-red-400"
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Goals Section */}
            {matchResult && matchResult.goals.length > 0 && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <h4 className="font-medium text-zinc-100 mb-3">Goals</h4>
                    <div className="space-y-2">
                        {matchResult.goals.map((goal) => (
                            <div key={goal.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">⚽</span>
                                    <span className="text-zinc-100">{goal.scorerName || "Unknown"}</span>
                                    {goal.assistName && (
                                        <span className="text-zinc-500">(assist: {goal.assistName})</span>
                                    )}
                                    <span className="text-zinc-500">{goal.minute}'</span>
                                    <Badge color="zinc" className="text-xs">{goalTypeLabels[goal.goalType]}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Score Dialog */}
            <ScoreDialog
                open={showScoreDialog}
                onClose={() => setShowScoreDialog(false)}
                homeScore={homeScore}
                awayScore={awayScore}
                onHomeScoreChange={setHomeScore}
                onAwayScoreChange={setAwayScore}
                onSave={handleCreateOrUpdateScore}
                homeTeam={gameDetails.homeTeam?.name || "Home"}
                awayTeam={gameDetails.awayTeam?.name || "Away"}
            />

            {/* Card Dialog */}
            <CardDialog
                open={showCardDialog}
                onClose={() => setShowCardDialog(false)}
                onSave={handleAddCard}
                members={members}
            />

            {/* Goal Dialog */}
            <GoalDialog
                open={showGoalDialog}
                onClose={() => setShowGoalDialog(false)}
                onSave={handleAddGoal}
                members={members}
            />
        </div>
    );
}

// Score Dialog
function ScoreDialog({
    open,
    onClose,
    homeScore,
    awayScore,
    onHomeScoreChange,
    onAwayScoreChange,
    onSave,
    homeTeam,
    awayTeam,
}: {
    open: boolean;
    onClose: () => void;
    homeScore: number;
    awayScore: number;
    onHomeScoreChange: (score: number) => void;
    onAwayScoreChange: (score: number) => void;
    onSave: () => void;
    homeTeam: string;
    awayTeam: string;
}) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-xl transition-all">
                                <DialogTitle className="text-lg font-semibold text-zinc-100 mb-4">
                                    Set Match Score
                                </DialogTitle>

                                <div className="flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <p className="text-sm text-zinc-400 mb-2">{homeTeam}</p>
                                        <input
                                            type="number"
                                            min="0"
                                            value={homeScore}
                                            onChange={(e) => onHomeScoreChange(parseInt(e.target.value) || 0)}
                                            className="w-20 h-16 text-center text-3xl font-bold rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <span className="text-2xl text-zinc-500">-</span>
                                    <div className="text-center">
                                        <p className="text-sm text-zinc-400 mb-2">{awayTeam}</p>
                                        <input
                                            type="number"
                                            min="0"
                                            value={awayScore}
                                            onChange={(e) => onAwayScoreChange(parseInt(e.target.value) || 0)}
                                            className="w-20 h-16 text-center text-3xl font-bold rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button outline onClick={onClose} className="text-zinc-300 border-zinc-600">
                                        Cancel
                                    </Button>
                                    <Button onClick={onSave} className="bg-blue-600 text-white hover:bg-blue-500">
                                        Save Score
                                    </Button>
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// Card Dialog
function CardDialog({
    open,
    onClose,
    onSave,
    members,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (card: { playerId: string; playerName: string; cardType: CardType; minute: number; reason?: string }) => void;
    members: ClubMember[];
}) {
    const [playerId, setPlayerId] = useState("");
    const [cardType, setCardType] = useState<CardType>("yellow");
    const [minute, setMinute] = useState(0);
    const [reason, setReason] = useState("");

    const handleSave = () => {
        const player = members.find(m => m.id === playerId);
        if (!player) return;
        onSave({
            playerId,
            playerName: player.name,
            cardType,
            minute,
            reason: reason || undefined,
        });
        // Reset form
        setPlayerId("");
        setCardType("yellow");
        setMinute(0);
        setReason("");
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-xl transition-all">
                                <DialogTitle className="text-lg font-semibold text-zinc-100 mb-4">
                                    Add Card
                                </DialogTitle>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-zinc-400">Player</label>
                                        <select
                                            value={playerId}
                                            onChange={(e) => setPlayerId(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Select player</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Card Type</label>
                                        <div className="flex gap-3 mt-1">
                                            <button
                                                onClick={() => setCardType("yellow")}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-lg border transition-colors",
                                                    cardType === "yellow"
                                                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                                        : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                                                )}
                                            >
                                                Yellow
                                            </button>
                                            <button
                                                onClick={() => setCardType("red")}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-lg border transition-colors",
                                                    cardType === "red"
                                                        ? "bg-red-500/20 border-red-500 text-red-400"
                                                        : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                                                )}
                                            >
                                                Red
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Minute</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={minute}
                                            onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Reason (optional)</label>
                                        <input
                                            type="text"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="e.g., Foul, Handball, etc."
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button outline onClick={onClose} className="text-zinc-300 border-zinc-600">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={!playerId} className="bg-blue-600 text-white hover:bg-blue-500">
                                        Add Card
                                    </Button>
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// Goal Dialog
function GoalDialog({
    open,
    onClose,
    onSave,
    members,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (goal: Omit<GoalEvent, "id">) => void;
    members: ClubMember[];
}) {
    const [scorerId, setScorerId] = useState("");
    const [assistId, setAssistId] = useState("");
    const [minute, setMinute] = useState(0);
    const [goalType, setGoalType] = useState<GoalType>("open_play");
    const [forTeam, setForTeam] = useState<"home" | "away">("home");

    const handleSave = () => {
        const scorer = members.find(m => m.id === scorerId);
        const assister = members.find(m => m.id === assistId);
        
        onSave({
            scorerId: scorerId || undefined,
            scorerName: scorer?.name,
            assistId: assistId || undefined,
            assistName: assister?.name,
            minute,
            goalType,
            isOwnGoal: goalType === "own_goal",
            forTeam,
        });
        // Reset form
        setScorerId("");
        setAssistId("");
        setMinute(0);
        setGoalType("open_play");
        setForTeam("home");
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-xl transition-all">
                                <DialogTitle className="text-lg font-semibold text-zinc-100 mb-4">
                                    Add Goal
                                </DialogTitle>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-zinc-400">For Team</label>
                                        <div className="flex gap-3 mt-1">
                                            <button
                                                onClick={() => setForTeam("home")}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-lg border transition-colors",
                                                    forTeam === "home"
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                                                )}
                                            >
                                                Home
                                            </button>
                                            <button
                                                onClick={() => setForTeam("away")}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-lg border transition-colors",
                                                    forTeam === "away"
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                                                )}
                                            >
                                                Away
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Scorer</label>
                                        <select
                                            value={scorerId}
                                            onChange={(e) => setScorerId(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Select scorer (optional)</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Assist</label>
                                        <select
                                            value={assistId}
                                            onChange={(e) => setAssistId(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Select assist (optional)</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Minute</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={minute}
                                            onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Goal Type</label>
                                        <select
                                            value={goalType}
                                            onChange={(e) => setGoalType(e.target.value as GoalType)}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                                        >
                                            {Object.entries(goalTypeLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button outline onClick={onClose} className="text-zinc-300 border-zinc-600">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-500">
                                        Add Goal
                                    </Button>
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// ==================== Participants List ====================

function ParticipantsList({
    title,
    participants,
    onUpdateAttendance,
    onRemove,
    onAdd,
    canManage,
    currentUserId,
}: {
    title: string;
    participants: EventParticipant[];
    onUpdateAttendance: (id: string, status: AttendanceStatus) => void;
    onRemove: (id: string) => void;
    onAdd: () => void;
    canManage: boolean;
    currentUserId?: string;
}) {
    const attended = participants.filter((p) => p.attendanceStatus === "accepted");
    const declined = participants.filter((p) => p.attendanceStatus === "declined");
    const pending = participants.filter((p) => p.attendanceStatus === "pending");

    return (
        <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">
                    {title} ({participants.length})
                </h3>
                {canManage && (
                    <Button plain onClick={onAdd} className="text-sm text-blue-400 hover:text-blue-300">
                        <PlusIcon className="size-4" />
                        Add
                    </Button>
                )}
            </div>

            {participants.length > 0 && (
                <div className="flex gap-2 text-xs">
                    {attended.length > 0 && (
                        <span className="text-green-400">{attended.length} attending</span>
                    )}
                    {declined.length > 0 && (
                        <span className="text-red-400">{declined.length} declined</span>
                    )}
                    {pending.length > 0 && (
                        <span className="text-yellow-400">{pending.length} pending</span>
                    )}
                </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {participants.map((participant) => {
                    const isCurrentUser = participant.id === currentUserId;
                    const canChangeAttendance = canManage || isCurrentUser;
                    
                    return (
                        <div key={participant.id} className="flex items-center gap-3 group">
                            <Avatar 
                                initials={participant.initials} 
                                className={clsx(
                                    "size-9",
                                    participant.attendanceStatus === "accepted" && "bg-green-900/50 text-green-300",
                                    participant.attendanceStatus === "declined" && "bg-red-900/50 text-red-300",
                                    participant.attendanceStatus === "pending" && "bg-zinc-700 text-zinc-300"
                                )}
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-zinc-100 truncate block">
                                    {participant.name}
                                    {isCurrentUser && <span className="text-xs text-zinc-500 ml-1">(you)</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {canChangeAttendance && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateAttendance(participant.id, "accepted")}
                                            className={clsx(
                                                "p-1.5 rounded-full transition-colors",
                                                participant.attendanceStatus === "accepted"
                                                    ? "bg-green-600 text-white"
                                                    : "text-zinc-500 hover:text-green-400 hover:bg-zinc-700"
                                            )}
                                            title="Mark as attending"
                                        >
                                            <CheckIcon className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateAttendance(participant.id, "declined")}
                                            className={clsx(
                                                "p-1.5 rounded-full transition-colors",
                                                participant.attendanceStatus === "declined"
                                                    ? "bg-red-600 text-white"
                                                    : "text-zinc-500 hover:text-red-400 hover:bg-zinc-700"
                                            )}
                                            title="Mark as not attending"
                                        >
                                            <XIcon className="size-4" />
                                        </button>
                                    </>
                                )}
                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove(participant.id)}
                                        className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove from event"
                                    >
                                        <TrashIcon className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {participants.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No {title.toLowerCase()} yet</p>
            )}
        </div>
    );
}

// ==================== Helpers ====================

function getInitials(name: string): string {
    if (!name) return "??";
    const parts = name.split(" ").filter(Boolean);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "??";
}

function formatTimestamp(timestamp: Timestamp | undefined): string {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatEventDateTime(start: Date, end?: Date): string {
    const dateStr = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
    });
    const startTime = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
    const endTime = end?.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    return `${dateStr} ${startTime}${endTime ? ` – ${endTime}` : ""}`;
}

// ==================== Icons ====================

function BackIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
        </svg>
    );
}

function LocationIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
            <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="2.5" />
        </svg>
    );
}

function MapIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
            <path d="M3 7l6-3 6 3 6-3v14l-6 3-6-3-6 3V7z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 4v14M15 7v14" />
        </svg>
    );
}

function MoreIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
        </svg>
    );
}

function SendIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function NotesIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M9 9h1M9 13h6M9 17h6" strokeLinecap="round" />
        </svg>
    );
}

function FieldIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 4v16M2 12h20" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function GameIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 0 0 18" />
            <path d="M3.5 9h17M3.5 15h17" />
        </svg>
    );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <path d="M12 3L4 6v6c0 4.28 2.99 8.42 8 9.99 5.01-1.57 8-5.71 8-9.99V6z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TrashIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
    );
}
