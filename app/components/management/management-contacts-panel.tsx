import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { Button } from "../button";
import { Input, InputGroup } from "../input";
import { Avatar } from "../avatar";
import { Checkbox } from "../checkbox";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "../dialog";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";
import { subscribeToClubMembers } from "~/lib/firestore-team";
import type { ClubMember } from "~/lib/firestore-team";
import {
  type ManagementContact,
  loadManagementContacts,
  addContactsFromTeamMembers,
} from "~/lib/management-contacts-storage";

type Props = {
  clubId: string;
  /** Show Role column (e.g. organization view) */
  showRoleColumn?: boolean;
};

export function ManagementContactsPanel({ clubId, showRoleColumn }: Props) {
  const [contacts, setContacts] = useState<ManagementContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof ManagementContact | null>("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ClubMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [teamSearch, setTeamSearch] = useState("");

  const reloadFromStorage = useCallback(() => {
    setContacts(loadManagementContacts(clubId));
  }, [clubId]);

  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  useEffect(() => {
    if (!addOpen || !clubId) return;
    const unsub = subscribeToClubMembers(
      clubId,
      (members) => {
        setTeamMembers(members.filter((m) => m.status === "active"));
      },
      () => {
        setTeamMembers([]);
      }
    );
    return () => unsub();
  }, [addOpen, clubId]);

  const notYetContacts = useMemo(() => {
    const inContacts = new Set(contacts.map((c) => c.teamMemberId));
    return teamMembers.filter((m) => !inContacts.has(m.id));
  }, [teamMembers, contacts]);

  const filteredTeamPick = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return notYetContacts;
    return notYetContacts.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [notYetContacts, teamSearch]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const lower = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.billingEmail.toLowerCase().includes(lower) ||
        c.role.toLowerCase().includes(lower)
    );
  }, [contacts, searchQuery]);

  const sortedContacts = useMemo(() => {
    if (!sortField) return filteredContacts;
    return [...filteredContacts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
      if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredContacts, sortField, sortDirection]);

  const handleSort = (field: keyof ManagementContact) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (id: string, checked: boolean) => {
    const next = new Set(selectedContacts);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedContacts(next);
  };

  const handleOpenAdd = () => {
    setSelectedMemberIds(new Set());
    setTeamSearch("");
    setAddOpen(true);
  };

  const handleConfirmAdd = () => {
    const toAdd = teamMembers.filter((m) => selectedMemberIds.has(m.id));
    if (toAdd.length === 0) {
      setAddOpen(false);
      return;
    }
    const next = addContactsFromTeamMembers(clubId, toAdd, contacts);
    setContacts(next);
    setAddOpen(false);
    setSelectedMemberIds(new Set());
  };

  const toggleMember = (id: string) => {
    const next = new Set(selectedMemberIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMemberIds(next);
  };

  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;
  const someSelected = selectedContacts.size > 0 && selectedContacts.size < contacts.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <InputGroup className="max-w-md">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Button outline className="text-sm">
            <FilterIcon className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button outline className="text-sm">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button color="blue" className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenAdd}>
            <UserPlusIcon className="h-4 w-4" />
            Add from team
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {sortField === "name" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortField === "email" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("billingEmail")}
                  >
                    Billing email
                    {sortField === "billingEmail" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("dateOfBirth")}
                  >
                    Date of birth
                    {sortField === "dateOfBirth" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("age")}
                  >
                    Age
                    {sortField === "age" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                    onClick={() => handleSort("created")}
                  >
                    Created
                    {sortField === "created" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                  </button>
                </th>
                {showRoleColumn ? (
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("role")}
                    >
                      Role
                      {sortField === "role" && <SortIcon direction={sortDirection} className="h-4 w-4" />}
                    </button>
                  </th>
                ) : null}
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sortedContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={showRoleColumn ? 9 : 8}
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    No contacts yet. Use &quot;Add from team&quot; to add people from your team roster.
                  </td>
                </tr>
              ) : (
                sortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedContacts.has(contact.id)}
                        onChange={(checked) => handleSelectContact(contact.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={contact.initials}
                          className="h-8 w-8 bg-zinc-900 text-white dark:bg-zinc-700"
                        />
                        <Link
                          to={`/team/${contact.teamMemberId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
                        >
                          {contact.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {contact.email ? (
                          <>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.email}</span>
                            {contact.emailLocked && <LockIcon className="h-4 w-4 text-zinc-400" />}
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.billingEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.dateOfBirth || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-900 dark:text-white">{contact.age || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.created}</span>
                    </td>
                    {showRoleColumn ? (
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{contact.role}</span>
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <Menu>
                        <MenuButton className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                          <EllipsisIcon className="h-5 w-5" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                          <MenuItem>
                            {({ focus }) => (
                              <Link
                                to={`/team/${contact.teamMemberId}`}
                                className={clsx(
                                  "block w-full px-4 py-2 text-left text-sm",
                                  focus ? "bg-zinc-100 dark:bg-zinc-800" : ""
                                )}
                              >
                                View profile
                              </Link>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {sortedContacts.length} contact{sortedContacts.length === 1 ? "" : "s"}
        {searchQuery.trim() ? ` (filtered)` : ""}
      </p>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} size="lg">
        <DialogTitle>Add contacts from team</DialogTitle>
        <DialogDescription>
          Only people on your team roster can be added as contacts. Select members below; they will appear in
          Contacts and stay linked to their team profile.
        </DialogDescription>
        <DialogBody>
          <InputGroup className="mb-4">
            <Input
              type="search"
              placeholder="Search team members…"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
            />
          </InputGroup>
          {filteredTeamPick.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {notYetContacts.length === 0
                ? "Everyone on your team is already in contacts, or there are no active team members."
                : "No matches for your search."}
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
              {filteredTeamPick.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80">
                    <Checkbox
                      checked={selectedMemberIds.has(m.id)}
                      onChange={() => toggleMember(m.id)}
                    />
                    <Avatar initials={m.initials} className="h-8 w-8 bg-zinc-200 text-zinc-800" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{m.name}</p>
                      <p className="truncate text-xs text-zinc-500">{m.email || "No email"}</p>
                    </div>
                    <span className="text-xs text-zinc-500">{m.roleName || m.role}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </DialogBody>
        <DialogActions>
          <Button outline onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleConfirmAdd} disabled={selectedMemberIds.size === 0}>
            Add {selectedMemberIds.size > 0 ? `(${selectedMemberIds.size})` : ""}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function SortIcon({ direction, className }: { direction: "asc" | "desc"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      {direction === "asc" ? (
        <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
