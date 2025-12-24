import type { ComponentType, ReactNode, SVGProps } from "react";
import { useLocation } from "react-router";
import { useState, useMemo } from "react";
import * as Headless from "@headlessui/react";
import { useAuth } from "~/context/auth-context";
import type { Club } from "~/lib/firestore-users";
import { SidebarLayout } from "./sidebar-layout";
import { Button } from "./button";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarDivider,
  SidebarSpacer,
} from "./sidebar";
import {
  Navbar,
  NavbarSection,
  NavbarSpacer,
  NavbarItem,
  NavbarLabel,
  NavbarDivider,
} from "./navbar";
import { Avatar } from "./avatar";
import { Badge } from "./badge";

type IconProps = SVGProps<SVGSVGElement>;

type NavigationSection = {
  heading?: string;
  items: {
    label: string;
    icon: ComponentType<IconProps>;
    href?: string;
    badge?: string;
    subItems?: {
      label: string;
      href: string;
    }[];
  }[];
};

const navigationSections: NavigationSection[] = [
  {
    items: [
      { label: "Home", icon: HomeIcon, href: "/" },
      { label: "Calendar", icon: CalendarIcon, href: "/calendar" },
      { label: "Chat", icon: ChatIcon, href: "/chat" },
    ],
  },
  {
    heading: "Organization Management",
    items: [
      { label: "Team", icon: UsersIcon, badge: "4", href: "/team" },
      {
        label: "Management",
        icon: BriefcaseIcon,
        subItems: [
          { label: "Overview", href: "/management/overview" },
          { label: "Organization", href: "/management/organization" },
          { label: "Contacts", href: "/management/contacts" },
          { label: "Attendance", href: "/management/attendance" },
        ]
      },
      { label: "Payments", icon: WalletIcon },
      { label: "Registrations", icon: ClipboardIcon, href: "/registrations" },
      { label: "Posts", icon: MegaphoneIcon },
      { label: "Scheduling", icon: ClockIcon },
      { label: "Development", icon: TrophyIcon },
      { label: "Games", icon: FlagIcon },
      { label: "Settings", icon: SettingsIcon },
      { label: "Support", icon: LifebuoyIcon },
    ],
  },
  {
    heading: "Jordan Knight Website",
    items: [{ label: "Public site", icon: GlobeIcon }],
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout sidebar={<DashboardSidebar />} navbar={<DashboardNavbar />}>
    {children}
  </SidebarLayout>;
}

function ClubSwitcher() {
  const { clubs, activeClub, setActiveClub } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const query = searchQuery.toLowerCase();
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        club.membershipRole.toLowerCase().includes(query)
    );
  }, [clubs, searchQuery]);

  const handleClubSelect = async (club: Club) => {
    if (club.id !== activeClub?.id) {
      await setActiveClub(club.id);
    }
  };

  const clubName = activeClub?.name ?? "Select a club";
  const clubRoleLabel = activeClub?.membershipRole ?? "Administrator";

  return (
    <Headless.Popover className="relative">
      {({ open }) => (
        <>
          <Headless.PopoverButton className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
            <div className="rounded-2xl bg-white/10 p-2">
              <ShieldIcon className="size-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/70">{clubRoleLabel}</p>
              <p className="truncate text-lg font-semibold text-white">{clubName}</p>
            </div>
            <ChevronDownIcon
              className={`size-5 text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </Headless.PopoverButton>

          <Headless.PopoverPanel
            transition
            anchor="bottom start"
            className="z-50 mt-2 w-72 origin-top-left rounded-xl bg-white p-2 shadow-xl ring-1 ring-zinc-950/10 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-900 dark:ring-white/10"
          >
            {({ close }) => (
              <>
                {/* Search Input */}
                <div className="relative mb-2">
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border-0 bg-zinc-100 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Section Header */}
                <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500">
                  My groups
                </p>

                {/* Clubs List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredClubs.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-zinc-500">
                      No groups found
                    </p>
                  ) : (
                    filteredClubs.map((club) => {
                      const isActive = club.id === activeClub?.id;
                      return (
                        <button
                          key={club.id}
                          type="button"
                          onClick={() => {
                            void handleClubSelect(club);
                            close();
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${isActive
                            ? "bg-amber-50 dark:bg-amber-500/10"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                        >
                          <div
                            className={`flex size-10 items-center justify-center rounded-full ${isActive
                              ? "bg-amber-500 text-white"
                              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                              }`}
                          >
                            <ShieldIcon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-medium ${isActive
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-zinc-900 dark:text-white"
                                }`}
                            >
                              {club.name}
                            </p>
                            <p
                              className={`text-xs ${isActive
                                ? "text-amber-600 dark:text-amber-500"
                                : "text-zinc-500 dark:text-zinc-400"
                                }`}
                            >
                              {club.description || club.membershipRole}
                            </p>
                          </div>
                          {isActive && (
                            <CheckIcon className="size-5 text-amber-500" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </Headless.PopoverPanel>
        </>
      )}
    </Headless.Popover>
  );
}

function DashboardSidebar() {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const { profile, signOut } = useAuth();

  const userDisplayName = profile?.displayName ?? "SMT Dev";
  const userEmail = profile?.email ?? "malek.kashouqa@smt.com.jo";
  const avatarInitials = getInitials(userDisplayName);

  const isCurrent = (href?: string) => {
    if (!href) return false;
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <div className="dark flex h-full flex-col bg-zinc-950 text-white">
      <Sidebar className="h-full bg-transparent text-white">
        <SidebarHeader className="bg-white/5 text-white">
          <SidebarSection>
            <ClubSwitcher />
          </SidebarSection>
        </SidebarHeader>

        <SidebarBody>
          {navigationSections.map((section, index) => (
            <SidebarSection key={section.heading ?? index}>
              {section.heading && <SidebarHeading className="text-white/70">{section.heading}</SidebarHeading>}
              {section.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openDropdowns[item.label];
                const isParentActive = hasSubItems && item.subItems?.some(subItem => isCurrent(subItem.href));

                const content = (
                  <>
                    <item.icon data-slot="icon" className="text-white/70" />
                    <SidebarLabel className="text-white">{item.label}</SidebarLabel>
                    {item.badge && <Badge color="zinc">{item.badge}</Badge>}
                    {hasSubItems && (
                      <ChevronIcon
                        className={`ml-auto size-4 text-white/70 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      />
                    )}
                  </>
                );

                return (
                  <div key={item.label}>
                    {item.href ? (
                      <SidebarItem href={item.href} current={isCurrent(item.href)}>
                        {content}
                      </SidebarItem>
                    ) : hasSubItems ? (
                      <SidebarItem onClick={() => toggleDropdown(item.label)} current={isParentActive}>
                        {content}
                      </SidebarItem>
                    ) : (
                      <SidebarItem>{content}</SidebarItem>
                    )}

                    {hasSubItems && isOpen && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.subItems?.map((subItem) => (
                          <SidebarItem
                            key={subItem.label}
                            href={subItem.href}
                            current={isCurrent(subItem.href)}
                          >
                            <SidebarLabel className="text-sm text-white/90">{subItem.label}</SidebarLabel>
                          </SidebarItem>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {index === 0 && <SidebarDivider className="border-white/10" />}
            </SidebarSection>
          ))}
          <SidebarSpacer />
        </SidebarBody>

        <SidebarFooter className="bg-white/5 text-white">
          <SidebarSection>
            <SidebarItem>
              <Avatar initials={avatarInitials} alt={userDisplayName} />
              <SidebarLabel className="text-white">{userDisplayName}</SidebarLabel>
              <Badge color="green">Online</Badge>
            </SidebarItem>
            <p className="px-2 text-xs text-white/60">{userEmail}</p>
            <Button
              type="button"
              outline
              className="mt-3 w-full justify-center text-sm text-white hover:bg-white/10"
              onClick={() => {
                void signOut();
              }}
            >
              Log out
            </Button>
          </SidebarSection>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

function DashboardNavbar() {
  const { activeClub, profile } = useAuth();
  const clubName = activeClub?.name ?? "Jordan Knights Football Club";
  const userDisplayName = profile?.displayName ?? "SMT Dev";
  const avatarInitials = getInitials(userDisplayName);

  return (
    <Navbar>
      <NavbarSection className="max-lg:hidden">
        <NavbarItem>
          <HomeIcon data-slot="icon" />
          <NavbarLabel>{clubName}</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem aria-label="Notifications">
          <BellIcon data-slot="icon" />
        </NavbarItem>
        <NavbarDivider />
        <NavbarItem>
          <Avatar initials={avatarInitials} alt={userDisplayName} />
          <NavbarLabel>{userDisplayName}</NavbarLabel>
        </NavbarItem>
      </NavbarSection>
    </Navbar>
  );
}

function getInitials(name?: string) {
  if (!name) {
    return "AD";
  }

  const letters = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const initials = letters.slice(0, 2);
  return initials || "AD";
}

function iconClasses(className?: string) {
  return ["size-5", className].filter(Boolean).join(" ");
}

function HomeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1z" strokeLinecap="round" strokeLinejoin="round" />
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

function ChatIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path
        d="M6 8c0-1.657 1.79-3 4-3h4c2.21 0 4 1.343 4 3v4c0 1.657-1.79 3-4 3h-1.5l-3.5 4v-4H10c-2.21 0-4-1.343-4-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <circle cx="9" cy="7" r="3" />
      <path d="M15 11a3 3 0 1 0-2.75-4" />
      <path d="M4 19a5 5 0 0 1 10 0M14 19a4 4 0 0 1 8 0" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M9 6V4h6v2" strokeLinecap="round" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function WalletIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <rect x="3" y="6" width="18" height="14" rx="3" />
      <path d="M17 10h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
      <circle cx="17.5" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ClipboardIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M9 4h6M9 7h6" strokeLinecap="round" />
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

function MegaphoneIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M4 11V7l13-4v16l-13-4v-4" strokeLinejoin="round" />
      <path d="M4 15v2a3 3 0 0 0 3 3h1" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M8 4h8l1 4H7l1-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v8" />
      <path d="M7 12c0 3 2.5 5 5 5s5-2 5-5" />
      <path d="M9 19h6" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M6 4v16M6 5h10l-1.5 4L20 13H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82v0a2 2 0 1 1-3.32 0 1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15 1.65 1.65 0 0 0 4 14a1.65 1.65 0 0 0-.6-1H3a2 2 0 1 1 0-3h.4a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82v0a2 2 0 1 1 3.32 0 1.65 1.65 0 0 0 .33 1.82 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.6.35 1 .99 1 1.7s-.4 1.35-1 1.7Z" />
    </svg>
  );
}

function LifebuoyIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="m5.65 5.65 2.8 2.8M15.55 15.55l2.8 2.8M18.35 5.65l-2.8 2.8M8.45 15.55l-2.8 2.8" />
    </svg>
  );
}

function GlobeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a18 18 0 0 1 0 18M12 3a18 18 0 0 0 0 18" />
    </svg>
  );
}

function ShieldIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <path d="M12 3 4 6v6c0 4.28 2.99 8.42 8 9.99 5.01-1.57 8-5.71 8-9.99V6z" strokeLinecap="round" strokeLinejoin="round" />
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

function ChevronIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className={iconClasses(className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props} className={iconClasses(className)}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
