import { useState, useMemo } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input, InputGroup } from "../../components/input";
import { Avatar } from "../../components/avatar";
import { Checkbox } from "../../components/checkbox";
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "../../components/pagination";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";

// Types
type Contact = {
  id: string;
  name: string;
  initials: string;
  email: string;
  emailLocked?: boolean;
  billingEmail: string;
  dateOfBirth: string;
  age: number;
  created: string;
};

// Sample data matching the image
const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Hussein Alawwad",
    initials: "HA",
    email: "samah.saleem@hotmail.com",
    emailLocked: true,
    billingEmail: "samah.saleem@hotmail.com",
    dateOfBirth: "2012-11-04",
    age: 13,
    created: "12/13/2025",
  },
  {
    id: "2",
    name: "ahmad aqel",
    initials: "AA",
    email: "",
    emailLocked: false,
    billingEmail: "",
    dateOfBirth: "2014-09-05",
    age: 11,
    created: "11/19/2025",
  },
  {
    id: "3",
    name: "Malak Malak",
    initials: "MM",
    email: "twistfighter12@gmail.com",
    emailLocked: true,
    billingEmail: "twistfighter12@gmail.com",
    dateOfBirth: "2021-01-22",
    age: 4,
    created: "11/19/2025",
  },
  {
    id: "4",
    name: "Faisal Arqoub",
    initials: "FA",
    email: "faisalarqoub47@gmail.com",
    emailLocked: true,
    billingEmail: "faisalarqoub47@gmail.com",
    dateOfBirth: "2014-02-24",
    age: 11,
    created: "11/17/2025",
  },
  {
    id: "5",
    name: "Keyan Shawa",
    initials: "KS",
    email: "keyan.shawa@gmail.com",
    emailLocked: true,
    billingEmail: "keyan.shawa@gmail.com",
    dateOfBirth: "2011-03-30",
    age: 14,
    created: "11/9/2025",
  },
  {
    id: "6",
    name: "Yahya Dajani",
    initials: "YD",
    email: "dajanisaed@gmail.com",
    emailLocked: true,
    billingEmail: "dajanisaed@gmail.com",
    dateOfBirth: "2017-04-08",
    age: 8,
    created: "11/8/2025",
  },
  {
    id: "7",
    name: "issa alnatsheh",
    initials: "IA",
    email: "alnatsheh_mils@hotmail.com",
    emailLocked: true,
    billingEmail: "alnatsheh_mils@hotmail.com",
    dateOfBirth: "1984-10-16",
    age: 41,
    created: "11/8/2025",
  },
  {
    id: "8",
    name: "abed al aziz alnatsheh",
    initials: "AA",
    email: "",
    emailLocked: false,
    billingEmail: "alnatsheh_mils@hotmail.com",
    dateOfBirth: "2015-01-30",
    age: 10,
    created: "11/8/2025",
  },
  {
    id: "9",
    name: "Musab Edeeb",
    initials: "ME",
    email: "ali@alsharq-m.com",
    emailLocked: true,
    billingEmail: "ali@alsharq-m.com",
    dateOfBirth: "2012-12-19",
    age: 12,
    created: "11/8/2025",
  },
  {
    id: "10",
    name: "Hamza Salah",
    initials: "HS",
    email: "hamzehsalah77@gmail.com",
    emailLocked: true,
    billingEmail: "hamzehsalah77@gmail.com",
    dateOfBirth: "2011-03-26",
    age: 14,
    created: "11/8/2025",
  },
  {
    id: "11",
    name: "Aziz Azaizeh",
    initials: "AA",
    email: "",
    emailLocked: false,
    billingEmail: "",
    dateOfBirth: "1973-08-30",
    age: 52,
    created: "11/8/2025",
  },
  {
    id: "12",
    name: "Adam Alabair",
    initials: "AA",
    email: "adamalabair1981@gmail.com",
    emailLocked: true,
    billingEmail: "adib.ishaq21@hotmail.com",
    dateOfBirth: "2014-01-25",
    age: 11,
    created: "11/4/2025",
  },
  {
    id: "13",
    name: "Abdallah Al-Zoubi",
    initials: "AA",
    email: "yasmeenatmoman@gmail.com",
    emailLocked: true,
    billingEmail: "yasmeenatmoman@gmail.com",
    dateOfBirth: "2014-05-04",
    age: 11,
    created: "11/4/2025",
  },
  {
    id: "14",
    name: "Talal Alkhuffash",
    initials: "TA",
    email: "alkhuffash@hotmail.com",
    emailLocked: true,
    billingEmail: "alkhuffash@hotmail.com",
    dateOfBirth: "2015-08-24",
    age: 10,
    created: "11/1/2025",
  },
];

export default function Contacts() {
  const [contacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Contact | null>("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const itemsPerPage = 50;
  const totalContacts = 383; // As shown in the image

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;

    const lowerQuery = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.billingEmail.toLowerCase().includes(lowerQuery)
    );
  }, [contacts, searchQuery]);

  // Sort contacts
  const sortedContacts = useMemo(() => {
    if (!sortField) return filteredContacts;

    return [...filteredContacts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
      if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredContacts, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(totalContacts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalContacts);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  // Handle individual select
  const handleSelectContact = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedContacts(newSelected);
  };

  // Handle sort
  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;
  const someSelected = selectedContacts.size > 0 && selectedContacts.size < contacts.length;

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
              <ContactsIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              <Heading className="text-2xl">Contacts</Heading>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <BellIcon className="h-5 w-5" />
            </button>
            <Button className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <InputGroup className="max-w-md">
              {/* <SearchIcon data-slot="icon" className="text-zinc-400" /> */}
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
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button color="blue" className="bg-blue-600 hover:bg-blue-700">
              <UserPlusIcon className="h-4 w-4" />
              New contact
            </Button>
          </div>
        </div>

        {/* Table */}
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
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {sortField === "name" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("email")}
                    >
                      Email
                      {sortField === "email" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("billingEmail")}
                    >
                      Billing email
                      {sortField === "billingEmail" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("dateOfBirth")}
                    >
                      Date of birth
                      {sortField === "dateOfBirth" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("age")}
                    >
                      Age
                      {sortField === "age" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <button
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={() => handleSort("created")}
                    >
                      Created
                      {sortField === "created" && (
                        <SortIcon direction={sortDirection} className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
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
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {contact.email ? (
                          <>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {contact.email}
                            </span>
                            {contact.emailLocked && (
                              <LockIcon className="h-4 w-4 text-zinc-400" />
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {contact.billingEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {contact.dateOfBirth}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-900 dark:text-white">
                        {contact.age}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {contact.created}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                                View details
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
                                Edit
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing <span className="font-medium text-zinc-900 dark:text-white">{startIndex}</span> to{" "}
            <span className="font-medium text-zinc-900 dark:text-white">{endIndex}</span>
            <span className="ml-1">of {totalContacts} results</span>
          </div>
          <Pagination>
            <PaginationPrevious href={currentPage > 1 ? "#" : null} />
            <PaginationList>
              <PaginationPage href="#" current={currentPage === 1}>
                1
              </PaginationPage>
              <PaginationPage href="#" current={currentPage === 2}>
                2
              </PaginationPage>
              <PaginationPage href="#" current={currentPage === 3}>
                3
              </PaginationPage>
              <PaginationGap />
              <PaginationPage href="#" current={currentPage === 7}>
                7
              </PaginationPage>
              <PaginationPage href="#" current={currentPage === 8}>
                8
              </PaginationPage>
            </PaginationList>
            <PaginationNext href={currentPage < totalPages ? "#" : null} />
          </Pagination>
        </div>
      </div>
    </DashboardLayout>
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

function ContactsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
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
