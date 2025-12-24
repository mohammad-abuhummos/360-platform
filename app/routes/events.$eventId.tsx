import { useEffect, useState, type SVGProps } from "react";
import { useParams, useNavigate, Link } from "react-router";
import type { Route } from "./+types/events.$eventId";
import clsx from "clsx";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Avatar } from "../components/avatar";
import { useAuth } from "~/context/auth-context";
import {
    getEvent,
    subscribeToComments,
    addComment,
    updateAttendance,
    type CalendarEvent,
    type EventComment,
    type EventParticipant,
    type AttendanceStatus,
    eventTypeConfig,
    isGameEvent,
} from "~/lib/firestore-events";
import { Timestamp } from "firebase/firestore";

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
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"event" | "session" | "notes">("event");

    useEffect(() => {
        if (!activeClub?.id || !eventId) return;

        const loadEvent = async () => {
            setLoading(true);
            const eventData = await getEvent(activeClub.id, eventId);
            setEvent(eventData);
            setLoading(false);
        };

        void loadEvent();

        const unsubscribe = subscribeToComments(activeClub.id, eventId, setComments);
        return () => unsubscribe();
    }, [activeClub?.id, eventId]);

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

    const handleUpdateAttendance = async (participantId: string, status: AttendanceStatus, isOrganizer: boolean) => {
        if (!activeClub?.id || !eventId) return;
        await updateAttendance(activeClub.id, eventId, participantId, status, isOrganizer);
        // Refresh event
        const eventData = await getEvent(activeClub.id, eventId);
        setEvent(eventData);
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
        (p) => p.id === profile?.id
    );
    const userAttendanceStatus = currentUserParticipant?.attendanceStatus;

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

                {/* Tabs */}
                <div className="flex gap-6 border-b border-zinc-700">
                    {(["event", "session", "notes"] as const).map((tab) => (
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
                            />
                        )}
                        {activeTab === "session" && (
                            <SessionTabContent event={event} />
                        )}
                        {activeTab === "notes" && (
                            <NotesTabContent />
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-zinc-700 pt-6">
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
                                        placeholder="Comment"
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
                                        className="p-2 text-blue-400 hover:text-blue-300"
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
                                            <div>
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
                        {/* Organizers */}
                        <ParticipantsList
                            title="Organizers"
                            participants={event.organizers}
                            onUpdateAttendance={(id, status) => handleUpdateAttendance(id, status, true)}
                        />

                        {/* Participants */}
                        <ParticipantsList
                            title="Participants"
                            participants={event.participants}
                            onUpdateAttendance={(id, status) => handleUpdateAttendance(id, status, false)}
                        />

                        {/* Saved info */}
                        <div className="text-xs text-zinc-500">
                            Saved {formatTimestamp(event.updatedAt)} by {event.createdByName}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
}

function EventTabContent({
    event,
    typeConfig,
    userAttendanceStatus,
}: {
    event: CalendarEvent;
    typeConfig: { label: string; color: string; dotColor: string };
    userAttendanceStatus?: AttendanceStatus;
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
                        {event.type === "practice" && (
                            <span className="text-sm text-zinc-500">Practice</span>
                        )}
                    </div>
                    <Heading level={2} className="text-2xl font-semibold text-zinc-100">
                        {event.title}
                    </Heading>

                    {userAttendanceStatus && (
                        <div className="flex items-center gap-2">
                            <Avatar initials="SD" className="size-7 bg-amber-900/50 text-amber-300" />
                            <span className={clsx(
                                "text-sm font-medium",
                                userAttendanceStatus === "accepted" && "text-green-400",
                                userAttendanceStatus === "declined" && "text-red-400",
                                userAttendanceStatus === "pending" && "text-yellow-400"
                            )}>
                                {userAttendanceStatus === "accepted" && "You attended"}
                                {userAttendanceStatus === "declined" && "You declined"}
                                {userAttendanceStatus === "pending" && "Pending response"}
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
                    <Button outline className="ml-2 text-xs text-blue-400 border-zinc-700 hover:bg-zinc-800">
                        <MapIcon className="size-4" />
                        Search on Google Maps
                    </Button>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                    <Avatar initials={getInitials(event.createdByName)} className="size-5 bg-zinc-700 text-zinc-300" />
                    <span>
                        Created by{" "}
                        <Link to="#" className="text-blue-400 hover:underline">
                            {event.createdByName}
                        </Link>
                    </span>
                </div>
            </div>

            {/* Physical Strain */}
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-medium text-zinc-100">Physical strain</h3>
                        <p className="text-xs text-zinc-500">Show or update physical strain</p>
                    </div>
                    <div className="flex gap-2">
                        <Button outline className="text-xs text-zinc-300 border-zinc-700 hover:bg-zinc-700">Edit</Button>
                        <Button outline className="text-xs text-zinc-300 border-zinc-700 hover:bg-zinc-700">View all</Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Team avg.</span>
                        <span className={clsx(
                            "font-medium",
                            event.physicalStrain < 30 && "text-green-400",
                            event.physicalStrain >= 30 && event.physicalStrain < 60 && "text-yellow-400",
                            event.physicalStrain >= 60 && "text-red-400"
                        )}>
                            {event.physicalStrain < 30 && "Low"}
                            {event.physicalStrain >= 30 && event.physicalStrain < 60 && "Moderate"}
                            {event.physicalStrain >= 60 && "High"}
                            {" "}({event.attendanceStats.accepted})
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
                <GameDetailsSection gameDetails={event.gameDetails} />
            )}

            {/* Session */}
            <div className="space-y-3">
                <h3 className="font-medium text-zinc-100 flex items-center gap-2">
                    <ClipboardIcon className="size-5 text-zinc-400" />
                    Session
                </h3>
                {event.session ? (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                        <p className="font-medium text-zinc-100">{event.session.name}</p>
                        {event.session.description && (
                            <p className="text-sm text-zinc-400 mt-1">{event.session.description}</p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-900/30">
                                <ClipboardIcon className="size-5 text-amber-400" />
                            </div>
                            <span className="text-sm text-zinc-400">No session added yet</span>
                        </div>
                        <Button outline className="text-sm text-blue-400 border-zinc-700 hover:bg-zinc-800">
                            <PlusIcon className="size-4" />
                            Add session
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SessionTabContent({ event }: { event: CalendarEvent }) {
    if (!event.session) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardIcon className="size-12 text-zinc-600 mb-4" />
                <p className="text-zinc-400">No session has been added to this event</p>
                <Button className="mt-4">
                    <PlusIcon className="size-4" />
                    Add Session
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-zinc-100">{event.session.name}</h3>
            {event.session.description && (
                <p className="text-zinc-400">{event.session.description}</p>
            )}
            {event.session.drills && event.session.drills.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-300">Drills</h4>
                    <ul className="list-disc list-inside text-sm text-zinc-400">
                        {event.session.drills.map((drill, index) => (
                            <li key={index}>{drill}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function NotesTabContent() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <NotesIcon className="size-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No notes have been added yet</p>
            <Button className="mt-4">
                <PlusIcon className="size-4" />
                Add Note
            </Button>
        </div>
    );
}

function GameDetailsSection({ gameDetails }: { gameDetails: NonNullable<CalendarEvent["gameDetails"]> }) {
    return (
        <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <h3 className="font-medium text-zinc-100 flex items-center gap-2">
                <GameIcon className="size-5 text-zinc-400" />
                Game Details
            </h3>

            {/* Teams */}
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
                    <span className="text-xl font-bold text-zinc-600">vs</span>
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
        </div>
    );
}

function ParticipantsList({
    title,
    participants,
    onUpdateAttendance,
}: {
    title: string;
    participants: EventParticipant[];
    onUpdateAttendance: (id: string, status: AttendanceStatus) => void;
}) {
    const attended = participants.filter((p) => p.attendanceStatus === "accepted");

    return (
        <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">
                    {title} ({participants.length})
                </h3>
                <Button plain className="text-sm text-blue-400 hover:text-blue-300">
                    <PlusIcon className="size-4" />
                    Add
                </Button>
            </div>

            {attended.length > 0 && (
                <p className="text-sm text-green-400">Attended ({attended.length})</p>
            )}

            <div className="space-y-2">
                {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                        <Avatar initials={participant.initials} className="size-9 bg-zinc-700 text-zinc-300" />
                        <span className="flex-1 text-sm font-medium text-zinc-100">
                            {participant.name}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onUpdateAttendance(participant.id, "accepted")}
                                className={clsx(
                                    "p-1 rounded-full transition-colors",
                                    participant.attendanceStatus === "accepted"
                                        ? "bg-green-900/50 text-green-400"
                                        : "text-zinc-500 hover:text-green-400"
                                )}
                            >
                                <CheckIcon className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onUpdateAttendance(participant.id, "declined")}
                                className={clsx(
                                    "p-1 rounded-full transition-colors",
                                    participant.attendanceStatus === "declined"
                                        ? "bg-red-900/50 text-red-400"
                                        : "text-zinc-500 hover:text-red-400"
                                )}
                            >
                                <XIcon className="size-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
        month: "numeric",
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

function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <path d="M9 4h6M9 7h6" strokeLinecap="round" />
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M8 12h8M8 16h5" />
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

