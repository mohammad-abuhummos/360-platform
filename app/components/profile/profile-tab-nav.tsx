import { Link, useLocation } from "react-router";
import clsx from "clsx";

export type ProfileTabId =
    | "overview"
    | "payments"
    | "registrations"
    | "development"
    | "calendar"
    | "attendance"
    | "video"
    | "notes";

export const PROFILE_TABS: { id: ProfileTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "payments", label: "Payments" },
    { id: "registrations", label: "Registrations" },
    { id: "development", label: "Development" },
    { id: "calendar", label: "Calendar" },
    { id: "attendance", label: "Attendance" },
    { id: "video", label: "Video" },
    { id: "notes", label: "Notes" },
];

type ProfileTabNavProps = {
    memberId: string;
    activeTab: ProfileTabId;
    visibleTabs?: ProfileTabId[];
};

export function ProfileTabNav({
    memberId,
    activeTab,
    visibleTabs = PROFILE_TABS.map((t) => t.id),
}: ProfileTabNavProps) {
    const tabs = PROFILE_TABS.filter((t) => visibleTabs.includes(t.id));

    return (
        <div className="border-b border-zinc-700">
            <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Profile tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const href = `/team/${memberId}?tab=${tab.id}`;
                    return (
                        <Link
                            key={tab.id}
                            to={href}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-3 text-sm font-medium transition",
                                isActive
                                    ? "border-amber-500 text-amber-500"
                                    : "border-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function useProfileTab(): ProfileTabId {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as ProfileTabId | null;
    const valid = PROFILE_TABS.some((t) => t.id === tab);
    return valid ? tab! : "overview";
}
