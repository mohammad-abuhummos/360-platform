import { Menu, MenuButton, MenuItem, MenuItems, Transition, Dialog, DialogPanel, DialogTitle, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import type { Route } from "./+types/registrations";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Divider } from "../components/divider";
import { Input, InputGroup } from "../components/input";
import { Textarea } from "../components/textarea";
import type { SVGProps } from "react";
import { Fragment, useState, useEffect, useCallback } from "react";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToRegistrations,
    subscribeToCategories,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    archiveRegistration,
    createCategory,
    updateCategory,
    deleteCategory,
    DEFAULT_FORM_FIELDS,
    generateFieldId,
    generateSectionId,
    generatePackageId,
    generateProductId,
    getVisibilityLabel,
    getStatusLabel,
    getFieldTypeLabel,
    type Registration,
    type RegistrationCategory,
    type RegistrationVisibility,
    type RegistrationStatus,
    type FormField,
    type FormSection,
    type Package,
    type FormFieldType,
} from "~/lib/firestore-registrations";

type IconProps = SVGProps<SVGSVGElement>;
type TabType = "registrations" | "archived";
type SortOption = "name" | "category" | "created";
type SortDirection = "asc" | "desc";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Registrations · Dashboard" },
        { name: "description", content: "Manage registration forms for your club." },
    ];
}

export default function RegistrationsPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "demo-club";

    const [activeTab, setActiveTab] = useState<TabType>("registrations");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("created");
    const [sortDir, setSortDir] = useState<SortDirection>("desc");
    
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [archivedRegistrations, setArchivedRegistrations] = useState<Registration[]>([]);
    const [categories, setCategories] = useState<RegistrationCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialogs
    const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<RegistrationCategory | null>(null);

    // Subscribe to data
    useEffect(() => {
        setLoading(true);
        
        const unsubRegistrations = subscribeToRegistrations(
            clubId,
            (data) => {
                setRegistrations(data);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            false
        );

        const unsubArchived = subscribeToRegistrations(
            clubId,
            (data) => setArchivedRegistrations(data),
            undefined,
            true
        );

        const unsubCategories = subscribeToCategories(
            clubId,
            (data) => setCategories(data),
            (err) => setError(err.message)
        );

        return () => {
            unsubRegistrations();
            unsubArchived();
            unsubCategories();
        };
    }, [clubId]);

    // Filter and sort registrations
    const filterAndSort = (items: Registration[]) => {
        let filtered = items;

        const normalized = searchQuery.trim().toLowerCase();
        if (normalized) {
            filtered = filtered.filter((reg) =>
                reg.title.toLowerCase().includes(normalized) ||
                reg.categoryName?.toLowerCase().includes(normalized)
            );
        }

        return [...filtered].sort((a, b) => {
            let comparison = 0;
            if (sortBy === "name") {
                comparison = a.title.localeCompare(b.title);
            } else if (sortBy === "category") {
                comparison = (a.categoryName || "").localeCompare(b.categoryName || "");
            } else {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                comparison = aTime - bTime;
            }
            return sortDir === "asc" ? comparison : -comparison;
        });
    };

    const displayedRegistrations = activeTab === "registrations"
        ? filterAndSort(registrations)
        : filterAndSort(archivedRegistrations);

    const handleSortChange = (newSort: SortOption) => {
        if (sortBy === newSort) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSort);
            setSortDir("asc");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start gap-4">
                    <Button plain className="px-3 py-2 text-sm font-semibold text-zinc-600">
                        <ChevronLeftIcon data-slot="icon" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-zinc-200 bg-white p-2">
                            <ClipboardDocumentIcon className="size-6 text-zinc-600" />
                        </div>
                        <Heading level={1} className="text-2xl font-semibold">
                            Registrations
                        </Heading>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <Button className="rounded-full bg-zinc-900 p-2 text-white hover:bg-zinc-800">
                            <PlusIcon className="size-5" />
                        </Button>
                        <Button className="relative rounded-full bg-white p-2 text-zinc-600 border border-zinc-200 hover:bg-zinc-50">
                            <BellIcon className="size-5" />
                            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-500" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-200">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab("registrations")}
                            className={clsx(
                                "pb-3 text-sm font-medium transition",
                                activeTab === "registrations"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Registrations
                        </button>
                        <button
                            onClick={() => setActiveTab("archived")}
                            className={clsx(
                                "pb-3 text-sm font-medium transition",
                                activeTab === "archived"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Archived
                        </button>
                    </nav>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    <InputGroup className="min-w-0 flex-1 max-w-md">
                        <SearchIcon data-slot="icon" className="text-zinc-400" />
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            aria-label="Search registrations"
                        />
                    </InputGroup>
                    <Button outline className="gap-2">
                        <FilterIcon className="size-4" />
                        Filters
                    </Button>
                    <div className="ml-auto flex gap-3">
                        <Button outline onClick={() => setShowCategoriesDialog(true)}>
                            Categories
                        </Button>
                        <Button color="blue" onClick={() => setShowCreateDialog(true)}>
                            <PlusIcon data-slot="icon" />
                            Create
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                ) : (
                    <RegistrationsTable
                        registrations={displayedRegistrations}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSortChange={handleSortChange}
                        clubId={clubId}
                        isArchived={activeTab === "archived"}
                    />
                )}

                {/* Pagination info */}
                <div className="text-sm text-zinc-500">
                    Showing <span className="font-medium text-zinc-900">1</span> to{" "}
                    <span className="font-medium text-zinc-900">{displayedRegistrations.length}</span>
                    <br />
                    <span className="text-zinc-400">of {displayedRegistrations.length} results</span>
                </div>
            </div>

            {/* Categories Dialog */}
            <CategoriesDialog
                open={showCategoriesDialog}
                onClose={() => setShowCategoriesDialog(false)}
                categories={categories}
                clubId={clubId}
                onAddCategory={() => {
                    setEditingCategory(null);
                    setShowNewCategoryDialog(true);
                }}
                onEditCategory={(cat) => {
                    setEditingCategory(cat);
                    setShowNewCategoryDialog(true);
                }}
            />

            {/* New/Edit Category Dialog */}
            <NewCategoryDialog
                open={showNewCategoryDialog}
                onClose={() => {
                    setShowNewCategoryDialog(false);
                    setEditingCategory(null);
                }}
                clubId={clubId}
                editingCategory={editingCategory}
            />

            {/* Create Registration Dialog */}
            <CreateRegistrationDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                categories={categories}
                clubId={clubId}
            />
        </DashboardLayout>
    );
}

// ==================== Table Component ====================

function RegistrationsTable({
    registrations,
    sortBy,
    sortDir,
    onSortChange,
    clubId,
    isArchived,
}: {
    registrations: Registration[];
    sortBy: SortOption;
    sortDir: SortDirection;
    onSortChange: (sort: SortOption) => void;
    clubId: string;
    isArchived: boolean;
}) {
    const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortOption }) => (
        <th
            className="px-4 py-3 text-left text-sm font-medium text-zinc-600 cursor-pointer hover:text-zinc-900"
            onClick={() => onSortChange(sortKey)}
        >
            <span className="flex items-center gap-1">
                {label}
                <SortArrows active={sortBy === sortKey} direction={sortDir} />
            </span>
        </th>
    );

    if (registrations.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
                <ClipboardDocumentIcon className="mx-auto size-12 text-zinc-300" />
                <Heading level={3} className="mt-4 text-lg font-semibold text-zinc-900">
                    No registrations {isArchived ? "archived" : "found"}
                </Heading>
                <Text className="mt-2 text-sm text-zinc-500">
                    {isArchived
                        ? "Archived registrations will appear here."
                        : "Create your first registration form to get started."}
                </Text>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
                <thead className="bg-zinc-50/80 border-b border-zinc-200">
                    <tr>
                        <SortHeader label="Name" sortKey="name" />
                        <SortHeader label="Category" sortKey="category" />
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600">Visibility</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600">
                            <span className="flex items-center gap-1">
                                Registrations
                                <SortArrows active={false} direction="asc" />
                            </span>
                        </th>
                        <SortHeader label="Created" sortKey="created" />
                        <th className="px-4 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {registrations.map((reg) => (
                        <RegistrationRow
                            key={reg.id}
                            registration={reg}
                            clubId={clubId}
                            isArchived={isArchived}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RegistrationRow({
    registration,
    clubId,
    isArchived,
}: {
    registration: Registration;
    clubId: string;
    isArchived: boolean;
}) {
    const handleArchive = async () => {
        await archiveRegistration(clubId, registration.id);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this registration?")) {
            await deleteRegistration(clubId, registration.id);
        }
    };

    const createdDate = registration.createdAt
        ? new Date(registration.createdAt.toMillis()).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
          })
        : "-";

    return (
        <tr className="hover:bg-zinc-50/50 transition">
            <td className="px-4 py-4">
                <span className="font-medium text-zinc-900">{registration.title}</span>
            </td>
            <td className="px-4 py-4">
                {registration.categoryName && (
                    <a href="#" className="text-blue-600 hover:underline">
                        {registration.categoryName}
                    </a>
                )}
            </td>
            <td className="px-4 py-4 text-zinc-600">
                {getVisibilityLabel(registration.visibility)}
            </td>
            <td className="px-4 py-4">
                <StatusBadge status={registration.status} />
            </td>
            <td className="px-4 py-4 text-center text-zinc-600">
                {registration.registrationCount}
            </td>
            <td className="px-4 py-4 text-zinc-600">{createdDate}</td>
            <td className="px-4 py-4">
                <Menu as="div" className="relative">
                    <MenuButton className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                        <EllipsisIcon className="size-5" />
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
                        <MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        className={clsx(
                                            "flex w-full items-center gap-2 px-4 py-2 text-sm",
                                            active ? "bg-zinc-50 text-zinc-900" : "text-zinc-700"
                                        )}
                                    >
                                        <PencilIcon className="size-4" />
                                        Edit
                                    </button>
                                )}
                            </MenuItem>
                            {!isArchived && (
                                <MenuItem>
                                    {({ active }) => (
                                        <button
                                            onClick={handleArchive}
                                            className={clsx(
                                                "flex w-full items-center gap-2 px-4 py-2 text-sm",
                                                active ? "bg-zinc-50 text-zinc-900" : "text-zinc-700"
                                            )}
                                        >
                                            <ArchiveIcon className="size-4" />
                                            Archive
                                        </button>
                                    )}
                                </MenuItem>
                            )}
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={handleDelete}
                                        className={clsx(
                                            "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600",
                                            active && "bg-red-50"
                                        )}
                                    >
                                        <TrashIcon className="size-4" />
                                        Delete
                                    </button>
                                )}
                            </MenuItem>
                        </MenuItems>
                    </Transition>
                </Menu>
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: RegistrationStatus }) {
    const colors = {
        open: "bg-green-50 text-green-700 border-green-200",
        closed: "bg-red-50 text-red-700 border-red-200",
        draft: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };

    return (
        <span className={clsx("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border", colors[status])}>
            {getStatusLabel(status)}
        </span>
    );
}

function SortArrows({ active, direction }: { active: boolean; direction: SortDirection }) {
    return (
        <span className="flex flex-col">
            <ChevronUpSmIcon
                className={clsx(
                    "size-3 -mb-1",
                    active && direction === "asc" ? "text-zinc-900" : "text-zinc-300"
                )}
            />
            <ChevronDownSmIcon
                className={clsx(
                    "size-3",
                    active && direction === "desc" ? "text-zinc-900" : "text-zinc-300"
                )}
            />
        </span>
    );
}

// ==================== Categories Dialog ====================

function CategoriesDialog({
    open,
    onClose,
    categories,
    clubId,
    onAddCategory,
    onEditCategory,
}: {
    open: boolean;
    onClose: () => void;
    categories: RegistrationCategory[];
    clubId: string;
    onAddCategory: () => void;
    onEditCategory: (cat: RegistrationCategory) => void;
}) {
    const handleDelete = async (categoryId: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(clubId, categoryId);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                            Categories
                        </DialogTitle>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <span className="text-sm font-medium text-zinc-600">Name</span>
                                <span className="text-sm font-medium text-zinc-600">Description</span>
                            </div>
                            <Button outline onClick={onAddCategory} className="ml-4">
                                Add category
                            </Button>
                        </div>

                        {/* Categories list */}
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50"
                                >
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <span className="text-sm text-zinc-900">{cat.name}</span>
                                        <span className="text-sm text-zinc-500">{cat.description || "-"}</span>
                                    </div>
                                    <Menu as="div" className="relative">
                                        <MenuButton className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                                            <EllipsisIcon className="size-5" />
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
                                            <MenuItems className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onEditCategory(cat)}
                                                            className={clsx(
                                                                "flex w-full items-center gap-2 px-4 py-2 text-sm",
                                                                active ? "bg-zinc-50 text-zinc-900" : "text-zinc-700"
                                                            )}
                                                        >
                                                            <PencilIcon className="size-4" />
                                                            Edit
                                                        </button>
                                                    )}
                                                </MenuItem>
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className={clsx(
                                                                "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600",
                                                                active && "bg-red-50"
                                                            )}
                                                        >
                                                            <TrashIcon className="size-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </MenuItem>
                                            </MenuItems>
                                        </Transition>
                                    </Menu>
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    No categories yet. Add one to get started.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
                        <Button outline onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="blue" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

// ==================== New Category Dialog ====================

function NewCategoryDialog({
    open,
    onClose,
    clubId,
    editingCategory,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    editingCategory: RegistrationCategory | null;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name);
            setDescription(editingCategory.description || "");
        } else {
            setName("");
            setDescription("");
        }
    }, [editingCategory, open]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            if (editingCategory) {
                await updateCategory(clubId, editingCategory.id, { name, description });
            } else {
                await createCategory(clubId, { name, description });
            }
            onClose();
        } catch (err) {
            console.error("Failed to save category:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                            {editingCategory ? "Edit category" : "New category"}
                        </DialogTitle>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                New category <span className="text-zinc-400">Required</span>
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Category name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
                        <Button outline onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleSubmit}
                            disabled={!name.trim() || saving}
                        >
                            {saving ? "Saving..." : "Done"}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

// ==================== Create Registration Dialog ====================

function CreateRegistrationDialog({
    open,
    onClose,
    categories,
    clubId,
}: {
    open: boolean;
    onClose: () => void;
    categories: RegistrationCategory[];
    clubId: string;
}) {
    // Form state
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    
    const [sections, setSections] = useState<FormSection[]>([
        {
            id: generateSectionId(),
            title: "Main",
            order: 0,
            fields: [...DEFAULT_FORM_FIELDS],
        },
    ]);
    
    const [packages, setPackages] = useState<Package[]>([]);
    const [sendEmailOnSubmission, setSendEmailOnSubmission] = useState(true);
    const [customEmailEnabled, setCustomEmailEnabled] = useState(false);
    const [visibility, setVisibility] = useState<RegistrationVisibility>("unlisted");
    const [limitResponses, setLimitResponses] = useState(false);
    const [maxResponses, setMaxResponses] = useState<number | undefined>();
    const [requireAccount, setRequireAccount] = useState(true);
    const [status, setStatus] = useState<RegistrationStatus>("draft");
    
    const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
    const [showAddPackageDialog, setShowAddPackageDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setTitle("");
            setCategoryId("");
            setDescription("");
            setImageUrl("");
            setSections([
                {
                    id: generateSectionId(),
                    title: "Main",
                    order: 0,
                    fields: [...DEFAULT_FORM_FIELDS],
                },
            ]);
            setPackages([]);
            setSendEmailOnSubmission(true);
            setCustomEmailEnabled(false);
            setVisibility("unlisted");
            setLimitResponses(false);
            setMaxResponses(undefined);
            setRequireAccount(true);
            setStatus("draft");
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        setSaving(true);
        try {
            const selectedCategory = categories.find((c) => c.id === categoryId);
            await createRegistration(clubId, {
                title,
                categoryId: categoryId || undefined,
                categoryName: selectedCategory?.name,
                description,
                imageUrl: imageUrl || undefined,
                visibility,
                status,
                sections,
                packages,
                sendEmailOnSubmission,
                customEmailEnabled,
                limitResponses,
                maxResponses: limitResponses ? maxResponses : undefined,
                requireAccount,
            });
            onClose();
        } catch (err) {
            console.error("Failed to create registration:", err);
        } finally {
            setSaving(false);
        }
    };

    const addField = (type: FormFieldType, label: string) => {
        const newField: FormField = {
            id: generateFieldId(),
            type,
            label,
            required: false,
            isDefault: false,
            order: sections[0].fields.length,
        };

        setSections((prev) => [
            {
                ...prev[0],
                fields: [...prev[0].fields, newField],
            },
            ...prev.slice(1),
        ]);
        setShowAddFieldDialog(false);
    };

    const removeField = (fieldId: string) => {
        setSections((prev) => [
            {
                ...prev[0],
                fields: prev[0].fields.filter((f) => f.id !== fieldId),
            },
            ...prev.slice(1),
        ]);
    };

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                id: generateSectionId(),
                title: `Section ${prev.length + 1}`,
                order: prev.length,
                fields: [],
            },
        ]);
    };

    const addPackage = (pkg: Package) => {
        setPackages((prev) => [...prev, pkg]);
        setShowAddPackageDialog(false);
    };

    const removePackage = (packageId: string) => {
        setPackages((prev) => prev.filter((p) => p.id !== packageId));
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-3xl my-8 rounded-2xl bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Button plain onClick={onClose} className="text-zinc-600">
                                <ChevronLeftIcon className="size-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <ClipboardDocumentIcon className="size-5 text-zinc-400" />
                                <DialogTitle className="text-lg font-semibold text-zinc-900">
                                    Registrations
                                </DialogTitle>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button outline onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="blue"
                                onClick={handleSubmit}
                                disabled={!title.trim() || saving}
                            >
                                {saving ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* General Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <InfoCircleIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>General</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                This is the general description for the registration.
                            </Text>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Title
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Title of your form, e.g Club Registration Form."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Category <span className="text-zinc-400">Optional</span>
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Description <span className="text-zinc-400">Optional</span>
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your registration form"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Image attachment
                                    </label>
                                    <Button outline className="text-blue-600">
                                        <PlusIcon data-slot="icon" />
                                        Add image
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <Divider />

                        {/* Form Fields Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <FolderIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>Add form fields</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Select the data that you want to collect on this form. Drag items to change order.
                            </Text>

                            <div className="space-y-2 mb-4">
                                {sections[0]?.fields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 bg-white"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripIcon className="size-4 text-zinc-300 cursor-grab" />
                                            <FieldTypeIcon type={field.type} />
                                            <span className="text-sm font-medium text-zinc-900">
                                                {field.label}
                                            </span>
                                            <span className="text-sm text-zinc-400">
                                                ({getFieldTypeLabel(field.type)})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {field.isDefault && (
                                                <Badge color="zinc">Default</Badge>
                                            )}
                                            {field.required && (
                                                <Badge color="zinc">Required</Badge>
                                            )}
                                            <Menu as="div" className="relative">
                                                <MenuButton className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                                                    <EllipsisIcon className="size-5" />
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
                                                    <MenuItems className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                                                        {!field.isDefault && (
                                                            <MenuItem>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => removeField(field.id)}
                                                                        className={clsx(
                                                                            "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600",
                                                                            active && "bg-red-50"
                                                                        )}
                                                                    >
                                                                        <TrashIcon className="size-4" />
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </MenuItem>
                                                        )}
                                                    </MenuItems>
                                                </Transition>
                                            </Menu>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    outline
                                    onClick={() => setShowAddFieldDialog(true)}
                                    className="text-blue-600"
                                >
                                    <PlusIcon data-slot="icon" />
                                    Add question
                                </Button>
                                <Button outline onClick={addSection} className="text-blue-600">
                                    <PlusIcon data-slot="icon" />
                                    Add section
                                </Button>
                            </div>
                        </section>

                        <Divider />

                        {/* Packages Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <CartIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>Packages</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Create custom packages by combining products with different payment options.
                            </Text>

                            {packages.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
                                    <CartIcon className="mx-auto size-10 text-zinc-300" />
                                    <p className="mt-3 font-medium text-zinc-900">No packages added yet</p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Combine products and payment options to simplify your registration process.
                                    </p>
                                    <Button
                                        color="blue"
                                        onClick={() => setShowAddPackageDialog(true)}
                                        className="mt-4"
                                    >
                                        <PlusIcon data-slot="icon" />
                                        Add package
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3"
                                        >
                                            <span className="font-medium">{pkg.title}</span>
                                            <Button
                                                plain
                                                onClick={() => removePackage(pkg.id)}
                                                className="text-red-600"
                                            >
                                                <TrashIcon className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        outline
                                        onClick={() => setShowAddPackageDialog(true)}
                                        className="text-blue-600"
                                    >
                                        <PlusIcon data-slot="icon" />
                                        Add package
                                    </Button>
                                </div>
                            )}
                        </section>

                        <Divider />

                        {/* Submission Email Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <MailIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>Submission email</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                You may add a custom text to send to registrants of this form
                            </Text>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={sendEmailOnSubmission}
                                        onChange={(e) => setSendEmailOnSubmission(e.target.checked)}
                                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-zinc-700">
                                        Send email upon submission{" "}
                                        <span className="text-zinc-400">Optional</span>
                                    </span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={customEmailEnabled}
                                        onChange={(e) => setCustomEmailEnabled(e.target.checked)}
                                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-zinc-700">
                                        Customize email{" "}
                                        <span className="text-zinc-400">Optional</span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        <Divider />

                        {/* Visibility Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <EyeIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>Visibility</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Who is this registration available to?
                            </Text>

                            <RadioGroup value={visibility} onChange={setVisibility} className="space-y-3">
                                <RadioGroup.Option value="public">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Public</span>
                                                <p className="text-sm text-zinc-500">
                                                    The form will be published on your public form site and in your club lobby, open for anyone to submit
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>

                                <RadioGroup.Option value="club_lobby">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Club lobby</span>
                                                <p className="text-sm text-zinc-500">
                                                    The form will be published in your club lobby, open for members of your club to submit
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>

                                <RadioGroup.Option value="unlisted">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Unlisted</span>
                                                <p className="text-sm text-zinc-500">
                                                    Only available with a direct link
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>
                            </RadioGroup>
                        </section>

                        <Divider />

                        {/* Availability Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="size-5 text-zinc-400" />
                                <Subheading level={2}>Availability</Subheading>
                            </div>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Who is this registration available to?
                            </Text>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <InfoCircleIcon className="size-4" />
                                    All registrations require a 360Player account.{" "}
                                    <a href="#" className="underline">Learn more</a>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={limitResponses}
                                        onChange={(e) => setLimitResponses(e.target.checked)}
                                        className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-zinc-900">Limit responses</span>
                                        <p className="text-sm text-zinc-500">
                                            Limit the number of responses before the registration closes
                                        </p>
                                    </div>
                                </label>

                                {limitResponses && (
                                    <div className="ml-7">
                                        <Input
                                            type="number"
                                            value={maxResponses || ""}
                                            onChange={(e) => setMaxResponses(parseInt(e.target.value) || undefined)}
                                            placeholder="Maximum responses"
                                            className="max-w-xs"
                                        />
                                    </div>
                                )}

                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={requireAccount}
                                        onChange={(e) => setRequireAccount(e.target.checked)}
                                        className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-zinc-900">Require a 360Player account</span>
                                        <p className="text-sm text-zinc-500">
                                            Only people with an existing 360Player account will be able to submit this registration
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <Divider />

                        {/* Status Section */}
                        <section>
                            <Subheading level={2} className="mb-4">Status</Subheading>

                            <RadioGroup value={status} onChange={setStatus} className="space-y-3">
                                <RadioGroup.Option value="open">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Open</span>
                                                <p className="text-sm text-zinc-500">
                                                    The registration is open to submissions
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>

                                <RadioGroup.Option value="closed">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Closed</span>
                                                <p className="text-sm text-zinc-500">
                                                    The registration is closed to new submissions
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>

                                <RadioGroup.Option value="draft">
                                    {({ checked }) => (
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={clsx(
                                                "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center",
                                                checked ? "border-blue-600" : "border-zinc-300"
                                            )}>
                                                {checked && <div className="size-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-zinc-900">Draft</span>
                                                <p className="text-sm text-zinc-500">
                                                    A draft registration is only visible to preview
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </RadioGroup.Option>
                            </RadioGroup>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
                        <Button outline onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleSubmit}
                            disabled={!title.trim() || saving}
                        >
                            {saving ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </DialogPanel>
            </div>

            {/* Add Field Dialog */}
            <AddFieldDialog
                open={showAddFieldDialog}
                onClose={() => setShowAddFieldDialog(false)}
                onAdd={addField}
            />

            {/* Add Package Dialog */}
            <AddPackageDialog
                open={showAddPackageDialog}
                onClose={() => setShowAddPackageDialog(false)}
                onAdd={addPackage}
                fields={sections[0]?.fields || []}
            />
        </Dialog>
    );
}

// ==================== Add Field Dialog ====================

function AddFieldDialog({
    open,
    onClose,
    onAdd,
}: {
    open: boolean;
    onClose: () => void;
    onAdd: (type: FormFieldType, label: string) => void;
}) {
    const [type, setType] = useState<FormFieldType>("short_answer");
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (open) {
            setType("short_answer");
            setLabel("");
        }
    }, [open]);

    const handleSubmit = () => {
        if (!label.trim()) return;
        onAdd(type, label);
    };

    const fieldTypes: { type: FormFieldType; label: string }[] = [
        { type: "short_answer", label: "Short answer" },
        { type: "long_answer", label: "Long answer" },
        { type: "email", label: "Email" },
        { type: "phone", label: "Phone" },
        { type: "date", label: "Date" },
        { type: "number", label: "Number" },
        { type: "single_choice", label: "Single choice" },
        { type: "multiple_choice", label: "Multiple choice" },
        { type: "file_upload", label: "File upload" },
    ];

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[60]">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                            Add question
                        </DialogTitle>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Question type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as FormFieldType)}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {fieldTypes.map((ft) => (
                                    <option key={ft.type} value={ft.type}>
                                        {ft.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Question label
                            </label>
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Enter question label"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
                        <Button outline onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="blue" onClick={handleSubmit} disabled={!label.trim()}>
                            Add
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

// ==================== Add Package Dialog ====================

function AddPackageDialog({
    open,
    onClose,
    onAdd,
    fields,
}: {
    open: boolean;
    onClose: () => void;
    onAdd: (pkg: Package) => void;
    fields: FormField[];
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            setTitle("");
            setDescription("");
        }
    }, [open]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({
            id: generatePackageId(),
            title,
            description,
            products: [],
            eligibilityRules: [],
        });
    };

    const hasDateOrChoiceFields = fields.some(
        (f) => f.type === "date" || f.type === "single_choice"
    );

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[60]">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-2xl my-8 rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                            Add package
                        </DialogTitle>
                        <div className="flex gap-3">
                            <Button outline onClick={onClose}>
                                Cancel
                            </Button>
                            <Button color="blue" onClick={handleSubmit} disabled={!title.trim()}>
                                Add package
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Package Details */}
                        <section>
                            <Subheading level={3} className="mb-4">
                                1. Package details
                            </Subheading>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Give your package a name and description.
                            </Text>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Title
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Package title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Description
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Package description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </section>

                        <Divider />

                        {/* Product & Payment Options */}
                        <section>
                            <Subheading level={3} className="mb-4">
                                2. Product & payment options
                            </Subheading>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Add the products and payment options you want to include in this package.
                            </Text>

                            <Button outline className="text-blue-600 mb-4">
                                <PlusIcon data-slot="icon" />
                                Add product
                            </Button>

                            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
                                <CreditCardIcon className="mx-auto size-10 text-zinc-300" />
                                <p className="mt-3 font-medium text-zinc-900">No payment options</p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Add one or more payment options for your customers to choose between when submitting the registration.
                                </p>
                                <Button color="blue" className="mt-4">
                                    <PlusIcon data-slot="icon" />
                                    Add payment option
                                </Button>
                            </div>
                        </section>

                        <Divider />

                        {/* Eligibility Rules */}
                        <section>
                            <Subheading level={3} className="mb-4">
                                3. Eligibility rules
                            </Subheading>
                            <Text className="text-sm text-zinc-500 mb-4">
                                Define conditions to control which users can access this package. Users must meet all conditions to be eligible.
                            </Text>

                            {!hasDateOrChoiceFields && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <InfoCircleIcon className="size-4" />
                                        Cannot add eligibility rules
                                        <p className="text-blue-600">
                                            Add a date or single choice field to your registration form to enable eligibility rules.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

// ==================== Helper Components ====================

function FieldTypeIcon({ type }: { type: FormFieldType }) {
    switch (type) {
        case "short_answer":
        case "long_answer":
            return <TextIcon className="size-4 text-zinc-400" />;
        case "email":
            return <AtIcon className="size-4 text-zinc-400" />;
        case "phone":
            return <PhoneIcon className="size-4 text-zinc-400" />;
        case "date":
            return <CalendarIcon className="size-4 text-zinc-400" />;
        case "number":
            return <HashIcon className="size-4 text-zinc-400" />;
        case "single_choice":
        case "multiple_choice":
            return <ListIcon className="size-4 text-zinc-400" />;
        case "file_upload":
            return <UploadIcon className="size-4 text-zinc-400" />;
        default:
            return <TextIcon className="size-4 text-zinc-400" />;
    }
}

// ==================== Icons ====================

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

function ClipboardDocumentIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M9 4h6M9 7h6" strokeLinecap="round" />
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M8 12h8M8 16h5" />
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

function BellIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M18 10a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
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

function FilterIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
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

function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="m4 20 4.5-1 9.5-9.5-3.5-3.5L5 15.5 4 20z" strokeLinejoin="round" />
            <path d="M14.5 5.5 18 9" />
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

function ArchiveIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <rect x="3" y="4" width="18" height="5" rx="1" />
            <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 14h4" strokeLinecap="round" />
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

function ChevronUpSmIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={className}>
            <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronDownSmIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={className}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function InfoCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v0M12 12v4" strokeLinecap="round" />
        </svg>
    );
}

function FolderIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        </svg>
    );
}

function GripIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
        </svg>
    );
}

function CartIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M6 6h15l-1.5 9H7.5L6 6zM6 6l-1-4H2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
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

function EyeIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function LinkIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M10 14a4 4 0 0 0 4 0l4-4a4 4 0 0 0-5.66-5.66l-1 1" strokeLinecap="round" />
            <path d="M14 10a4 4 0 0 0-4 0l-4 4a4 4 0 0 0 5.66 5.66l1-1" strokeLinecap="round" />
        </svg>
    );
}

function TextIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
        </svg>
    );
}

function AtIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" strokeLinecap="round" />
        </svg>
    );
}

function PhoneIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}

function CalendarIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
        </svg>
    );
}

function HashIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" strokeLinecap="round" />
        </svg>
    );
}

function ListIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0" strokeLinecap="round" />
        </svg>
    );
}

function UploadIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CreditCardIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
        </svg>
    );
}

