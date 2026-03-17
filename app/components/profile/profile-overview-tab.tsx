import { Subheading } from "../heading";
import { Text } from "../text";
import { Button } from "../button";
import { Badge } from "../badge";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeader,
    TableCell,
} from "../table";
import { DocumentTextIcon, UserGroupIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

type ProfileOverviewTabProps = {
    memberId: string;
    memberEmail?: string;
    isPlayer: boolean;
};

export function ProfileOverviewTab({ memberId, memberEmail, isPlayer }: ProfileOverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Payments preview */}
            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <Subheading level={3} className="text-sm font-semibold text-white">
                        Payments
                    </Subheading>
                    <Button plain className="!p-1 text-sm text-amber-500">
                        View all
                    </Button>
                </div>
                <div className="flex gap-2">
                    <TabChip label="Invoices" active />
                    <TabChip label="Subscriptions" />
                    <TabChip label="Products" />
                </div>
                <EmptyState
                    icon={<DocumentTextIcon className="size-10 text-zinc-500" />}
                    message="No invoices found"
                />
            </section>

            {/* Groups - player only */}
            {isPlayer && (
                <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <Subheading level={3} className="text-sm font-semibold text-white">
                            Groups
                        </Subheading>
                        <Button plain className="!p-1 text-sm text-amber-500">
                            View all
                        </Button>
                    </div>
                    <EmptyState
                        icon={<UserGroupIcon className="size-10 text-zinc-500" />}
                        message="No groups assigned"
                    />
                </section>
            )}

            {/* Registrations */}
            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <Subheading level={3} className="text-sm font-semibold text-white">
                        Registrations
                    </Subheading>
                    <Button plain className="!p-1 text-sm text-amber-500">
                        View all
                    </Button>
                </div>
                <EmptyState
                    icon={<DocumentTextIcon className="size-10 text-zinc-500" />}
                    message="No registration submissions"
                />
            </section>

            {/* Season Attendance - player only */}
            {isPlayer && (
                <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                        Season Attendance
                    </Subheading>
                    <div className="grid grid-cols-4 gap-4">
                        <StatCard label="Games" value="0" />
                        <StatCard label="Practices" value="0" />
                        <StatCard label="Attendance %" value="—" />
                    </div>
                </section>
            )}

            {/* Tagged videos - player only */}
            {isPlayer && (
                <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                        Tagged videos
                    </Subheading>
                    <EmptyState
                        icon={<VideoCameraIcon className="size-10 text-zinc-500" />}
                        message="No tagged videos"
                    />
                </section>
            )}

            {/* Physical strain - player only */}
            {isPlayer && (
                <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                    <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                        Physical strain
                    </Subheading>
                    <div className="h-2 rounded-full bg-zinc-700">
                        <div className="h-full w-0 rounded-full bg-amber-500" />
                    </div>
                    <Text className="mt-2 text-xs text-zinc-500">No data available</Text>
                </section>
            )}
        </div>
    );
}

function TabChip({ label, active }: { label: string; active?: boolean }) {
    return (
        <button
            className={`
                rounded-lg px-3 py-1.5 text-sm font-medium transition
                ${active ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"}
            `}
        >
            {label}
        </button>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-zinc-800 p-3">
            <Text className="text-xs text-zinc-500">{label}</Text>
            <p className="mt-1 text-lg font-semibold text-white">{value}</p>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            {icon}
            <Text className="mt-2 text-sm text-zinc-500">{message}</Text>
        </div>
    );
}
