import type { Route } from "./+types/home";
import type { SVGProps } from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text, TextLink } from "../components/text";
import { Button } from "../components/button";
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { Select } from "../components/select";
import { DescriptionList, DescriptionTerm, DescriptionDetails } from "../components/description-list";
import { Divider } from "../components/divider";

type IconProps = SVGProps<SVGSVGElement>;

type WallPost = {
  id: number;
  author: string;
  initials: string;
  time: string;
  title: string;
  content: string;
  links?: { label: string; href: string }[];
  seen: string;
};

type Game = {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  score: string;
  status: "Win" | "Loss";
};

const wallPosts: WallPost[] = [
  {
    id: 1,
    author: "Jordan Knights Football Club",
    initials: "JK",
    time: "Saturday · 9:33 AM",
    title: "Announcement · End of 2025 term",
    content:
      "Dear Parents, we hope this message finds you well. Please review the key dates for the upcoming winter term and confirm attendance for winter training.",
    links: [
      { label: "Read more", href: "#" },
      { label: "(https://we.tl/t-irINx4NqAf)", href: "#" },
      { label: "(https://we.tl/t-vpUox3HqS8)", href: "#" },
    ],
    seen: "Seen by 52",
  },
  {
    id: 2,
    author: "Bashar Abdulalleh",
    initials: "BA",
    time: "Sunday · Nov 9 · 8:27 AM",
    title: "صور مباريات كأس الأردن يوم الجمعة",
    content: "لحظات مميزة بالحماس والمتعة. شاركوا الروابط لمتابعة اللقطات كاملة.",
    links: [{ label: "(https://we.tl/t-QLD1P5Phd0)", href: "#" }],
    seen: "Seen by 10",
  },
];

const recentGames: Game[] = [
  {
    id: 1,
    opponent: "SMSM Development Academy",
    date: "Sep 23, 2025",
    time: "05:00 PM",
    location: "Jordan Knights Stadium",
    score: "2 – 1",
    status: "Win",
  },
  {
    id: 2,
    opponent: "Capital City United",
    date: "Sep 12, 2025",
    time: "07:30 PM",
    location: "Capital City Dome",
    score: "1 – 3",
    status: "Loss",
  },
];

const cardBaseClass = "rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home · Jordan Knights Dashboard" },
    { name: "description", content: "Organization overview and latest club activity." },
  ];
}

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start gap-4">
          <Button plain className="px-3 py-2 text-sm font-semibold text-zinc-600">
            <ChevronLeftIcon data-slot="icon" />
            Back
          </Button>
          <div className="space-y-1">
            <Heading level={1} className="text-3xl font-semibold">
              Home
            </Heading>
            <Text className="text-sm text-zinc-500">Jordan Knights Football Club · Administrator</Text>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <Button outline>Invite staff</Button>
            <Button color="blue">
              <PlusIcon data-slot="icon" />
              New post
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <CurrencyCard />
            <TeamEventsCard />
            <LastGamesCard />
          </div>
          <div className="space-y-6">
            <WallCard />
            <SupportCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CurrencyCard() {
  return (
    <section className={cardBaseClass}>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex-1 space-y-3">
          <Badge color="blue" className="w-fit">
            Stripe connected
          </Badge>
          <Subheading level={2}>Set your store currency</Subheading>
          <Text className="text-sm text-zinc-600">
            You&apos;re now connected to Stripe. Before you can add products you need to set the currency your store
            will show on all listings.
          </Text>
          <DescriptionList className="mt-4 text-sm text-zinc-500">
            <DescriptionTerm>Reminder</DescriptionTerm>
            <DescriptionDetails>Once your currency is saved you cannot change it.</DescriptionDetails>
          </DescriptionList>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <Select defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option value="USD">USD · United States Dollar</option>
            <option value="EUR">EUR · Euro</option>
            <option value="JOD">JOD · Jordanian Dinar</option>
          </Select>
          <Button color="blue" className="w-full">
            Set currency
          </Button>
        </div>
      </div>
    </section>
  );
}

function TeamEventsCard() {
  return (
    <section className={cardBaseClass}>
      <div className="flex flex-wrap items-center gap-4">
        <Subheading level={2}>Team events</Subheading>
        <Button plain className="ml-auto text-sm text-blue-600">
          Show calendar
        </Button>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
        <CalendarLargeIcon className="mx-auto size-16 text-blue-500" />
        <Heading level={3} className="mt-4 text-xl font-semibold">
          Get started with the calendar
        </Heading>
        <Text className="mt-2 text-sm text-zinc-600">
          Add events to your team calendar and your upcoming ones will show up here.
        </Text>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button color="blue">
            <PlusIcon data-slot="icon" />
            Create an event
          </Button>
          <Button plain className="text-sm text-zinc-500">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
}

function LastGamesCard() {
  return (
    <section className={cardBaseClass}>
      <div className="flex items-center justify-between">
        <Subheading level={2}>Last games</Subheading>
        <Button plain className="text-sm text-blue-600">
          View all
        </Button>
      </div>
      <ul className="mt-6 space-y-4">
        {recentGames.map((game) => (
          <li key={game.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-100 p-4">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium uppercase text-zinc-500">
                {game.date} · {game.time}
              </p>
              <Heading level={3} className="text-lg font-semibold">
                {game.opponent}
              </Heading>
              <Text className="text-sm text-zinc-500">{game.location}</Text>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge color={game.status === "Win" ? "green" : "red"}>{game.status}</Badge>
              <span className="text-2xl font-semibold text-zinc-950">{game.score}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WallCard() {
  return (
    <section className={`${cardBaseClass} h-full`}>
      <div className="flex flex-wrap items-center gap-4">
        <Subheading level={2}>Wall</Subheading>
        <Badge color="zinc">Jordan Knights Football Club</Badge>
        <Button color="blue" className="ml-auto">
          <PlusIcon data-slot="icon" />
          New post
        </Button>
      </div>
      <Divider className="my-6" />
      <div className="space-y-8">
        {wallPosts.map((post) => (
          <article key={post.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar initials={post.initials} alt={post.author} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{post.author}</p>
                <p className="text-xs text-zinc-500">{post.time}</p>
              </div>
              <span className="ml-auto text-xs text-zinc-500">{post.seen}</span>
            </div>
            <Heading level={3} className="text-base font-semibold text-zinc-900">
              {post.title}
            </Heading>
            <Text className="text-sm text-zinc-600">{post.content}</Text>
            {post.links && (
              <ul className="space-y-1">
                {post.links.map((link) => (
                  <li key={link.label}>
                    <TextLink href={link.href}>{link.label}</TextLink>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
              <button className="text-zinc-700">Like</button>
              <button className="text-zinc-700">Comment</button>
              <button className="text-zinc-700">Share</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SupportCard() {
  return (
    <section className={cardBaseClass}>
      <Subheading level={2}>Need help?</Subheading>
      <Text className="mt-2 text-sm text-zinc-600">
        Chat with SMT Dev support or browse the documentation to learn more about scheduling, payments, and
        registrations.
      </Text>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button outline>Visit support center</Button>
        <Button plain className="text-sm text-blue-600">
          Contact support
        </Button>
      </div>
    </section>
  );
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

function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function CalendarLargeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <rect x="6" y="10" width="36" height="30" rx="4" />
      <path d="M32 6v8M16 6v8M6 20h36M16 26h4M24 26h4M32 26h4M16 32h4" strokeLinecap="round" />
    </svg>
  );
}
