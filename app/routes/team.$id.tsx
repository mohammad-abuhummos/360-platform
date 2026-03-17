import { Link, useParams } from "react-router";
import type { Route } from "./+types/team.$id";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { useAuth } from "../context/auth-context";
import { useState, useEffect } from "react";
import { getClubMemberById } from "../lib/firestore-team";
import type { ClubMember } from "../lib/firestore-team";
import { ProfileSidebarCard } from "../components/profile/profile-sidebar-card";
import {
    ProfileTabNav,
    useProfileTab,
    type ProfileTabId,
} from "../components/profile/profile-tab-nav";
import { ProfileOverviewTab } from "../components/profile/profile-overview-tab";
import { ProfilePaymentsTab } from "../components/profile/profile-payments-tab";
import { ProfileRegistrationsTab } from "../components/profile/profile-registrations-tab";
import { ProfileDevelopmentTab } from "../components/profile/profile-development-tab";
import { ProfileCalendarTab } from "../components/profile/profile-calendar-tab";
import { ProfileAttendanceTab } from "../components/profile/profile-attendance-tab";
import { ProfileVideoTab } from "../components/profile/profile-video-tab";
import { ProfileNotesTab } from "../components/profile/profile-notes-tab";
export function meta({ params }: Route.MetaArgs) {
    return [
        { title: `Profile · Team · 360 Dashboard` },
        { name: "description", content: "View team member profile." },
    ];
}

export default function TeamProfileView() {
    const { id } = useParams<{ id: string }>();
    const { activeClub } = useAuth();
    const tab = useProfileTab();

    const [member, setMember] = useState<ClubMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeClub?.id || !id) return;
        setLoading(true);
        setError(null);
        getClubMemberById(activeClub.id, id)
            .then(setMember)
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load profile");
                setMember(null);
            })
            .finally(() => setLoading(false));
    }, [activeClub?.id, id]);

    if (!activeClub) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <Heading level={2} className="text-lg font-semibold text-white">
                        No club selected
                    </Heading>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <svg
                            className="size-8 animate-spin text-amber-500"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <Text className="text-sm text-zinc-400">Loading profile...</Text>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !member) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center">
                    <Heading level={2} className="text-lg font-semibold text-white">
                        {error || "Profile not found"}
                    </Heading>
                    <Link to="/team">
                        <Text className="mt-4 text-amber-500 hover:text-amber-400">Back to Team</Text>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const isPlayer = member.segment === "player";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/team"
                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            aria-label="Back to team"
                        >
                            <svg
                                className="size-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </Link>
                        <div>
                            <Heading level={1} className="text-2xl font-bold text-white">
                                Profile
                            </Heading>
                            <Text className="text-sm text-zinc-500">{activeClub.name}</Text>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Optional: Add, notification, etc. */}
                    </div>
                </div>

                {/* Tabs */}
                <ProfileTabNav memberId={member.id} activeTab={tab} />

                {/* Two-column layout */}
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Left sidebar */}
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <ProfileSidebarCard member={member} clubId={activeClub.id} />
                    </aside>

                    {/* Right content */}
                    <main className="min-w-0">
                        {tab === "overview" && (
                            <ProfileOverviewTab
                                memberId={member.id}
                                memberEmail={member.email}
                                isPlayer={isPlayer}
                            />
                        )}
                        {tab === "payments" && (
                            <ProfilePaymentsTab
                                memberId={member.id}
                                memberName={member.name}
                                memberEmail={member.email}
                                clubId={activeClub.id}
                            />
                        )}
                        {tab === "registrations" && (
                            <ProfileRegistrationsTab memberId={member.id} />
                        )}
                        {tab === "development" && (
                            <ProfileDevelopmentTab
                                memberId={member.id}
                                isPlayer={isPlayer}
                            />
                        )}
                        {tab === "calendar" && (
                            <ProfileCalendarTab memberId={member.id} />
                        )}
                        {tab === "attendance" && (
                            <ProfileAttendanceTab
                                memberId={member.id}
                                isPlayer={isPlayer}
                            />
                        )}
                        {tab === "video" && (
                            <ProfileVideoTab
                                memberId={member.id}
                                isPlayer={isPlayer}
                            />
                        )}
                        {tab === "notes" && (
                            <ProfileNotesTab memberId={member.id} />
                        )}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
