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
import type { SVGProps } from "react";
import { Fragment, useMemo, useState, useEffect } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type TeamRole = "User" | "Staff" | "Admin";
type SortOption = "name" | "role" | "title";
type SortDirection = "asc" | "desc";

type TeamMember = {
    id: number;
    name: string;
    initials: string;
    role: TeamRole;
    title?: string;
    email?: string;
};

const playerMembers: TeamMember[] = [
    {
        id: 1,
        name: "Malak Malak",
        initials: "MM",
        role: "User",
        title: "Forward · U18",
        email: "malak.malak@smt.com.jo",
    },
];

const staffMembers: TeamMember[] = [
    {
        id: 1,
        name: "Abdallah Kanash",
        initials: "AK",
        role: "Admin",
        title: "Head coach",
        email: "abdallah.kanash@smt.com.jo",
    },
    {
        id: 2,
        name: "Abdullah El Qutati",
        initials: "AE",
        role: "Staff",
        title: "Assistant coach",
        email: "abdullah.elqutati@smt.com.jo",
    },
    {
        id: 3,
        name: "Abedalaziz Al Bahrain",
        initials: "AA",
        role: "Staff",
        title: "Team coordinator",
        email: "abedalaziz.albahrain@smt.com.jo",
    },
    {
        id: 4,
        name: "Ahmad Aqrabawi",
        initials: "AA",
        role: "Staff",
        title: "Operations",
        email: "ahmad.aqrabawi@smt.com.jo",
    },
    {
        id: 5,
        name: "Bashar Abdulalleh",
        initials: "BA",
        role: "Admin",
        title: "Technical",
        email: "bashar.abdulalleh@smt.com.jo",
    },
    {
        id: 6,
        name: "Eslam Ahmed",
        initials: "EA",
        role: "Staff",
        title: "Medical",
        email: "eslam.ahmed@smt.com.jo",
    },
    {
        id: 7,
        name: "JKFC Jkfc",
        initials: "JJ",
        role: "Staff",
        title: "Media",
        email: "jkfc.media@smt.com.jo",
    },
    {
        id: 8,
        name: "Mahmoud Alnajadawi",
        initials: "MA",
        role: "Staff",
        title: "Logistics",
        email: "mahmoud.alnajadawi@smt.com.jo",
    },
];

const actionItems = [
    { label: "View profile", icon: UserIcon },
    { label: "Message", icon: ChatBubbleIcon },
    { label: "Edit profile", icon: PencilIcon },
    { label: "Send email", icon: MailIcon },
];

const roleOptions: TeamRole[] = ["User", "Staff", "Admin"];

function filterMembers(
    members: TeamMember[],
    query: string,
    roleFilter: TeamRole | "All" = "All",
    sortBy: SortOption = "name",
    sortDir: SortDirection = "asc"
) {
    let filtered = members;

    // Text search filter
    const normalized = query.trim().toLowerCase();
    if (normalized) {
        filtered = filtered.filter((member) => {
            const titleMatch = member.title ? member.title.toLowerCase().includes(normalized) : false;
            const emailMatch = member.email ? member.email.toLowerCase().includes(normalized) : false;
            return member.name.toLowerCase().includes(normalized) || titleMatch || emailMatch;
        });
    }

    // Role filter
    if (roleFilter !== "All") {
        filtered = filtered.filter((member) => member.role === roleFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
        let aVal: string, bVal: string;

        if (sortBy === "name") {
            aVal = a.name;
            bVal = b.name;
        } else if (sortBy === "role") {
            aVal = a.role;
            bVal = b.role;
        } else {
            aVal = a.title || "";
            bVal = b.title || "";
        }

        const comparison = aVal.localeCompare(bVal);
        return sortDir === "asc" ? comparison : -comparison;
    });

    return filtered;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Team · Jordan Knights Dashboard" },
        { name: "description", content: "Manage players, staff, and roles for Jordan Knights FC." },
    ];
}

export default function Home() {
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<TeamRole | "All">("All");
    const [sortBy, setSortBy] = useState<SortOption>("name");
    const [sortDir, setSortDir] = useState<SortDirection>("asc");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filteredPlayers = useMemo(
        () => filterMembers(playerMembers, query, roleFilter, sortBy, sortDir),
        [query, roleFilter, sortBy, sortDir]
    );

    const filteredStaff = useMemo(
        () => filterMembers(staffMembers, query, roleFilter, sortBy, sortDir),
        [query, roleFilter, sortBy, sortDir]
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

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <TeamHeader selectedCount={selectedIds.size} onClearSelection={clearSelection} />
                <TeamControls
                    query={query}
                    onQueryChange={setQuery}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSortChange={handleSortChange}
                    summary={{ players: playerMembers.length, staff: staffMembers.length }}
                />
                <div className="grid gap-6 xl:grid-cols-1">
                    <TeamSection
                        label="Players"
                        members={filteredPlayers}
                        totalCount={playerMembers.length}
                        query={query}
                        emptyCta="Invite a player"
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                    />
                    <TeamSection
                        label="Staff"
                        members={filteredStaff}
                        totalCount={staffMembers.length}
                        query={query}
                        emptyCta="Invite a staff member"
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

function TeamHeader({ selectedCount, onClearSelection }: { selectedCount: number; onClearSelection: () => void }) {
    return (
        <div className="flex flex-wrap items-start gap-4">
            <Button plain className="px-3 py-2 text-sm font-semibold text-zinc-600">
                <ChevronLeftIcon data-slot="icon" />
                Back
            </Button>
            <div className="space-y-1">
                <Heading level={1} className="text-3xl font-semibold">
                    Team
                </Heading>
                <Text className="text-sm text-zinc-500">Jordan Knights Football Club · Administrator</Text>
            </div>
            <div className="ml-auto flex flex-wrap gap-3">
                {selectedCount > 0 ? (
                    <>
                        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2">
                            <Text className="text-sm font-semibold text-blue-700">{selectedCount} selected</Text>
                            <button
                                onClick={onClearSelection}
                                className="text-blue-600 hover:text-blue-800 transition"
                                aria-label="Clear selection"
                            >
                                <XIcon className="size-4" />
                            </button>
                        </div>
                        <Button outline className="text-red-600 hover:bg-red-50 border-red-200">
                            <TrashIcon data-slot="icon" />
                            Remove
                        </Button>
                        <Button outline>
                            <MailIcon data-slot="icon" />
                            Email all
                        </Button>
                    </>
                ) : (
                    <>
                        <Button outline>Export</Button>
                        <Button color="blue">
                            <PlusIcon data-slot="icon" />
                            Invite team member
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
    summary: { players: number; staff: number };
}) {
    return (
        <section className="rounded-3xl border border-zinc-100 bg-white/70 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <InputGroup className="min-w-0 flex-1">
                    <SearchIcon data-slot="icon" className="text-zinc-400" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search players, staff, or roles"
                        aria-label="Search team members"
                    />
                </InputGroup>
                <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-600">
                    <StatPill label="Players" value={summary.players} />
                    <StatPill label="Staff" value={summary.staff} />
                    <StatPill label="Total" value={summary.players + summary.staff} />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Filter:</Text>
                    <div className="flex gap-2">
                        <FilterChip
                            label="All"
                            active={roleFilter === "All"}
                            onClick={() => onRoleFilterChange("All")}
                        />
                        {roleOptions.map((role) => (
                            <FilterChip
                                key={role}
                                label={role}
                                active={roleFilter === role}
                                onClick={() => onRoleFilterChange(role)}
                                color={role === "Admin" ? "blue" : role === "Staff" ? "zinc" : "green"}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-6 w-px bg-zinc-200" />

                <div className="flex items-center gap-2">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Sort:</Text>
                    <div className="flex gap-2">
                        <SortButton
                            label="Name"
                            active={sortBy === "name"}
                            direction={sortBy === "name" ? sortDir : undefined}
                            onClick={() => onSortChange("name")}
                        />
                        <SortButton
                            label="Role"
                            active={sortBy === "role"}
                            direction={sortBy === "role" ? sortDir : undefined}
                            onClick={() => onSortChange("role")}
                        />
                        <SortButton
                            label="Title"
                            active={sortBy === "title"}
                            direction={sortBy === "title" ? sortDir : undefined}
                            onClick={() => onSortChange("title")}
                        />
                    </div>
                </div>
            </div>
        </section>
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
}: {
    label: string;
    members: TeamMember[];
    totalCount: number;
    query: string;
    emptyCta: string;
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
}) {
    const hasMembers = members.length > 0;
    const hasSearch = Boolean(query.trim());

    return (
        <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-300">
            <div className="flex flex-wrap items-center gap-2">
                <Subheading level={2}>{label}</Subheading>
                <Badge color="zinc">{totalCount}</Badge>
                {members.length !== totalCount && (
                    <Badge color="blue">{members.length} shown</Badge>
                )}
            </div>
            <Divider className="my-5" />
            {hasMembers ? (
                <ul className="space-y-3">
                    {members.map((member, index) => (
                        <TeamMemberCard
                            key={`${label}-${member.id}`}
                            member={member}
                            sectionLabel={label}
                            isSelected={selectedIds.has(`${label}-${member.id}`)}
                            onToggleSelection={() => onToggleSelection(`${label}-${member.id}`)}
                            animationDelay={index * 30}
                        />
                    ))}
                </ul>
            ) : (
                <EmptyState
                    heading={`No ${label.toLowerCase()} ${hasSearch ? "match" : "added"}`}
                    description={
                        hasSearch
                            ? `"${query}" didn't match any ${label.toLowerCase()}. Try another name.`
                            : `Invite ${label.toLowerCase()} to keep rosters up to date.`
                    }
                    actionLabel={emptyCta}
                />
            )}
        </section>
    );
}

function TeamMemberCard({
    member,
    sectionLabel,
    isSelected,
    onToggleSelection,
    animationDelay,
}: {
    member: TeamMember;
    sectionLabel: string;
    isSelected: boolean;
    onToggleSelection: () => void;
    animationDelay: number;
}) {
    const [showQuickActions, setShowQuickActions] = useState(false);

    return (
        <li
            className={clsx(
                "group relative flex flex-wrap items-center gap-2 rounded-xl border p-2.5 shadow-sm transition-all duration-200",
                "",
                isSelected
                    ? "border-blue-300 bg-blue-50/50 shadow-md ring-2 ring-blue-200"
                    : "border-zinc-100 bg-white/70"
            )}
            style={{ animationDelay: `${animationDelay}ms` }}
            onMouseEnter={() => setShowQuickActions(true)}
            onMouseLeave={() => setShowQuickActions(false)}
        >
            {/* Selection checkbox */}
            <button
                onClick={onToggleSelection}
                className={clsx(
                    "flex size-4 items-center justify-center rounded border-2 transition-all duration-200",
                    isSelected
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-zinc-300 bg-white hover:border-blue-400"
                )}
                aria-label={`Select ${member.name}`}
            >
                {isSelected && <CheckIcon className="size-2.5" />}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <Avatar initials={member.initials} alt={member.name} className="size-8 bg-amber-100" />
                <div className="min-w-0 flex-1">
                    <Heading level={3} className="text-sm font-semibold dark:text-zinc-900">
                        {member.name}
                    </Heading>
                    {member.title && (
                        <Text className="text-xs text-zinc-500 flex items-center gap-1">
                            <BriefcaseIcon className="size-3" />
                            {member.title}
                        </Text>
                    )}
                    {member.email && (
                        <Text className="text-xs text-zinc-400 flex items-center gap-1">
                            <MailIcon className="size-2.5" />
                            {member.email}
                        </Text>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={member.role} />

                {/* Quick actions - shown on hover */}
                {showQuickActions && (
                    <div className="flex gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button
                            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            title="Message"
                        >
                            <ChatBubbleIcon className="size-3.5" />
                        </button>
                        <button
                            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            title="View profile"
                        >
                            <UserIcon className="size-3.5" />
                        </button>
                        <button
                            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            title="Send email"
                        >
                            <MailIcon className="size-3.5" />
                        </button>
                    </div>
                )}

                <TeamMemberActions role={member.role} name={member.name} />
            </div>
        </li>
    );
}

function RoleBadge({ role }: { role: TeamRole }) {
    const badgeColor = role === "Admin" ? "blue" : role === "Staff" ? "zinc" : "green";
    return <Badge color={badgeColor}>{role}</Badge>;
}

function TeamMemberActions({ role, name }: { role: TeamRole; name: string }) {
    return (
        <Menu as="div" className="relative z-50">
            <MenuButton className="rounded-2xl border border-zinc-200 p-2 text-zinc-600 transition hover:border-blue-200 hover:text-blue-600 focus:outline-hidden z-20">
                <EllipsisIcon className="size-5" />
                <span className="sr-only">Actions for {name}</span>
            </MenuButton>
            <Transition
                as={Fragment}
                enter="transition duration-150 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-100 ease-in"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <MenuItems className="absolute right-10 z-[99] mt-2 w-64 origin-top-right rounded-3xl border border-zinc-100 bg-white p-3 shadow-2xl focus:outline-none">
                    <div className="space-y-1">
                        {actionItems.map((action) => (
                            <MenuItem key={action.label}>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        className={clsx(
                                            "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-zinc-700",
                                            active && "bg-blue-50 text-blue-600"
                                        )}
                                    >
                                        <action.icon className="size-4" />
                                        {action.label}
                                    </button>
                                )}
                            </MenuItem>
                        ))}
                    </div>
                    <Divider className="my-3 border-dashed" />
                    <div className="rounded-2xl border border-zinc-100 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Role</p>
                        <div className="mt-3 space-y-2">
                            {roleOptions.map((option) => (
                                <div
                                    key={option}
                                    data-active={role === option}
                                    className={clsx(
                                        "flex items-center justify-between rounded-2xl border border-transparent px-3 py-2 text-sm font-medium text-zinc-600",
                                        role === option && "border-blue-200 bg-blue-50 text-blue-600"
                                    )}
                                >
                                    <span>{option}</span>
                                    <span
                                        className={clsx(
                                            "size-4 rounded-full border",
                                            role === option ? "border-blue-500 bg-blue-500" : "border-zinc-300"
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <button type="button" className="w-full rounded-2xl px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                            Set title
                        </button>
                        <button type="button" className="w-full rounded-2xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                            Remove user from group
                        </button>
                        <button type="button" className="w-full rounded-2xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                            Block
                        </button>
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );
}

function EmptyState({ heading, description, actionLabel }: { heading: string; description: string; actionLabel: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 p-8 text-center">
            <Heading level={3} className="text-lg font-semibold text-zinc-900">
                {heading}
            </Heading>
            <Text className="mt-2 text-sm text-zinc-500">{description}</Text>
            <Button color="blue" className="mt-6">
                {actionLabel}
            </Button>
        </div>
    );
}

function StatPill({ label, value }: { label: string; value: number }) {
    return (
        <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:shadow-sm">
            {label} · {value}
        </span>
    );
}

function FilterChip({
    label,
    active,
    onClick,
    color = "zinc",
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    color?: "zinc" | "blue" | "green";
}) {
    const colorClasses = {
        zinc: active
            ? "border-zinc-300 bg-zinc-100 text-zinc-900 ring-2 ring-zinc-200"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
        blue: active
            ? "border-blue-300 bg-blue-100 text-blue-900 ring-2 ring-blue-200"
            : "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300",
        green: active
            ? "border-green-300 bg-green-100 text-green-900 ring-2 ring-green-200"
            : "border-green-200 bg-green-50 text-green-600 hover:border-green-300",
    };

    return (
        <button
            onClick={onClick}
            className={clsx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                colorClasses[color]
            )}
            aria-pressed={active}
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
                "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                active
                    ? "border-blue-300 bg-blue-100 text-blue-900 ring-2 ring-blue-200"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            )}
            aria-pressed={active}
        >
            {label}
            {active && (
                <span className="transition-transform duration-200" style={{ transform: direction === "desc" ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <ChevronUpIcon className="size-3.5" />
                </span>
            )}
        </button>
    );
}

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

function PlusIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" strokeLinecap="round" />
        </svg>
    );
}

function EllipsisIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
            <circle cx="5" cy="12" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="19" cy="12" r="1.4" />
        </svg>
    );
}

function UserIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="9" r="3.5" />
            <path d="M6 20a6 6 0 0 1 12 0" strokeLinecap="round" />
        </svg>
    );
}

function ChatBubbleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M5 7c0-1.657 1.79-3 4-3h6c2.21 0 4 1.343 4 3v5c0 1.657-1.79 3-4 3h-1.5L12 20l-1.5-5H9c-2.21 0-4-1.343-4-3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="m4 20 4.5-1 9.5-9.5-3.5-3.5L5 15.5 4 20z" strokeLinejoin="round" />
            <path d="M14.5 5.5 18 9" />
        </svg>
    );
}

function MailIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

function CheckIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props} className={iconClasses(className)}>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
    );
}

function ChevronUpIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
            <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BriefcaseIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
