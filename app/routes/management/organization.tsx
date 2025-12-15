import { useState, useMemo } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input, InputGroup } from "../../components/input";
import { Avatar } from "../../components/avatar";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "../../components/dialog";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";

// Types
type OrganizationType = {
  id: string;
  name: string;
  groupCode: string;
  groups: number;
  users: number;
  players: number;
  adminsStaff: number;
  gender: string;
  birthYear: string;
  sport: string;
  children?: OrganizationType[];
};

// Sample data matching the image
const initialOrganizations: OrganizationType[] = [
  {
    id: "1",
    name: "Jordan Knights Football Club",
    groupCode: "I1AFIT",
    groups: 46,
    users: 17,
    players: 1,
    adminsStaff: 16,
    gender: "Unknown",
    birthYear: "",
    sport: "Soccer",
    children: [
      {
        id: "1-1",
        name: "Annual Tournament",
        groupCode: "HCA9H4",
        groups: 7,
        users: 1,
        players: 1,
        adminsStaff: 0,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
        children: [
          {
            id: "1-1-1",
            name: "Jordan Cup 2025",
            groupCode: "CFRECB",
            groups: 6,
            users: 41,
            players: 22,
            adminsStaff: 19,
            gender: "Unknown",
            birthYear: "",
            sport: "Soccer",
          },
        ],
      },
      {
        id: "1-2",
        name: "Petra",
        groupCode: "97Z9F7",
        groups: 0,
        users: 14,
        players: 9,
        adminsStaff: 5,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-3",
        name: "Al-Aqaba",
        groupCode: "MSYVZV",
        groups: 0,
        users: 15,
        players: 9,
        adminsStaff: 6,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-4",
        name: "Al-Ramtha",
        groupCode: "RBZRBC",
        groups: 0,
        users: 14,
        players: 9,
        adminsStaff: 5,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-5",
        name: "Al-Salt",
        groupCode: "HW8HW6",
        groups: 0,
        users: 17,
        players: 11,
        adminsStaff: 6,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-6",
        name: "Irbid",
        groupCode: "JW6X5J",
        groups: 0,
        users: 15,
        players: 10,
        adminsStaff: 5,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-7",
        name: "Amman",
        groupCode: "9Y9YVN",
        groups: 0,
        users: 16,
        players: 12,
        adminsStaff: 4,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-8",
        name: "Off Field",
        groupCode: "L99RUL",
        groups: 3,
        users: 0,
        players: 0,
        adminsStaff: 0,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-9",
        name: "Committee",
        groupCode: "RWWZ7W",
        groups: 0,
        users: 0,
        players: 0,
        adminsStaff: 0,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-10",
        name: "Coaches",
        groupCode: "PLBPLA",
        groups: 0,
        users: 15,
        players: 0,
        adminsStaff: 15,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-11",
        name: "Facilities & Pitch Bookings",
        groupCode: "YDD6YD",
        groups: 0,
        users: 0,
        players: 0,
        adminsStaff: 0,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-12",
        name: "On Field",
        groupCode: "PAXPW1",
        groups: 27,
        users: 1,
        players: 0,
        adminsStaff: 1,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
      {
        id: "1-13",
        name: "Academy Teams",
        groupCode: "PELMLF",
        groups: 13,
        users: 6,
        players: 0,
        adminsStaff: 6,
        gender: "Unknown",
        birthYear: "",
        sport: "Soccer",
      },
    ],
  },
];

export default function Organization() {
  const [organizations, setOrganizations] = useState<OrganizationType[]>(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1"]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: "",
    groupCode: "",
    sport: "Soccer",
    gender: "Unknown",
  });

  // Toggle expansion of organization
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Collapse all organizations
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter organizations based on search
  const filterOrganizations = (orgs: OrganizationType[], query: string): OrganizationType[] => {
    if (!query.trim()) return orgs;

    const lowerQuery = query.toLowerCase();
    return orgs
      .map((org) => {
        const matchesSearch =
          org.name.toLowerCase().includes(lowerQuery) ||
          org.groupCode.toLowerCase().includes(lowerQuery) ||
          org.sport.toLowerCase().includes(lowerQuery);

        const filteredChildren = org.children
          ? filterOrganizations(org.children, query)
          : [];

        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...org,
            children: filteredChildren.length > 0 ? filteredChildren : org.children,
          };
        }
        return null;
      })
      .filter((org) => org !== null);
  };

  const filteredOrganizations = useMemo(
    () => filterOrganizations(organizations, searchQuery),
    [organizations, searchQuery]
  );

  // Generate random group code
  const generateGroupCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  // Handle create organization
  const handleCreateOrg = () => {
    if (!newOrg.name.trim()) return;

    const newOrganization: OrganizationType = {
      id: Date.now().toString(),
      name: newOrg.name,
      groupCode: newOrg.groupCode || generateGroupCode(),
      groups: 0,
      users: 0,
      players: 0,
      adminsStaff: 0,
      gender: newOrg.gender,
      birthYear: "",
      sport: newOrg.sport,
      children: [],
    };

    setOrganizations((prev) => [...prev, newOrganization]);
    setIsCreateDialogOpen(false);
    setNewOrg({ name: "", groupCode: "", sport: "Soccer", gender: "Unknown" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              aria-label="Back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <SiteDiagramIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              <Heading className="text-2xl">Organization</Heading>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <BellIcon className="inline-block h-4 w-4 mr-2" />
            </button>
            <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <InputGroup className="max-w-md">
              {/* <SearchIcon data-slot="icon" className="text-zinc-400 size-5" /> */}
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
          <div className="flex items-center gap-3">
            <Button outline className="text-sm">
              Edit sort order
            </Button>
            <Button
              color="blue"
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Create new group
            </Button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ChevronUpIcon className="h-4 w-4" />
              Collapse all
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Group code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Groups
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Users
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Players
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Admins/Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Birth year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Sport
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredOrganizations.map((org) => (
                  <OrganizationRow
                    key={org.id}
                    organization={org}
                    level={0}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogDescription>
          Add a new organization to your system. A unique group code will be generated automatically if not provided.
        </DialogDescription>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Organization Name *
              </label>
              <Input
                type="text"
                placeholder="e.g., Youth Academy"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Group Code (optional)
              </label>
              <Input
                type="text"
                placeholder="Leave empty to auto-generate"
                value={newOrg.groupCode}
                onChange={(e) => setNewOrg({ ...newOrg, groupCode: e.target.value.toUpperCase() })}
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Sport
              </label>
              <select
                className="w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                value={newOrg.sport}
                onChange={(e) => setNewOrg({ ...newOrg, sport: e.target.value })}
              >
                <option value="Soccer">Soccer</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Gender
              </label>
              <select
                className="w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                value={newOrg.gender}
                onChange={(e) => setNewOrg({ ...newOrg, gender: e.target.value })}
              >
                <option value="Unknown">Unknown</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button outline onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleCreateOrg} disabled={!newOrg.name.trim()}>
            Create Organization
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

// Organization Row Component
function OrganizationRow({
  organization,
  level,
  expandedIds,
  onToggleExpand,
}: {
  organization: OrganizationType;
  level: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(organization.id);
  const hasChildren = organization.children && organization.children.length > 0;

  return (
    <>
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => onToggleExpand(organization.id)}
                className="flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="h-4 w-4" />
            )}
            <Avatar
              initials={organization.name.substring(0, 2).toUpperCase()}
              className="h-8 w-8 bg-zinc-200 text-zinc-600"
            />
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              {organization.name}
            </a>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {organization.groupCode}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {organization.groups}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {organization.users}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {organization.players}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {organization.adminsStaff}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {organization.gender}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {organization.birthYear || "-"}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {organization.sport}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {hasChildren && (
              <button
                onClick={() => onToggleExpand(organization.id)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            )}
            <Menu>
              <MenuButton className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                <EllipsisIcon className="h-5 w-5" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "block w-full px-4 py-2 text-left text-sm",
                        focus ? "bg-zinc-100 dark:bg-zinc-800" : ""
                      )}
                    >
                      Edit
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "block w-full px-4 py-2 text-left text-sm",
                        focus ? "bg-zinc-100 dark:bg-zinc-800" : ""
                      )}
                    >
                      Add sub-organization
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "block w-full px-4 py-2 text-left text-sm text-red-600",
                        focus ? "bg-red-50 dark:bg-red-900/20" : ""
                      )}
                    >
                      Delete
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </td>
      </tr>
      {isExpanded &&
        hasChildren &&
        organization.children!.map((child) => (
          <OrganizationRow
            key={child.id}
            organization={child}
            level={level + 1}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </>
  );
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
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

function SiteDiagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
