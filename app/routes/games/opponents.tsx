import { useEffect, useState, Fragment } from "react";
import type { SVGProps } from "react";
import clsx from "clsx";
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input, InputGroup } from "../../components/input";
import { Checkbox } from "../../components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToOpponents,
    createOpponent,
    updateOpponent,
    deleteOpponent,
    type Opponent,
} from "~/lib/firestore-games";

type IconProps = SVGProps<SVGSVGElement>;

export function meta() {
    return [
        { title: "Opponents · Dashboard" },
        { name: "description", content: "Manage opponent teams" },
    ];
}

export default function OpponentsPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "";

    const [opponents, setOpponents] = useState<Opponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Subscribe to opponents
    useEffect(() => {
        if (!clubId) return;

        setLoading(true);
        const unsubscribe = subscribeToOpponents(
            clubId,
            (data) => {
                setOpponents(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching opponents:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [clubId]);

    // Filter opponents
    const filteredOpponents = opponents.filter((opponent) =>
        opponent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (opponent: Opponent) => {
        if (!confirm(`Are you sure you want to delete "${opponent.name}"?`)) return;
        
        try {
            await deleteOpponent(clubId, opponent.id);
        } catch (error) {
            console.error("Error deleting opponent:", error);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} opponent(s)?`)) return;
        
        try {
            await Promise.all(
                Array.from(selectedIds).map((id) => deleteOpponent(clubId, id))
            );
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error deleting opponents:", error);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredOpponents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredOpponents.map((o) => o.id)));
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
                        <UsersIcon className="size-6 text-zinc-600" />
                        <Heading level={1} className="text-2xl font-semibold">
                            Opponents
                        </Heading>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
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

                {/* Bulk actions */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                        <span className="text-sm text-zinc-600">
                            {selectedIds.size} selected
                        </span>
                        <Button outline color="red" onClick={handleDeleteSelected}>
                            Delete selected
                        </Button>
                    </div>
                )}

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
                                    <TableHeader className="w-12">
                                        <Checkbox
                                            checked={selectedIds.size === filteredOpponents.length && filteredOpponents.length > 0}
                                            indeterminate={selectedIds.size > 0 && selectedIds.size < filteredOpponents.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableHeader>
                                    <TableHeader className="w-12"></TableHeader>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader className="w-12"></TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOpponents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                <NoDataIcon className="size-12 mb-2" />
                                                <span className="text-sm">No opponents found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOpponents.map((opponent) => (
                                        <TableRow key={opponent.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(opponent.id)}
                                                    onChange={() => toggleSelect(opponent.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {opponent.logoUrl ? (
                                                    <img 
                                                        src={opponent.logoUrl} 
                                                        alt={opponent.name}
                                                        className="size-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-zinc-300">
                                                            {opponent.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{opponent.name}</TableCell>
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
                                                                        onClick={() => setEditingOpponent(opponent)}
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
                                                                        onClick={() => handleDelete(opponent)}
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
                    <span className="font-medium text-zinc-100">{filteredOpponents.length}</span>
                    <br />
                    <span className="text-zinc-400">of {filteredOpponents.length} results</span>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <OpponentDialog
                open={showCreateDialog || editingOpponent !== null}
                onClose={() => {
                    setShowCreateDialog(false);
                    setEditingOpponent(null);
                }}
                clubId={clubId}
                opponent={editingOpponent}
            />
            </div>
        </DashboardLayout>
    );
}

// Opponent Dialog Component
function OpponentDialog({
    open,
    onClose,
    clubId,
    opponent,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    opponent: Opponent | null;
}) {
    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [saving, setSaving] = useState(false);

    // Reset form when opponent changes
    useEffect(() => {
        if (opponent) {
            setName(opponent.name);
            setLogoUrl(opponent.logoUrl || "");
        } else {
            setName("");
            setLogoUrl("");
        }
    }, [opponent, open]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            const data = {
                name: name.trim(),
                logoUrl: logoUrl.trim() || undefined,
            };

            if (opponent) {
                await updateOpponent(clubId, opponent.id, data);
            } else {
                await createOpponent(clubId, data);
            }
            onClose();
        } catch (error) {
            console.error("Error saving opponent:", error);
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
                                        {opponent ? "Edit opponent" : "Create opponent"}
                                    </DialogTitle>
                                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
                                        <CloseIcon className="size-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Logo Upload Area */}
                                    <div>
                                        <button className="w-full border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
                                            {logoUrl ? (
                                                <img 
                                                    src={logoUrl} 
                                                    alt="Logo preview"
                                                    className="size-24 mx-auto rounded-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <ImageIcon className="size-6 mx-auto text-zinc-400 mb-2" />
                                                    <span className="text-sm text-blue-600">Upload image</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">
                                            Team name <span className="text-red-500">Required</span>
                                        </label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter team name"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button outline onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="blue" onClick={handleSubmit} disabled={saving || !name.trim()}>
                                        {saving ? "Saving..." : "Save"}
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

// Icons
function ChevronLeftIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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

