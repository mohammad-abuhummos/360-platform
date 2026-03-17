import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/team.create";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { TeamProfileForm, type TeamProfileFormValues } from "../components/team/team-profile-form";
import { useAuth } from "../context/auth-context";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
    inviteClubMember,
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
        { title: "Create Profile · Team · 360 Dashboard" },
        { name: "description", content: "Add a new team member." },
    ];
}

export default function TeamCreate() {
    const { activeClub } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const segmentParam = searchParams.get("segment");
    const defaultSegment = segmentParam === "staff" ? "staff" : "player";
    const [values, setValues] = useState<TeamProfileFormValues>({
        ...initialValues,
        segment: defaultSegment,
    });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [headshotImageFile, setHeadshotImageFile] = useState<File | null>(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [rolesError, setRolesError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeClub?.id) return;
        setRolesLoading(true);
        setRolesError(null);
        getClubRoles(activeClub.id)
            .then((r) => {
                setRoles(r);
                if (r.length > 0) {
                    setValues((v) => (v.roleId ? v : { ...v, roleId: r[0].id, roleName: r[0].name }));
                }
            })
            .catch((err) => {
                setRolesError(err instanceof Error ? err.message : "Failed to load roles");
                setRoles([]);
            })
            .finally(() => setRolesLoading(false));
    }, [activeClub?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeClub) return;

        if (!values.name.trim() || !values.email.trim()) {
            setError("Name and email are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!values.roleId && roles.length > 0) {
            setError("Please select a role");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const selectedRole = roles.find((r) => r.id === values.roleId);
            const memberId = await inviteClubMember(activeClub.id, {
                name: values.name.trim(),
                email: values.email.trim(),
                roleId: values.roleId || "",
                roleName: selectedRole?.name,
                segment: values.segment,
                title: values.title.trim() || undefined,
                phoneNumber: values.phoneNumber.trim() || undefined,
                dateOfBirth: values.dateOfBirth.trim() || undefined,
                status: values.status,
                playerProfile: selectedRole?.name === "Player" ? values.playerProfile : undefined,
            });

            if (profileImageFile && memberId) {
                const url = await uploadMemberProfileImage(activeClub.id, memberId, profileImageFile);
                await updateClubMember(activeClub.id, memberId, { profileImageUrl: url });
            }

            if (selectedRole?.name === "Player" && memberId) {
                let headshotUrl: string | undefined;
                let additionalUrls: string[] | undefined;
                if (headshotImageFile) {
                    headshotUrl = await uploadMemberHeadshotImage(
                        activeClub.id,
                        memberId,
                        headshotImageFile
                    );
                }
                if (additionalImageFiles.length > 0) {
                    additionalUrls = [];
                    for (let i = 0; i < additionalImageFiles.length; i++) {
                        const url = await uploadMemberAdditionalImage(
                            activeClub.id,
                            memberId,
                            additionalImageFiles[i],
                            i
                        );
                        additionalUrls.push(url);
                    }
                }
                if (headshotUrl || additionalUrls) {
                    await updateClubMember(activeClub.id, memberId, {
                        playerProfile: {
                            ...values.playerProfile,
                            ...(headshotUrl && { headshotImageUrl: headshotUrl }),
                            ...(additionalUrls && { additionalImageUrls: additionalUrls }),
                        },
                    });
                }
            }

            toast.success("Profile created successfully");
            navigate("/team");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create profile";
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
                    <Text className="mt-2 text-sm text-zinc-400">
                        Select a club from the sidebar to create a profile.
                    </Text>
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
                            Create Profile
                        </Heading>
                        <Text className="text-sm text-zinc-500">{activeClub.name}</Text>
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    {roles.length === 0 && !rolesLoading && (
                        <div className="mb-4 rounded-lg bg-amber-500/20 p-3 text-sm text-amber-400">
                            No roles found. Create roles in Settings → Roles & Permissions first.
                        </div>
                    )}

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
                            profileImageFile={profileImageFile}
                            onProfileImageChange={setProfileImageFile}
                            headshotImageFile={headshotImageFile}
                            onHeadshotImageChange={setHeadshotImageFile}
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
                            <Button
                                type="submit"
                                color="amber"
                                disabled={submitting || roles.length === 0}
                            >
                                {submitting ? "Creating..." : "Create Profile"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
