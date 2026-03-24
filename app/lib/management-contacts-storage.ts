import type { ClubMember } from "~/lib/firestore-team";

export type ManagementContact = {
  id: string;
  /** Firestore club members subdocument id — profile URL is `/team/${teamMemberId}` */
  teamMemberId: string;
  name: string;
  initials: string;
  email: string;
  emailLocked?: boolean;
  billingEmail: string;
  dateOfBirth: string;
  age: number;
  created: string;
  role: string;
};

const STORAGE_PREFIX = "management-contacts-v1";

export function managementContactsStorageKey(clubId: string): string {
  return `${STORAGE_PREFIX}:${clubId}`;
}

function ageFromDateOfBirth(dob: string | null | undefined): number {
  if (!dob?.trim()) return 0;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

function formatCreatedLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function clubMemberToManagementContact(member: ClubMember): ManagementContact {
  const email = member.email?.trim() ?? "";
  const dob = member.dateOfBirth?.trim() ?? "";
  const roleLabel = member.roleName || member.role || "—";

  return {
    id: member.id,
    teamMemberId: member.id,
    name: member.name,
    initials: member.initials,
    email,
    emailLocked: Boolean(email),
    billingEmail: email,
    dateOfBirth: dob,
    age: ageFromDateOfBirth(dob),
    created: formatCreatedLabel(),
    role: roleLabel,
  };
}

export function loadManagementContacts(clubId: string | undefined): ManagementContact[] {
  if (!clubId || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(managementContactsStorageKey(clubId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManagementContact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveManagementContacts(clubId: string, contacts: ManagementContact[]): void {
  if (!clubId || typeof window === "undefined") return;
  localStorage.setItem(managementContactsStorageKey(clubId), JSON.stringify(contacts));
}

export function addContactsFromTeamMembers(
  clubId: string,
  members: ClubMember[],
  existing: ManagementContact[]
): ManagementContact[] {
  const byTeamId = new Set(existing.map((c) => c.teamMemberId));
  const next = [...existing];
  for (const m of members) {
    if (byTeamId.has(m.id)) continue;
    byTeamId.add(m.id);
    next.push(clubMemberToManagementContact(m));
  }
  saveManagementContacts(clubId, next);
  return next;
}

export function removeManagementContact(clubId: string, teamMemberId: string, existing: ManagementContact[]): ManagementContact[] {
  const next = existing.filter((c) => c.teamMemberId !== teamMemberId);
  saveManagementContacts(clubId, next);
  return next;
}
