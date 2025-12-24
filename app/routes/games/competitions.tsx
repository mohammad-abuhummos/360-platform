import { useEffect, useState, Fragment } from "react";
import type { SVGProps } from "react";
import clsx from "clsx";
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Timestamp } from "firebase/firestore";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input, InputGroup } from "../../components/input";
import { Textarea } from "../../components/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToCompetitions,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    type Competition,
    type GameFormat,
    gameFormatLabels,
} from "~/lib/firestore-games";

type IconProps = SVGProps<SVGSVGElement>;

export function meta() {
    return [
        { title: "Competitions · Dashboard" },
        { name: "description", content: "Manage your competitions" },
    ];
}

export default function CompetitionsPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "";

    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);

    // Subscribe to competitions
    useEffect(() => {
        if (!clubId) return;

        setLoading(true);
        const unsubscribe = subscribeToCompetitions(
            clubId,
            (data) => {
                setCompetitions(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching competitions:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [clubId]);

    // Filter competitions
    const filteredCompetitions = competitions.filter((comp) =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (competition: Competition) => {
        if (!confirm(`Are you sure you want to delete "${competition.name}"?`)) return;
        
        try {
            await deleteCompetition(clubId, competition.id);
        } catch (error) {
            console.error("Error deleting competition:", error);
        }
    };

    return (
        <DashboardLayout>
            <div className="dark min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950 text-zinc-100">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4">
                    <Button plain className="p-2 text-zinc-600 hover:bg-zinc-800 rounded-lg">
                        <ChevronLeftIcon className="size-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <TrophyIcon className="size-6 text-zinc-600" />
                        <Heading level={1} className="text-2xl font-semibold">
                            Game Competitions
                        </Heading>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <Button outline className="gap-2">
                            <FilterIcon className="size-4" />
                            Filter
                        </Button>
                        <Button color="blue" onClick={() => setShowCreateDialog(true)}>
                            <PlusIcon className="size-4" />
                            Create new
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <InputGroup className="max-w-md">
                    <SearchIcon data-slot="icon" className="text-zinc-400" />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                    />
                </InputGroup>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Title</TableHeader>
                                    <TableHeader>Created in</TableHeader>
                                    <TableHeader>Description</TableHeader>
                                    <TableHeader>Format</TableHeader>
                                    <TableHeader>Start date</TableHeader>
                                    <TableHeader>End Date</TableHeader>
                                    <TableHeader className="w-12"></TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCompetitions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                <NoDataIcon className="size-12 mb-2" />
                                                <span className="text-sm">No competitions found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCompetitions.map((competition) => (
                                        <TableRow key={competition.id}>
                                            <TableCell className="font-medium">{competition.name}</TableCell>
                                            <TableCell>{activeClub?.name || "-"}</TableCell>
                                            <TableCell>
                                                <span className="line-clamp-1">{competition.description || "-"}</span>
                                            </TableCell>
                                            <TableCell>{competition.format ? gameFormatLabels[competition.format] : "-"}</TableCell>
                                            <TableCell>
                                                {competition.startDate 
                                                    ? formatDate(competition.startDate.toDate()) 
                                                    : "1/1/1970"}
                                            </TableCell>
                                            <TableCell>
                                                {competition.endDate 
                                                    ? formatDate(competition.endDate.toDate()) 
                                                    : "1/1/1970"}
                                            </TableCell>
                                            <TableCell>
                                                <Menu as="div" className="relative">
                                                    <MenuButton className="p-1 rounded hover:bg-zinc-800">
                                                        <MoreIcon className="size-5 text-zinc-400" />
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
                                                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-zinc-900 border border-zinc-700 py-1 shadow-lg focus:outline-none">
                                                            <MenuItem>
                                                                {({ focus }) => (
                                                                    <button
                                                                        onClick={() => setEditingCompetition(competition)}
                                                                        className={clsx(
                                                                            "block w-full px-4 py-2 text-left text-sm",
                                                                            focus ? "bg-zinc-800" : ""
                                                                        )}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </MenuItem>
                                                            <MenuItem>
                                                                {({ focus }) => (
                                                                    <button
                                                                        onClick={() => handleDelete(competition)}
                                                                        className={clsx(
                                                                            "block w-full px-4 py-2 text-left text-sm text-red-600",
                                                                            focus ? "bg-zinc-800" : ""
                                                                        )}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </MenuItem>
                                                        </MenuItems>
                                                    </Transition>
                                                </Menu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination info */}
                <div className="text-sm text-zinc-500">
                    Showing <span className="font-medium text-zinc-100">1</span> to{" "}
                    <span className="font-medium text-zinc-100">{filteredCompetitions.length}</span>
                    <br />
                    <span className="text-zinc-400">of {filteredCompetitions.length} results</span>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <CompetitionDialog
                open={showCreateDialog || editingCompetition !== null}
                onClose={() => {
                    setShowCreateDialog(false);
                    setEditingCompetition(null);
                }}
                clubId={clubId}
                competition={editingCompetition}
            />
            </div>
        </DashboardLayout>
    );
}

// Competition Dialog Component
function CompetitionDialog({
    open,
    onClose,
    clubId,
    competition,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    competition: Competition | null;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [format, setFormat] = useState<GameFormat | "">("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [saving, setSaving] = useState(false);

    // Reset form when competition changes
    useEffect(() => {
        if (competition) {
            setName(competition.name);
            setDescription(competition.description || "");
            setFormat(competition.format || "");
            setStartDate(competition.startDate ? formatDateInput(competition.startDate.toDate()) : "");
            setEndDate(competition.endDate ? formatDateInput(competition.endDate.toDate()) : "");
        } else {
            setName("");
            setDescription("");
            setFormat("");
            setStartDate(formatDateInput(new Date()));
            setEndDate(formatDateInput(new Date()));
        }
    }, [competition, open]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            const data = {
                name: name.trim(),
                description: description.trim() || undefined,
                format: format || undefined,
                startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : undefined,
                endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : undefined,
            };

            if (competition) {
                await updateCompetition(clubId, competition.id, data);
            } else {
                await createCompetition(clubId, data);
            }
            onClose();
        } catch (error) {
            console.error("Error saving competition:", error);
        } finally {
            setSaving(false);
        }
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
                    <div className="fixed inset-0 bg-black/25" />
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
                                <div className="flex items-center justify-between mb-6">
                                    <DialogTitle className="text-lg font-semibold text-zinc-100">
                                        {competition ? "Edit competition" : "New competition"}
                                    </DialogTitle>
                                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
                                        <CloseIcon className="size-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Competition name
                                        </label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Description <span className="text-zinc-400">Optional</span>
                                        </label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300">
                                                Competition start
                                            </label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300">
                                                Competition end
                                            </label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Format <span className="text-zinc-400">Optional</span>
                                        </label>
                                        <select
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value as GameFormat | "")}
                                            className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Select format</option>
                                            {Object.entries(gameFormatLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Competition image <span className="text-zinc-400">Optional</span>
                                        </label>
                                        <button className="mt-1 w-full border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
                                            <ImageIcon className="size-6 mx-auto text-zinc-400 mb-2" />
                                            <span className="text-sm text-blue-600">Add image</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button outline onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="blue" onClick={handleSubmit} disabled={saving || !name.trim()}>
                                        {saving ? "Saving..." : "Continue"}
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

// Helper functions
function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateInput(date: Date): string {
    return date.toISOString().split("T")[0];
}

// Icons
function ChevronLeftIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TrophyIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}

function PlusIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function FilterIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
    );
}

function MoreIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
        </svg>
    );
}

function CloseIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ImageIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

function NoDataIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h3" strokeLinecap="round" />
        </svg>
    );
}

