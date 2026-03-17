import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/team.$id.edit";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { TeamProfileForm, type TeamProfileFormValues } from "../components/team/team-profile-form";
import { useAuth } from "../context/auth-context";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
    getClubMemberById,
    updateClubMember,
    uploadMemberProfileImage,
    uploadMemberHeadshotImage,
    uploadMemberAdditionalImage,
} from "../lib/firestore-team";
import { getClubRoles, type Role } from "../lib/firestore-roles";

const initialValues: TeamProfileFormValues = {
    name: "",
    email: "",
    roleId: "",
    roleName: "",
    segment: "player",
    title: "",
    phoneNumber: "",
    dateOfBirth: "",
    status: "active",
    playerProfile: {},
};

export function meta(_args: Route.MetaArgs) {
    return [
        { title: "Edit Profile · Team · 360 Dashboard" },
        { name: "description", content: "Edit team member profile." },
    ];
}

export default function TeamEdit() {
    const { id } = useParams<{ id: string }>();
    const { activeClub } = useAuth();
    const navigate = useNavigate();
    const [values, setValues] = useState<TeamProfileFormValues>(initialValues);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [headshotImageUrl, setHeadshotImageUrl] = useState<string | null>(null);
    const [headshotImageFile, setHeadshotImageFile] = useState<File | null>(null);
    const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [rolesError, setRolesError] = useState<string | null>(null);
    const [memberLoading, setMemberLoading] = useState(true);
    const [memberError, setMemberError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeClub?.id || !id) return;
        setMemberLoading(true);
        setMemberError(null);
        getClubMemberById(activeClub.id, id)
            .then((member) => {
                if (member) {
                    setValues({
                        name: member.name,
                        email: member.email,
                        roleId: member.roleId ?? "",
                        roleName: member.roleName ?? "",
                        segment: member.segment ?? "player",
                        title: member.title ?? "",
                        phoneNumber: member.phoneNumber ?? "",
                        dateOfBirth: member.dateOfBirth ?? "",
                        status: member.status === "invited" ? "invited" : member.status === "inactive" ? "inactive" : "active",
                        playerProfile: member.playerProfile ?? {},
                    });
                    setProfileImageUrl(member.profileImageUrl ?? null);
                    setHeadshotImageUrl(member.playerProfile?.headshotImageUrl ?? null);
                    setAdditionalImageUrls(member.playerProfile?.additionalImageUrls ?? []);
                } else {
                    setMemberError("Member not found");
                }
            })
            .catch((err) => {
                setMemberError(err instanceof Error ? err.message : "Failed to load member");
            })
            .finally(() => setMemberLoading(false));
    }, [activeClub?.id, id]);

    useEffect(() => {
        if (!activeClub?.id) return;
        setRolesLoading(true);
        setRolesError(null);
        getClubRoles(activeClub.id)
            .then(setRoles)
            .catch((err) => {
                setRolesError(err instanceof Error ? err.message : "Failed to load roles");
                setRoles([]);
            })
            .finally(() => setRolesLoading(false));
    }, [activeClub?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeClub || !id) return;

        if (!values.name.trim()) {
            setError("Name is required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const selectedRole = roles.find((r) => r.id === values.roleId);
            const basePlayerProfile =
                selectedRole?.name === "Player"
                    ? {
                          ...values.playerProfile,
                          headshotImageUrl: headshotImageUrl ?? values.playerProfile?.headshotImageUrl,
                          additionalImageUrls:
                              additionalImageUrls.length > 0
                                  ? additionalImageUrls
                                  : values.playerProfile?.additionalImageUrls ?? [],
                      }
                    : null;
            await updateClubMember(activeClub.id, id, {
                name: values.name.trim(),
                roleId: values.roleId || null,
                roleName: selectedRole?.name ?? null,
                segment: values.segment,
                title: values.title.trim() || null,
                phoneNumber: values.phoneNumber.trim() || null,
                dateOfBirth: values.dateOfBirth.trim() || null,
                status: values.status,
                playerProfile: basePlayerProfile,
            });

            if (profileImageFile) {
                const url = await uploadMemberProfileImage(activeClub.id, id, profileImageFile);
                await updateClubMember(activeClub.id, id, { profileImageUrl: url });
            }

            if (selectedRole?.name === "Player") {
                let headshotUrl: string | undefined;
                let additionalUrls: string[] | undefined;
                if (headshotImageFile) {
                    headshotUrl = await uploadMemberHeadshotImage(
                        activeClub.id,
                        id,
                        headshotImageFile
                    );
                }
                if (additionalImageFiles.length > 0) {
                    additionalUrls = [...additionalImageUrls];
                    for (let i = 0; i < additionalImageFiles.length; i++) {
                        const url = await uploadMemberAdditionalImage(
                            activeClub.id,
                            id,
                            additionalImageFiles[i],
                            additionalImageUrls.length + i
                        );
                        additionalUrls.push(url);
                    }
                }
                if (headshotUrl || additionalUrls) {
                    await updateClubMember(activeClub.id, id, {
                        playerProfile: {
                            ...basePlayerProfile,
                            ...(headshotUrl && { headshotImageUrl: headshotUrl }),
                            ...(additionalUrls && { additionalImageUrls: additionalUrls }),
                        },
                    });
                }
            }

            toast.success("Profile updated successfully");
            navigate("/team");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update profile";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!activeClub) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <Heading level={2} className="text-lg font-semibold text-white">
                        No club selected
                    </Heading>
                </div>
            </DashboardLayout>
        );
    }

    if (memberLoading) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="size-8 animate-spin text-amber-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <Text className="text-sm text-zinc-400">Loading profile...</Text>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (memberError) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center">
                    <Heading level={2} className="text-lg font-semibold text-white">
                        {memberError}
                    </Heading>
                    <Link to="/team">
                        <Button className="mt-4">Back to Team</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/team"
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        aria-label="Back to team"
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <Heading level={1} className="text-2xl font-bold text-white">
                            Edit Profile
                        </Heading>
                        <Text className="text-sm text-zinc-500">{activeClub.name}</Text>
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <TeamProfileForm
                            values={values}
                            onChange={setValues}
                            roles={roles}
                            rolesLoading={rolesLoading}
                            rolesError={rolesError}
                            profileImageUrl={profileImageUrl}
                            profileImageFile={profileImageFile}
                            onProfileImageChange={setProfileImageFile}
                            emailReadOnly
                            headshotImageUrl={headshotImageUrl}
                            headshotImageFile={headshotImageFile}
                            onHeadshotImageChange={setHeadshotImageFile}
                            additionalImageUrls={additionalImageUrls}
                            additionalImageFiles={additionalImageFiles}
                            onAdditionalImagesChange={setAdditionalImageFiles}
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                plain
                                onClick={() => navigate("/team")}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" color="amber" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
