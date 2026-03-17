import clsx from "clsx";
import type { Route } from "./+types/settings";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "../components/dialog";
import { Checkbox, CheckboxField, CheckboxGroup } from "../components/checkbox";
import type { SVGProps } from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { toast } from "react-hot-toast";
import {
    subscribeToClubRoles,
    createClubRole,
    updateClubRole,
    deleteClubRole,
    NAV_TABS,
    type Role,
} from "../lib/firestore-roles";

type IconProps = SVGProps<SVGSVGElement>;
type SettingsTab = "roles";

export function meta(_args: Route.MetaArgs) {
    return [
        { title: "Settings · 360 Dashboard" },
        { name: "description", content: "Manage roles, permissions, and app settings." },
    ];
}

export default function Settings() {
    const { activeClub } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("roles");
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);

    useEffect(() => {
        if (!activeClub?.id) {
            setRoles([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToClubRoles(
            activeClub.id,
            (data) => {
                setRoles(data);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeClub?.id]);

    if (!activeClub) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <div className="rounded-xl bg-zinc-800 p-4">
                        <SettingsIcon className="size-8 text-zinc-500" />
                    </div>
                    <Heading level={2} className="mt-4 text-lg font-semibold text-white">
                        No club selected
                    </Heading>
                    <Text className="mt-2 text-sm text-zinc-400">
                        Select a club from the sidebar to manage settings.
                    </Text>
                </div>
            </DashboardLayout>
        );
    }

    const tabs: { id: SettingsTab; label: string }[] = [
        { id: "roles", label: "Roles & Permissions" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-500 p-2.5">
                        <SettingsIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <Heading level={1} className="text-2xl font-bold text-white">
                            Settings
                        </Heading>
                        <Text className="text-sm text-zinc-500">{activeClub.name}</Text>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-zinc-800">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "border-b-2 px-4 py-3 text-sm font-medium transition",
                                activeTab === tab.id
                                    ? "border-amber-500 text-amber-500"
                                    : "border-transparent text-zinc-400 hover:text-zinc-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "roles" && (
                    <RolesAndPermissionsTab
                        roles={roles}
                        loading={loading}
                        error={error}
                        onCreateRole={() => setCreateModalOpen(true)}
                        onEditRole={setEditRole}
                        onDeleteRole={setDeleteRole}
                    />
                )}
            </div>

            <CreateRoleModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                clubId={activeClub.id}
            />

            <EditRoleModal
                open={!!editRole}
                onClose={() => setEditRole(null)}
                clubId={activeClub.id}
                role={editRole}
            />

            <DeleteRoleModal
                open={!!deleteRole}
                onClose={() => setDeleteRole(null)}
                clubId={activeClub.id}
                role={deleteRole}
            />
        </DashboardLayout>
    );
}

function RolesAndPermissionsTab({
    roles,
    loading,
    error,
    onCreateRole,
    onEditRole,
    onDeleteRole,
}: {
    roles: Role[];
    loading: boolean;
    error: string | null;
    onCreateRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (role: Role) => void;
}) {
    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner />
                    <Text className="text-sm text-zinc-400">Loading roles...</Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center">
                <ExclamationCircleIcon className="size-8 text-red-400" />
                <Heading level={2} className="mt-4 text-lg font-semibold text-white">
                    Unable to load roles
                </Heading>
                <Text className="mt-2 text-sm text-red-400">{error}</Text>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <Subheading level={2} className="font-semibold text-white">
                    Roles & Permissions
                </Subheading>
                <Button color="amber" onClick={onCreateRole}>
                    <PlusIcon data-slot="icon" />
                    Create Role
                </Button>
            </div>

            <div className="p-4">
                {roles.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 p-8 text-center">
                        <ShieldIcon className="mx-auto size-10 text-zinc-500" />
                        <p className="mt-3 text-sm font-medium text-white">No roles yet</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Create a role to control which navigation tabs users can access.
                        </p>
                        <Button color="amber" className="mt-4" onClick={onCreateRole}>
                            <PlusIcon data-slot="icon" />
                            Create Role
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-zinc-700 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                                    <th className="pb-3 pr-4">Role</th>
                                    <th className="pb-3 pr-4">Description</th>
                                    <th className="pb-3 pr-4">Permissions</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {roles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="group transition hover:bg-zinc-800/50"
                                    >
                                        <td className="py-4 pr-4">
                                            <span className="font-medium text-white">
                                                {role.name}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-sm text-zinc-400">
                                                {role.description || "—"}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.length === 0 ? (
                                                    <span className="text-xs text-zinc-500">
                                                        No access
                                                    </span>
                                                ) : (
                                                    role.permissions.slice(0, 4).map((p) => (
                                                        <span
                                                            key={p}
                                                            className="rounded-md bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300"
                                                        >
                                                            {p}
                                                        </span>
                                                    ))
                                                )}
                                                {role.permissions.length > 4 && (
                                                    <span className="text-xs text-zinc-500">
                                                        +{role.permissions.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => onEditRole(role)}
                                                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                                                    title="Edit role"
                                                >
                                                    <PencilIcon className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteRole(role)}
                                                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-500/20 hover:text-red-400"
                                                    title="Delete role"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function CreateRoleModal({
    open,
    onClose,
    clubId,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
}) {
    return (
        <RoleFormModal
            open={open}
            onClose={onClose}
            clubId={clubId}
            mode="create"
        />
    );
}

function EditRoleModal({
    open,
    onClose,
    clubId,
    role,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    role: Role | null;
}) {
    return (
        <RoleFormModal
            open={open}
            onClose={onClose}
            clubId={clubId}
            mode="edit"
            role={role ?? undefined}
        />
    );
}

function RoleFormModal({
    open,
    onClose,
    clubId,
    mode,
    role,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    mode: "create" | "edit";
    role?: Role;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissions, setPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (role) {
                setName(role.name);
                setDescription(role.description ?? "");
                setPermissions(role.permissions ?? []);
            } else {
                setName("");
                setDescription("");
                setPermissions([]);
            }
            setError(null);
        }
    }, [open, role]);

    const togglePermission = (tab: string) => {
        setPermissions((prev) =>
            prev.includes(tab) ? prev.filter((p) => p !== tab) : [...prev, tab]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Role name is required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (mode === "create") {
                await createClubRole(clubId, {
                    name: trimmedName,
                    description: description.trim(),
                    permissions,
                });
                toast.success("Role created successfully");
            } else if (role) {
                await updateClubRole(clubId, role.id, {
                    name: trimmedName,
                    description: description.trim(),
                    permissions,
                });
                toast.success("Role updated successfully");
            }
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} size="lg">
            <DialogTitle>
                {mode === "create" ? "Create Role" : "Edit Role"}
            </DialogTitle>
            <DialogDescription>
                {mode === "create"
                    ? "Define a new role and choose which navigation tabs it can access."
                    : "Update the role name, description, and permissions."}
            </DialogDescription>

            <form onSubmit={handleSubmit}>
                <DialogBody className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Coach, Manager"
                            required
                            className="dark:bg-zinc-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Description
                        </label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this role"
                            className="dark:bg-zinc-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Navigation Permissions
                        </label>
                        <p className="mb-3 text-xs text-zinc-500">
                            Select which tabs users with this role can see in the sidebar.
                        </p>
                        <CheckboxGroup className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {NAV_TABS.map((tab) => (
                                <CheckboxField key={tab}>
                                    <Checkbox
                                        checked={permissions.includes(tab)}
                                        onChange={() => togglePermission(tab)}
                                    />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                        {tab}
                                    </span>
                                </CheckboxField>
                            ))}
                        </CheckboxGroup>
                    </div>
                </DialogBody>

                <DialogActions>
                    <Button plain onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" color="amber" disabled={submitting}>
                        {submitting
                            ? mode === "create"
                                ? "Creating..."
                                : "Saving..."
                            : mode === "create"
                                ? "Create Role"
                                : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

function DeleteRoleModal({
    open,
    onClose,
    clubId,
    role,
}: {
    open: boolean;
    onClose: () => void;
    clubId: string;
    role: Role | null;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!role) return;

        setSubmitting(true);
        setError(null);

        try {
            await deleteClubRole(clubId, role.id);
            toast.success("Role deleted successfully");
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete role";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!role) return null;

    return (
        <Dialog open={open} onClose={onClose} size="sm">
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete <strong>{role.name}</strong>? This action cannot be
                undone.
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
                    {submitting ? "Deleting..." : "Delete Role"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function LoadingSpinner() {
    return (
        <svg className="size-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

function PlusIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <path
                d="m4 20 4.5-1 9.5-9.5-3.5-3.5L5 15.5 4 20z"
                strokeLinejoin="round"
            />
            <path d="M14.5 5.5 18 9" />
        </svg>
    );
}

function TrashIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <path
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
    );
}

const SETTINGS_ICON_PATH =
    "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82v0a2 2 0 1 1-3.32 0 1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15 1.65 1.65 0 0 0 4 14a1.65 1.65 0 0 0-.6-1H3a2 2 0 1 1 0-3h.4a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82v0a2 2 0 1 1 3.32 0 1.65 1.65 0 0 0 .33 1.82 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.6.35 1 .99 1 1.7s-.4 1.35-1 1.7Z";

function SettingsIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <circle cx="12" cy="12" r="3" />
            <path d={SETTINGS_ICON_PATH} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ShieldIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <path
                d="M12 3 4 6v6c0 4.28 2.99 8.42 8 9.99 5.01-1.57 8-5.71 8-9.99V6z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ExclamationCircleIcon({ className, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            {...props}
            className={["size-5", className].filter(Boolean).join(" ")}
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
    );
}
