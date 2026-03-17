import { Link } from "react-router";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Subheading } from "../heading";
import { Text } from "../text";
import type { ClubMember, PlayerProfile } from "~/lib/firestore-team";
import {
    PencilIcon,
    DocumentTextIcon,
    UserGroupIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Fragment } from "react";

type ProfileSidebarCardProps = {
    member: ClubMember;
    clubId: string;
};

function formatDate(ts: unknown): string {
    if (!ts) return "—";
    if (typeof ts === "string") return ts;
    const d = ts instanceof Date ? ts : (ts as { toDate?: () => Date })?.toDate?.();
    return d ? d.toLocaleDateString() : "—";
}

function formatBool(value: boolean | string | undefined): string {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

export function ProfileSidebarCard({ member, clubId }: ProfileSidebarCardProps) {
    const pp = member.playerProfile;
    const isPlayer = member.segment === "player";

    return (
        <div className="space-y-4">
            {/* Top profile info */}
            <div className="flex flex-col items-center rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                <Avatar
                    src={member.profileImageUrl}
                    initials={member.initials}
                    alt={member.name}
                    className="size-20 bg-zinc-700 text-white"
                />
                <Subheading level={2} className="mt-3 text-center text-base font-semibold text-white">
                    {member.name}
                </Subheading>
                {(member.roleName || member.title) && (
                    <Text className="mt-1 text-center text-sm text-zinc-400">
                        {[member.roleName, member.title].filter(Boolean).join(" · ")}
                    </Text>
                )}

                {/* Quick actions */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link to={`/team/${member.id}/edit`}>
                        <Button plain className="!px-3 !py-1.5 text-sm">
                            <PencilIcon className="size-4" data-slot="icon" />
                            Edit
                        </Button>
                    </Link>
                    <Button plain className="!px-3 !py-1.5 text-sm">
                        <DocumentTextIcon className="size-4" data-slot="icon" />
                        Invoice
                    </Button>
                    <Button plain className="!px-3 !py-1.5 text-sm">
                        <UserGroupIcon className="size-4" data-slot="icon" />
                        Group
                    </Button>
                    <Menu as="div" className="relative">
                        <MenuButton as={Button} plain className="!px-3 !py-1.5 text-sm">
                            <EllipsisHorizontalIcon className="size-4" data-slot="icon" />
                            More
                        </MenuButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <MenuItems
                                anchor="bottom"
                                className="z-50 mt-1 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg"
                            >
                                <MenuItem>
                                    <Link
                                        to={`/team/${member.id}/edit`}
                                        className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                    >
                                        Edit profile
                                    </Link>
                                </MenuItem>
                            </MenuItems>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {/* Details section */}
            <DetailSection title="Details">
                <DetailRow label="Email" value={member.email} />
                <DetailRow label="Gender" value={pp?.gender} />
                <DetailRow label="Birth date" value={member.dateOfBirth} />
                <DetailRow
                    label="Age"
                    value={
                        member.dateOfBirth
                            ? (() => {
                                  const birth = new Date(member.dateOfBirth!);
                                  const today = new Date();
                                  const age = today.getFullYear() - birth.getFullYear();
                                  return String(age);
                              })()
                            : undefined
                    }
                />
                <DetailRow label="Phone" value={member.phoneNumber} />
                <DetailRow
                    label="Address"
                    value={pp?.billingAddress ? formatAddress(pp.billingAddress) : undefined}
                />
                <DetailRow label="Country" value={pp?.billingAddress?.country} />
            </DetailSection>

            {/* Billing contact - only if player or has billing */}
            {(isPlayer || pp?.billingAddress) && (
                <DetailSection title="Billing contact">
                    {pp?.billingAddress ? (
                        <div className="space-y-1 text-sm text-zinc-300">
                            <p>{formatAddress(pp.billingAddress)}</p>
                            <Button plain className="!p-0 text-amber-500 hover:text-amber-400">
                                View billing contact
                            </Button>
                        </div>
                    ) : (
                        <Button plain className="text-sm text-amber-500 hover:text-amber-400">
                            Select billing contact
                        </Button>
                    )}
                </DetailSection>
            )}

            {/* Consents - player only */}
            {isPlayer && (pp?.imageConsent !== undefined || pp?.codeOfConductAccepted !== undefined || pp?.hasSiblingsAtClub !== undefined) && (
                <DetailSection title="Consents">
                    <DetailRow label="Image consent" value={formatBool(pp?.imageConsent)} />
                    <DetailRow label="Code of conduct" value={formatBool(pp?.codeOfConductAccepted)} />
                    <DetailRow label="Siblings at club" value={formatBool(pp?.hasSiblingsAtClub)} />
                </DetailSection>
            )}

            {/* More details - player only */}
            {isPlayer && (pp?.englishFullName || pp?.arabicFullName || pp?.phoneNumber2 || pp?.phoneNumber3 || pp?.faNumber || pp?.kitSize) && (
                <DetailSection title="More Details">
                    <DetailRow label="English full name" value={pp?.englishFullName} />
                    <DetailRow label="Arabic full name" value={pp?.arabicFullName} />
                    <DetailRow label="Phone 2" value={pp?.phoneNumber2} />
                    <DetailRow label="Phone 3" value={pp?.phoneNumber3} />
                    <DetailRow label="FA number" value={pp?.faNumber} />
                    <DetailRow label="Kit size" value={pp?.kitSize} />
                </DetailSection>
            )}

            {/* Medical contact - player only */}
            {isPlayer && pp?.emergencyContactNumber && (
                <DetailSection title="Medical Contact Information">
                    <DetailRow label="Emergency contact" value={pp.emergencyContactNumber} />
                </DetailSection>
            )}

            {/* Footer metadata */}
            <div className="space-y-1 border-t border-zinc-700 pt-4 text-xs text-zinc-500">
                <p>Created: {formatDate(member.createdAt)}</p>
                <p>Last update: {formatDate(member.updatedAt)}</p>
            </div>
        </div>
    );
}

function DetailSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <Subheading level={3} className="mb-3 text-sm font-semibold text-white">
                {title}
            </Subheading>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-zinc-500">{label}</span>
            <span className="text-right text-zinc-300">{value || "—"}</span>
        </div>
    );
}

function formatAddress(addr: NonNullable<PlayerProfile["billingAddress"]>): string {
    const parts = [
        addr.line1,
        addr.line2,
        addr.city,
        addr.state,
        addr.postalCode,
        addr.country,
    ].filter(Boolean);
    return parts.join(", ") || "—";
}
