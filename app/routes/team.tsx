import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { Route } from "./+types/team";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { Divider } from "../components/divider";
import { Input, InputGroup } from "../components/input";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "../components/dialog";
import { Select } from "../components/select";
import type { SVGProps } from "react";
import { Fragment, useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/auth-context";
import {
    subscribeToClubMembers,
    inviteClubMember,
    updateClubMember,
    removeClubMember,
    activateClubMember,
    generatePassword,
    type ClubMember,
    type MemberRole,
    type MemberSegment,
    type MemberStatus,
} from "../lib/firestore-team";

type IconProps = SVGProps<SVGSVGElement>;
type TeamRole = MemberRole;
type SortOption = "name" | "role" | "title" | "status";
type SortDirection = "asc" | "desc";

type TeamMember = {
    id: string;
    name: string;
    initials: string;
    role: TeamRole;
    title?: string | null;
    email?: string;
    segment?: MemberSegment;
    status: MemberStatus;
};

const roleOptions: TeamRole[] = ["User", "Staff", "Admin"];
const segmentOptions: { value: MemberSegment; label: string }[] = [
    { value: "player", label: "Player" },
    { value: "staff", label: "Staff Member" },
];

function clubMemberToTeamMember(member: ClubMember): TeamMember {
    return {
        id: member.id,
        name: member.name,
        initials: member.initials,
        role: member.role,
        title: member.title,
        email: member.email,
        segment: member.segment,
        status: member.status,
    };
}

function filterMembers(
    members: TeamMember[],
    query: string,
    roleFilter: TeamRole | "All" = "All",
    sortBy: SortOption = "name",
    sortDir: SortDirection = "asc"
) {
    let filtered = members;

    const normalized = query.trim().toLowerCase();
    if (normalized) {
        filtered = filtered.filter((member) => {
            const titleMatch = member.title ? member.title.toLowerCase().includes(normalized) : false;
            const emailMatch = member.email ? member.email.toLowerCase().includes(normalized) : false;
            return member.name.toLowerCase().includes(normalized) || titleMatch || emailMatch;
        });
    }

    if (roleFilter !== "All") {
        filtered = filtered.filter((member) => member.role === roleFilter);
    }

    filtered = [...filtered].sort((a, b) => {
        let aVal: string, bVal: string;

        if (sortBy === "name") {
            aVal = a.name;
            bVal = b.name;
        } else if (sortBy === "role") {
            aVal = a.role;
            bVal = b.role;
        } else if (sortBy === "status") {
            aVal = a.status;
            bVal = b.status;
        } else {
            aVal = a.title || "";
            bVal = b.title || "";
        }

        const comparison = aVal.localeCompare(bVal);
        return sortDir === "asc" ? comparison : -comparison;
    });

    return filtered;
}

function exportMembersToCSV(members: ClubMember[], clubName: string) {
    const headers = ["Name", "Email", "Role", "Title", "Segment", "Status"];
    const rows = members.map((m) => [
        m.name,
        m.email,
        m.role,
        m.title || "",
        m.segment,
        m.status,
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${clubName.replace(/\s+/g, "_")}_team_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Team · 360 Dashboard" },
        { name: "description", content: "Manage players, staff, and roles for your club." },
    ];
}

export default function Home() {
    const { activeClub } = useAuth();
    const [allMembers, setAllMembers] = useState<ClubMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<TeamRole | "All">("All");
    const [sortBy, setSortBy] = useState<SortOption>("status");
    const [sortDir, setSortDir] = useState<SortDirection>("asc");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteSegment, setInviteSegment] = useState<MemberSegment>("player");
    const [editMember, setEditMember] = useState<TeamMember | null>(null);
    const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
    const [activateMember, setActivateMember] = useState<TeamMember | null>(null);

    useEffect(() => {
        if (!activeClub?.id) {
            setAllMembers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToClubMembers(
            activeClub.id,
            (members) => {
                setAllMembers(members);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeClub?.id]);

    const playerMembers = useMemo(
        () => allMembers.filter((m) => m.segment === "player").map(clubMemberToTeamMember),
        [allMembers]
    );

    const staffMembers = useMemo(
        () => allMembers.filter((m) => m.segment === "staff").map(clubMemberToTeamMember),
        [allMembers]
    );

    const pendingCount = useMemo(
        () => allMembers.filter((m) => m.status === "invited").length,
        [allMembers]
    );

    const filteredPlayers = useMemo(
        () => filterMembers(playerMembers, query, roleFilter, sortBy, sortDir),
        [playerMembers, query, roleFilter, sortBy, sortDir]
    );

    const filteredStaff = useMemo(
        () => filterMembers(staffMembers, query, roleFilter, sortBy, sortDir),
        [staffMembers, query, roleFilter, sortBy, sortDir]
    );

    const handleSortChange = (newSortBy: SortOption) => {
        if (sortBy === newSortBy) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortDir("asc");
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleExport = useCallback(() => {
        if (activeClub && allMembers.length > 0) {
            exportMembersToCSV(allMembers, activeClub.name);
        }
    }, [activeClub, allMembers]);

    const handleOpenInviteModal = (segment: MemberSegment = "player") => {
        setInviteSegment(segment);
        setInviteModalOpen(true);
    };

    const handleEmailMember = (member: TeamMember) => {
        if (member.email) {
            window.location.href = `mailto:${member.email}`;
        }
    };

    if (!activeClub) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <div className="rounded-xl bg-zinc-800 p-4">
                        <UsersIcon className="size-8 text-zinc-500" />
                    </div>
                    <Heading level={2} className="mt-4 text-lg font-semibold text-white">
                        No club selected
                    </Heading>
                    <Text className="mt-2 text-sm text-zinc-400">
                        Select a club from the sidebar to view team members.
                    </Text>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <TeamHeader
                        selectedCount={0}
                        onClearSelection={clearSelection}
                        clubName={activeClub.name}
                        onExport={handleExport}
                        onInvite={() => handleOpenInviteModal()}
                        canExport={false}
                        pendingCount={0}
                    />
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner />
                            <Text className="text-sm text-zinc-400">Loading team members...</Text>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <TeamHeader
                        selectedCount={0}
                        onClearSelection={clearSelection}
                        clubName={activeClub.name}
                        onExport={handleExport}
                        onInvite={() => handleOpenInviteModal()}
                        canExport={false}
                        pendingCount={0}
                    />
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center">
                        <div className="rounded-xl bg-red-900/50 p-3">
                            <ExclamationCircleIcon className="size-6 text-red-400" />
                        </div>
                        <Heading level={2} className="mt-4 text-lg font-semibold text-white">
                            Unable to load team
                        </Heading>
                        <Text className="mt-2 text-sm text-red-400">{error}</Text>
                        <Button className="mt-4" onClick={() => window.location.reload()}>
                            Try again
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <TeamHeader
                    selectedCount={selectedIds.size}
                    onClearSelection={clearSelection}
                    clubName={activeClub.name}
                    onExport={handleExport}
                    onInvite={() => handleOpenInviteModal()}
                    canExport={allMembers.length > 0}
                    pendingCount={pendingCount}
                />
                <TeamControls
                    query={query}
                    onQueryChange={setQuery}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSortChange={handleSortChange}
                    summary={{ players: playerMembers.length, staff: staffMembers.length, pending: pendingCount }}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                    <TeamSection
                        label="Players"
                        members={filteredPlayers}
                        totalCount={playerMembers.length}
                        query={query}
                        emptyCta="Invite a player"
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                        onInvite={() => handleOpenInviteModal("player")}
                        onEditMember={setEditMember}
                        onDeleteMember={setDeleteMember}
                        onActivateMember={setActivateMember}
                        onEmailMember={handleEmailMember}
                    />
                    <TeamSection
                        label="Staff"
                        members={filteredStaff}
                        totalCount={staffMembers.length}
                        query={query}
                        emptyCta="Invite staff member"
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                        onInvite={() => handleOpenInviteModal("staff")}
                        onEditMember={setEditMember}
                        onDeleteMember={setDeleteMember}
                        onActivateMember={setActivateMember}
                        onEmailMember={handleEmailMember}
                    />
                </div>
            </div>

            <InviteMemberModal
                open={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                clubId={activeClub.id}
                defaultSegment={inviteSegment}
            />

            <EditMemberModal
                open={!!editMember}
                onClose={() => setEditMember(null)}
                clubId={activeClub.id}
                member={editMember}
            />

            <DeleteMemberModal
                open={!!deleteMember}
                onClose={() => setDeleteMember(null)}
                clubId={activeClub.id}
                member={deleteMember}
            />

            <ActivateMemberModal
                open={!!activateMember}
                onClose={() => setActivateMember(null)}
                clubId={activeClub.id}
                member={activateMember}
            />
        </DashboardLayout>
    );
}

function InviteMemberModal({
    open,
    onClose,
    clubId,
    defaultSegment,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    defaultSegment: MemberSegment;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<MemberRole>("User");
    const [segment, setSegment] = useState<MemberSegment>(defaultSegment);
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setSegment(defaultSegment);
            setName("");
            setEmail("");
            setRole("User");
            setTitle("");
            setError(null);
        }
    }, [open, defaultSegment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            setError("Name and email are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await inviteClubMember(clubId, {
                name: name.trim(),
                email: email.trim(),
                role,
                segment,
                title: title.trim() || undefined,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite member");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} size="md">
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team.</DialogDescription>

            <form onSubmit={handleSubmit}>
                <DialogBody className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Smith"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Member Type
                            </label>
                            <Select
                                value={segment}
                                onChange={(e) => setSegment(e.target.value as MemberSegment)}
                            >
                                {segmentOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Role
                            </label>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value as MemberRole)}
                            >
                                {roleOptions.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Title / Position
                        </label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={segment === "player" ? "e.g., Forward · U18" : "e.g., Head Coach"}
                        />
                        <Text className="mt-1 text-xs text-zinc-500">Optional</Text>
                    </div>
                </DialogBody>

                <DialogActions>
                    <Button plain onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" color="amber" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Invitation"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

function EditMemberModal({
    open,
    onClose,
    clubId,
    member,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    member: TeamMember | null;
}) {
    const [name, setName] = useState("");
    const [role, setRole] = useState<MemberRole>("User");
    const [segment, setSegment] = useState<MemberSegment>("player");
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && member) {
            setName(member.name);
            setRole(member.role);
            setSegment(member.segment || "player");
            setTitle(member.title || "");
            setError(null);
        }
    }, [open, member]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!member) return;

        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await updateClubMember(clubId, member.id, {
                name: name.trim(),
                role,
                segment,
                title: title.trim() || null,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update member");
        } finally {
            setSubmitting(false);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={open} onClose={onClose} size="md">
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update {member.name}'s profile information.</DialogDescription>

            <form onSubmit={handleSubmit}>
                <DialogBody className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Member Type
                            </label>
                            <Select
                                value={segment}
                                onChange={(e) => setSegment(e.target.value as MemberSegment)}
                            >
                                {segmentOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Role
                            </label>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value as MemberRole)}
                            >
                                {roleOptions.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Title / Position
                        </label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={segment === "player" ? "e.g., Forward · U18" : "e.g., Head Coach"}
                        />
                    </div>
                </DialogBody>

                <DialogActions>
                    <Button plain onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" color="amber" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

function DeleteMemberModal({
    open,
    onClose,
    clubId,
    member,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    member: TeamMember | null;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!member) return;

        setSubmitting(true);
        setError(null);

        try {
            await removeClubMember(clubId, member.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove member");
        } finally {
            setSubmitting(false);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={open} onClose={onClose} size="sm">
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
                Are you sure you want to remove <strong>{member.name}</strong> from the team? This action cannot be undone.
            </DialogDescription>

            <DialogBody>
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        {error}
                    </div>
                )}
            </DialogBody>

            <DialogActions>
                <Button plain onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button color="red" onClick={handleDelete} disabled={submitting}>
                    {submitting ? "Removing..." : "Remove Member"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ActivateMemberModal({
    open,
    onClose,
    clubId,
    member,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    member: TeamMember | null;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);

    useEffect(() => {
        if (open) {
            setError(null);
            setResult(null);
        }
    }, [open]);

    const handleActivate = async () => {
        if (!member) return;

        setSubmitting(true);
        setError(null);

        try {
            const password = generatePassword();
            const activationResult = await activateClubMember(clubId, member.id, password);
            setResult({
                email: activationResult.email,
                tempPassword: activationResult.tempPassword,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to activate member");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyCredentials = () => {
        if (result) {
            const text = `Email: ${result.email}\nTemporary Password: ${result.tempPassword}`;
            navigator.clipboard.writeText(text);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={open} onClose={onClose} size="md">
            <DialogTitle>Activate Team Member</DialogTitle>
            {!result ? (
                <>
                    <DialogDescription>
                        Activate <strong>{member.name}</strong> to give them full access to the team. 
                        A temporary password will be generated for their account.
                    </DialogDescription>

                    <DialogBody>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
                            <div className="flex gap-3">
                                <InfoIcon className="size-5 shrink-0 text-amber-500" />
                                <div className="text-sm text-amber-800 dark:text-amber-200">
                                    <p className="font-medium">What happens when you activate a member:</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700 dark:text-amber-300">
                                        <li>A user account will be created</li>
                                        <li>They will be added to the club membership</li>
                                        <li>You'll receive credentials to share with them</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </DialogBody>

                    <DialogActions>
                        <Button plain onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button color="amber" onClick={handleActivate} disabled={submitting}>
                            {submitting ? "Activating..." : "Activate Member"}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogDescription>
                        <strong>{member.name}</strong> has been activated! Share these credentials with them.
                    </DialogDescription>

                    <DialogBody>
                        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircleIcon className="size-5" />
                                <span className="font-medium">Account activated successfully!</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Login Credentials</p>
                            <div className="mt-3 space-y-2">
                                <div>
                                    <label className="text-xs text-zinc-500">Email</label>
                                    <p className="font-mono text-sm text-zinc-900 dark:text-white">{result.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Temporary Password</label>
                                    <p className="font-mono text-sm text-zinc-900 dark:text-white">{result.tempPassword}</p>
                                </div>
                            </div>
                            <Button plain className="mt-3 w-full" onClick={handleCopyCredentials}>
                                <ClipboardIcon data-slot="icon" />
                                Copy Credentials
                            </Button>
                        </div>

                        <p className="mt-3 text-xs text-zinc-500">
                            The user should change their password after first login.
                        </p>
                    </DialogBody>

                    <DialogActions>
                        <Button color="amber" onClick={onClose}>
                            Done
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}

function TeamHeader({
    selectedCount,
    onClearSelection,
    clubName,
    onExport,
    onInvite,
    canExport,
    pendingCount,
}: {
    selectedCount: number;
    onClearSelection: () => void;
    clubName?: string;
    onExport: () => void;
    onInvite: () => void;
    canExport: boolean;
    pendingCount: number;
}) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-500 p-2.5">
                    <UsersIcon className="size-6 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <Heading level={1} className="text-2xl font-bold">Team</Heading>
                        {pendingCount > 0 && (
                            <Badge color="yellow">{pendingCount} pending</Badge>
                        )}
                    </div>
                    <Text className="text-sm text-zinc-500">{clubName ?? "Select a club"}</Text>
                </div>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
                {selectedCount > 0 ? (
                    <>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5">
                            <span className="text-sm font-medium text-amber-600">{selectedCount} selected</span>
                            <button
                                onClick={onClearSelection}
                                className="rounded p-0.5 text-amber-600 hover:bg-amber-500/20"
                            >
                                <XIcon className="size-4" />
                            </button>
                        </div>
                        <Button outline className="text-red-600">
                            <TrashIcon data-slot="icon" />
                            Remove
                        </Button>
                        <Button outline>
                            <MailIcon data-slot="icon" />
                            Email
                        </Button>
                    </>
                ) : (
                    <>
                        <Button outline onClick={onExport} disabled={!canExport}>
                            <DownloadIcon data-slot="icon" />
                            Export
                        </Button>
                        <Button color="amber" onClick={onInvite}>
                            <PlusIcon data-slot="icon" />
                            Invite Member
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function TeamControls({
    query,
    onQueryChange,
    roleFilter,
    onRoleFilterChange,
    sortBy,
    sortDir,
    onSortChange,
    summary,
}: {
    query: string;
    onQueryChange: (value: string) => void;
    roleFilter: TeamRole | "All";
    onRoleFilterChange: (role: TeamRole | "All") => void;
    sortBy: SortOption;
    sortDir: SortDirection;
    onSortChange: (sort: SortOption) => void;
    summary: { players: number; staff: number; pending: number };
}) {
    return (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-wrap items-center gap-4">
                <InputGroup className="min-w-0 flex-1">
                    <SearchIcon data-slot="icon" className="text-zinc-500" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search by name, email, or title..."
                        className="bg-zinc-800 text-white placeholder:text-zinc-500"
                    />
                </InputGroup>
                <div className="flex gap-2 text-sm">
                    <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-zinc-300">
                        <span className="font-semibold text-white">{summary.players}</span> Players
                    </span>
                    <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-zinc-300">
                        <span className="font-semibold text-white">{summary.staff}</span> Staff
                    </span>
                    {summary.pending > 0 && (
                        <span className="rounded-lg bg-yellow-500/20 px-3 py-1.5 text-yellow-400">
                            <span className="font-semibold">{summary.pending}</span> Pending
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Filter</span>
                    <div className="flex gap-1">
                        <FilterChip label="All" active={roleFilter === "All"} onClick={() => onRoleFilterChange("All")} />
                        {roleOptions.map((role) => (
                            <FilterChip
                                key={role}
                                label={role}
                                active={roleFilter === role}
                                onClick={() => onRoleFilterChange(role)}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-4 w-px bg-zinc-700" />

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Sort</span>
                    <div className="flex gap-1">
                        <SortButton label="Status" active={sortBy === "status"} direction={sortBy === "status" ? sortDir : undefined} onClick={() => onSortChange("status")} />
                        <SortButton label="Name" active={sortBy === "name"} direction={sortBy === "name" ? sortDir : undefined} onClick={() => onSortChange("name")} />
                        <SortButton label="Role" active={sortBy === "role"} direction={sortBy === "role" ? sortDir : undefined} onClick={() => onSortChange("role")} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamSection({
    label,
    members,
    totalCount,
    query,
    emptyCta,
    selectedIds,
    onToggleSelection,
    onInvite,
    onEditMember,
    onDeleteMember,
    onActivateMember,
    onEmailMember,
}: {
    label: string;
    members: TeamMember[];
    totalCount: number;
    query: string;
    emptyCta: string;
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onInvite: () => void;
    onEditMember: (member: TeamMember) => void;
    onDeleteMember: (member: TeamMember) => void;
    onActivateMember: (member: TeamMember) => void;
    onEmailMember: (member: TeamMember) => void;
}) {
    const hasMembers = members.length > 0;
    const hasSearch = Boolean(query.trim());
    const pendingMembers = members.filter((m) => m.status === "invited");
    const activeMembers = members.filter((m) => m.status === "active");

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <div className="flex items-center gap-2">
                    <Subheading level={2} className="font-semibold text-white">{label}</Subheading>
                    <Badge color="zinc">{totalCount}</Badge>
                    {members.length !== totalCount && (
                        <Badge color="amber">{members.length} shown</Badge>
                    )}
                </div>
                <Button plain onClick={onInvite} className="text-sm text-amber-500 hover:text-amber-400">
                    <PlusIcon data-slot="icon" className="size-4" />
                    Add
                </Button>
            </div>

            <div className="p-4">
                {hasMembers ? (
                    <div className="space-y-4">
                        {pendingMembers.length > 0 && (
                            <div>
                                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-yellow-500">
                                    <ClockIcon className="size-3.5" />
                                    Pending Invitations ({pendingMembers.length})
                                </p>
                                <ul className="space-y-2">
                                    {pendingMembers.map((member) => (
                                        <TeamMemberCard
                                            key={`${label}-${member.id}`}
                                            member={member}
                                            sectionLabel={label}
                                            isSelected={selectedIds.has(`${label}-${member.id}`)}
                                            onToggleSelection={() => onToggleSelection(`${label}-${member.id}`)}
                                            onEdit={() => onEditMember(member)}
                                            onDelete={() => onDeleteMember(member)}
                                            onActivate={() => onActivateMember(member)}
                                            onEmail={() => onEmailMember(member)}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                        {activeMembers.length > 0 && (
                            <div>
                                {pendingMembers.length > 0 && (
                                    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-green-500">
                                        <CheckCircleIcon className="size-3.5" />
                                        Active Members ({activeMembers.length})
                                    </p>
                                )}
                                <ul className="space-y-2">
                                    {activeMembers.map((member) => (
                                        <TeamMemberCard
                                            key={`${label}-${member.id}`}
                                            member={member}
                                            sectionLabel={label}
                                            isSelected={selectedIds.has(`${label}-${member.id}`)}
                                            onToggleSelection={() => onToggleSelection(`${label}-${member.id}`)}
                                            onEdit={() => onEditMember(member)}
                                            onDelete={() => onDeleteMember(member)}
                                            onActivate={() => onActivateMember(member)}
                                            onEmail={() => onEmailMember(member)}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        heading={`No ${label.toLowerCase()} ${hasSearch ? "found" : "yet"}`}
                        description={
                            hasSearch
                                ? `No results for "${query}".`
                                : `Invite ${label.toLowerCase()} to build your roster.`
                        }
                        actionLabel={emptyCta}
                        onAction={onInvite}
                    />
                )}
            </div>
        </div>
    );
}

function TeamMemberCard({
    member,
    sectionLabel,
    isSelected,
    onToggleSelection,
    onEdit,
    onDelete,
    onActivate,
    onEmail,
}: {
    member: TeamMember;
    sectionLabel: string;
    isSelected: boolean;
    onToggleSelection: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onActivate: () => void;
    onEmail: () => void;
}) {
    const isPending = member.status === "invited";

    return (
        <li
            className={clsx(
                "group flex items-center gap-3 rounded-xl border p-3 transition-all",
                isPending
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : isSelected
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
            )}
        >
            <button
                onClick={onToggleSelection}
                className={clsx(
                    "flex size-5 shrink-0 items-center justify-center rounded border-2 transition",
                    isSelected
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-zinc-600 bg-transparent hover:border-zinc-500"
                )}
            >
                {isSelected && <CheckIcon className="size-3" />}
            </button>

            <Avatar initials={member.initials} alt={member.name} className="size-10 bg-zinc-700 text-white" />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">{member.name}</span>
                    <RoleBadge role={member.role} />
                    {isPending && <Badge color="yellow">Pending</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                    {member.title && <span className="truncate">{member.title}</span>}
                    {member.email && (
                        <span className="truncate opacity-60">{member.email}</span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {isPending && (
                    <Button
                        plain
                        onClick={onActivate}
                        className="text-xs text-green-500 hover:text-green-400"
                    >
                        <CheckCircleIcon data-slot="icon" className="size-4" />
                        Activate
                    </Button>
                )}
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                        title="Send email"
                        onClick={onEmail}
                    >
                        <MailIcon className="size-4" />
                    </button>
                    <button
                        className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                        title="Edit profile"
                        onClick={onEdit}
                    >
                        <PencilIcon className="size-4" />
                    </button>
                </div>
                <TeamMemberActions
                    member={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onActivate={onActivate}
                    onEmail={onEmail}
                />
            </div>
        </li>
    );
}

function RoleBadge({ role }: { role: TeamRole }) {
    const colors = {
        Admin: "amber",
        Staff: "zinc",
        User: "green",
    } as const;
    return <Badge color={colors[role]}>{role}</Badge>;
}

function TeamMemberActions({
    member,
    onEdit,
    onDelete,
    onActivate,
    onEmail,
}: {
    member: TeamMember;
    onEdit: () => void;
    onDelete: () => void;
    onActivate: () => void;
    onEmail: () => void;
}) {
    const isPending = member.status === "invited";

    return (
        <Menu as="div" className="relative">
            <MenuButton className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-white focus:outline-none">
                <EllipsisIcon className="size-4" />
                <span className="sr-only">Actions for {member.name}</span>
            </MenuButton>
            <Transition
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-in"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <MenuItems className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-xl border border-zinc-700 bg-zinc-800 p-1.5 shadow-xl focus:outline-none">
                    {isPending && (
                        <>
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={onActivate}
                                        className={clsx(
                                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-400 transition",
                                            active && "bg-green-500/10"
                                        )}
                                    >
                                        <CheckCircleIcon className="size-4" />
                                        Activate Member
                                    </button>
                                )}
                            </MenuItem>
                            <div className="my-1.5 h-px bg-zinc-700" />
                        </>
                    )}
                    <MenuItem>
                        {({ active }) => (
                            <button
                                onClick={onEdit}
                                className={clsx(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition",
                                    active && "bg-zinc-700 text-white"
                                )}
                            >
                                <PencilIcon className="size-4 text-zinc-500" />
                                Edit Profile
                            </button>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ active }) => (
                            <button
                                onClick={onEmail}
                                className={clsx(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition",
                                    active && "bg-zinc-700 text-white"
                                )}
                            >
                                <MailIcon className="size-4 text-zinc-500" />
                                Send Email
                            </button>
                        )}
                    </MenuItem>
                    <div className="my-1.5 h-px bg-zinc-700" />
                    <MenuItem>
                        {({ active }) => (
                            <button
                                onClick={onDelete}
                                className={clsx(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition",
                                    active && "bg-red-500/10"
                                )}
                            >
                                <TrashIcon className="size-4" />
                                Remove from Team
                            </button>
                        )}
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    );
}

function EmptyState({
    heading,
    description,
    actionLabel,
    onAction,
}: {
    heading: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}) {
    return (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 p-6 text-center">
            <div className="mx-auto w-fit rounded-lg bg-zinc-700 p-2">
                <UsersIcon className="size-5 text-zinc-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-white">{heading}</p>
            <p className="mt-1 text-xs text-zinc-500">{description}</p>
            <Button color="amber" className="mt-4" onClick={onAction}>
                <PlusIcon data-slot="icon" />
                {actionLabel}
            </Button>
        </div>
    );
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
        >
            {label}
        </button>
    );
}

function SortButton({
    label,
    active,
    direction,
    onClick,
}: {
    label: string;
    active: boolean;
    direction?: "asc" | "desc";
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
        >
            {label}
            {active && (
                <ChevronUpIcon className={clsx("size-3.5 transition", direction === "desc" && "rotate-180")} />
            )}
        </button>
    );
}

// Icons
function iconClasses(className?: string) {
    return ["size-5", className].filter(Boolean).join(" ");
}

function PlusIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" strokeLinecap="round" />
        </svg>
    );
}

function EllipsisIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
        </svg>
    );
}

function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="m4 20 4.5-1 9.5-9.5-3.5-3.5L5 15.5 4 20z" strokeLinejoin="round" />
            <path d="M14.5 5.5 18 9" />
        </svg>
    );
}

function MailIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

function CheckIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props} className={iconClasses(className)}>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CheckCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function XIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
    );
}

function TrashIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
    );
}

function ChevronUpIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props} className={iconClasses(className)}>
            <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="9" cy="7" r="3" />
            <path d="M3 20a6 6 0 0 1 12 0" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M21 20a4.5 4.5 0 0 0-6-4.24" />
        </svg>
    );
}

function ExclamationCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
    );
}

function DownloadIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M12 4v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
        </svg>
    );
}

function ClockIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function InfoIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
    );
}

function ClipboardIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    );
}

function LoadingSpinner() {
    return (
        <svg className="size-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}
