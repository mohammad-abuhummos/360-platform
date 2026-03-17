import { Input } from "../input";
import { Select } from "../select";
import { Checkbox, CheckboxField, CheckboxGroup } from "../checkbox";
import { Subheading } from "../heading";
import type { Role } from "~/lib/firestore-roles";
import type { MemberSegment, PlayerProfile } from "~/lib/firestore-team";

const segmentOptions: { value: MemberSegment; label: string }[] = [
    { value: "player", label: "Player" },
    { value: "staff", label: "Staff Member" },
];

export type TeamProfileFormValues = {
    name: string;
    email: string;
    roleId: string;
    roleName: string;
    segment: MemberSegment;
    title: string;
    phoneNumber: string;
    dateOfBirth: string;
    status: "active" | "invited" | "inactive";
    playerProfile: Partial<PlayerProfile>;
};

type TeamProfileFormProps = {
    values: TeamProfileFormValues;
    onChange: (values: TeamProfileFormValues) => void;
    roles: Role[];
    rolesLoading?: boolean;
    rolesError?: string | null;
    profileImageUrl?: string | null;
    profileImageFile: File | null;
    onProfileImageChange: (file: File | null) => void;
    emailReadOnly?: boolean;
    /** Player-only: headshot image */
    headshotImageUrl?: string | null;
    headshotImageFile?: File | null;
    onHeadshotImageChange?: (file: File | null) => void;
    /** Player-only: additional images */
    additionalImageUrls?: string[];
    additionalImageFiles?: File[];
    onAdditionalImagesChange?: (files: File[]) => void;
};

export function TeamProfileForm({
    values,
    onChange,
    roles,
    rolesLoading,
    rolesError,
    profileImageUrl,
    profileImageFile,
    onProfileImageChange,
    emailReadOnly = false,
    headshotImageUrl,
    headshotImageFile,
    onHeadshotImageChange,
    additionalImageUrls = [],
    additionalImageFiles = [],
    onAdditionalImagesChange,
}: TeamProfileFormProps) {
    const update = <K extends keyof TeamProfileFormValues>(key: K, value: TeamProfileFormValues[K]) => {
        onChange({ ...values, [key]: value });
    };

    const updatePlayerField = <K extends keyof PlayerProfile>(key: K, value: PlayerProfile[K]) => {
        onChange({ ...values, playerProfile: { ...values.playerProfile, [key]: value } });
    };

    const selectedRole = roles.find((r) => r.id === values.roleId);
    const showPlayerDetails = selectedRole?.name === "Player";

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={values.name}
                        onChange={(e) => update("name", e.target.value)}
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
                        value={values.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="john@example.com"
                        required
                        readOnly={emailReadOnly}
                        className={emailReadOnly ? "bg-zinc-800/50" : undefined}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Member Type
                    </label>
                    <Select
                        value={values.segment}
                        onChange={(e) => update("segment", e.target.value as MemberSegment)}
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
                        Role <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={values.roleId}
                        onChange={(e) => {
                            const role = roles.find((r) => r.id === e.target.value);
                            onChange({
                                ...values,
                                roleId: e.target.value,
                                roleName: role?.name ?? "",
                            });
                        }}
                        disabled={rolesLoading || roles.length === 0}
                    >
                        <option value="">Select role</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </Select>
                    {rolesError && (
                        <p className="mt-1 text-xs text-red-400">{rolesError}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Title / Position
                    </label>
                    <Input
                        type="text"
                        value={values.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="e.g., Forward · U18"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Status
                    </label>
                    <Select
                        value={values.status}
                        onChange={(e) => update("status", e.target.value as TeamProfileFormValues["status"])}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="invited">Invited</option>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Phone Number
                    </label>
                    <Input
                        type="tel"
                        value={values.phoneNumber}
                        onChange={(e) => update("phoneNumber", e.target.value)}
                        placeholder="+962 7X XXX XXXX"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Date of Birth
                    </label>
                    <Input
                        type="date"
                        value={values.dateOfBirth}
                        onChange={(e) => update("dateOfBirth", e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Profile Image
                </label>
                {profileImageUrl && (
                    <div className="mb-2">
                        <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="size-20 rounded-lg object-cover"
                        />
                    </div>
                )}
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onProfileImageChange(e.target.files?.[0] ?? null)}
                />
            </div>

            {showPlayerDetails && (
                <PlayerFieldsSection
                    playerProfile={values.playerProfile}
                    onUpdate={updatePlayerField}
                    headshotImageUrl={headshotImageUrl}
                    headshotImageFile={headshotImageFile}
                    onHeadshotImageChange={onHeadshotImageChange}
                    additionalImageUrls={additionalImageUrls}
                    additionalImageFiles={additionalImageFiles}
                    onAdditionalImagesChange={onAdditionalImagesChange}
                />
            )}
        </div>
    );
}

function PlayerFieldsSection({
    playerProfile,
    onUpdate,
    headshotImageUrl,
    headshotImageFile,
    onHeadshotImageChange,
    additionalImageUrls = [],
    additionalImageFiles = [],
    onAdditionalImagesChange,
}: {
    playerProfile: Partial<PlayerProfile>;
    onUpdate: <K extends keyof PlayerProfile>(key: K, value: PlayerProfile[K]) => void;
    headshotImageUrl?: string | null;
    headshotImageFile?: File | null;
    onHeadshotImageChange?: (file: File | null) => void;
    additionalImageUrls?: string[];
    additionalImageFiles?: File[];
    onAdditionalImagesChange?: (files: File[]) => void;
}) {
    return (
        <div className="space-y-6 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <Subheading level={3} className="text-sm font-semibold text-white">
                Player Details (optional)
            </Subheading>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">First Name</label>
                    <Input
                        value={playerProfile.firstName ?? ""}
                        onChange={(e) => onUpdate("firstName", e.target.value)}
                        placeholder="First name"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Last Name</label>
                    <Input
                        value={playerProfile.lastName ?? ""}
                        onChange={(e) => onUpdate("lastName", e.target.value)}
                        placeholder="Last name"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Gender</label>
                    <Select
                        value={playerProfile.gender ?? ""}
                        onChange={(e) => onUpdate("gender", e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </Select>
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Emergency Contact</label>
                    <Input
                        type="tel"
                        value={playerProfile.emergencyContactNumber ?? ""}
                        onChange={(e) => onUpdate("emergencyContactNumber", e.target.value)}
                    />
                </div>
            </div>

            <div>
                <Subheading level={3} className="mb-2 text-sm font-semibold text-white">
                    More Details
                </Subheading>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">English Full Name</label>
                        <Input
                            value={playerProfile.englishFullName ?? ""}
                            onChange={(e) => onUpdate("englishFullName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Arabic Full Name</label>
                        <Input
                            value={playerProfile.arabicFullName ?? ""}
                            onChange={(e) => onUpdate("arabicFullName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Phone 2</label>
                        <Input
                            type="tel"
                            value={playerProfile.phoneNumber2 ?? ""}
                            onChange={(e) => onUpdate("phoneNumber2", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Phone 3</label>
                        <Input
                            type="tel"
                            value={playerProfile.phoneNumber3 ?? ""}
                            onChange={(e) => onUpdate("phoneNumber3", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Subheading level={3} className="mb-2 text-sm font-semibold text-white">
                    Consents
                </Subheading>
                <CheckboxGroup className="space-y-2">
                    <CheckboxField>
                        <Checkbox
                            checked={!!playerProfile.imageConsent}
                            onChange={() => onUpdate("imageConsent", !playerProfile.imageConsent)}
                        />
                        <span className="text-sm text-zinc-300">Image consent</span>
                    </CheckboxField>
                    <CheckboxField>
                        <Checkbox
                            checked={!!playerProfile.hasSiblingsAtClub}
                            onChange={() => onUpdate("hasSiblingsAtClub", !playerProfile.hasSiblingsAtClub)}
                        />
                        <span className="text-sm text-zinc-300">Siblings at club</span>
                    </CheckboxField>
                    <CheckboxField>
                        <Checkbox
                            checked={!!playerProfile.codeOfConductAccepted}
                            onChange={() => onUpdate("codeOfConductAccepted", !playerProfile.codeOfConductAccepted)}
                        />
                        <span className="text-sm text-zinc-300">Code of conduct accepted</span>
                    </CheckboxField>
                </CheckboxGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Kit Size</label>
                    <Input
                        value={playerProfile.kitSize ?? ""}
                        onChange={(e) => onUpdate("kitSize", e.target.value)}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">FA Number</label>
                    <Input
                        value={playerProfile.faNumber ?? ""}
                        onChange={(e) => onUpdate("faNumber", e.target.value)}
                    />
                </div>
            </div>

            {(onHeadshotImageChange || onAdditionalImagesChange) && (
                <div>
                    <Subheading level={3} className="mb-2 text-sm font-semibold text-white">
                        Images
                    </Subheading>
                    <div className="space-y-4">
                        {onHeadshotImageChange && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                                    Headshot Image
                                </label>
                                {(headshotImageUrl || headshotImageFile) && (
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {headshotImageUrl && (
                                            <img
                                                src={headshotImageUrl}
                                                alt="Headshot"
                                                className="size-16 rounded-lg object-cover"
                                            />
                                        )}
                                        {headshotImageFile && !headshotImageUrl && (
                                            <span className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                                                {headshotImageFile.name}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        onHeadshotImageChange(e.target.files?.[0] ?? null)
                                    }
                                />
                            </div>
                        )}
                        {onAdditionalImagesChange && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                                    Additional Images
                                </label>
                                {(additionalImageUrls?.length > 0 || additionalImageFiles?.length > 0) && (
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {additionalImageUrls?.map((url, i) => (
                                            <img
                                                key={`url-${i}`}
                                                src={url}
                                                alt={`Additional ${i + 1}`}
                                                className="size-16 rounded-lg object-cover"
                                            />
                                        ))}
                                        {additionalImageFiles?.map((f, i) => (
                                            <span
                                                key={`file-${i}`}
                                                className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300"
                                            >
                                                {f.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files ?? []);
                                        if (files.length > 0) {
                                            onAdditionalImagesChange([
                                                ...additionalImageFiles,
                                                ...files,
                                            ]);
                                        }
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
