import type { Route } from "./+types/index";
import type { SVGProps } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text, TextLink } from "../components/text";
import { Button } from "../components/button";
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { Select } from "../components/select";
import { DescriptionList, DescriptionTerm, DescriptionDetails } from "../components/description-list";
import { Divider } from "../components/divider";
import { useAuth } from "~/context/auth-context";
import {
  subscribeToPosts,
  getTimeSincePost,
  getPostAuthorInitials,
  type Post,
} from "~/lib/firestore-posts";

type IconProps = SVGProps<SVGSVGElement>;

type Game = {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  score: string;
  status: "Win" | "Loss";
};

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
  const navigate = useNavigate();
  const { activeClub, profile } = useAuth();
  const clubName = activeClub?.name ?? "Jordan Knights Football Club";
  const membershipRole = activeClub?.membershipRole ?? "Administrator";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Subscribe to posts from Firestore
  useEffect(() => {
    if (!activeClub?.id) {
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    
    const unsubscribe = subscribeToPosts(
      activeClub.id,
      (data) => {
        // Limit to 5 posts for the home page wall
        setPosts(data.slice(0, 5));
        setLoadingPosts(false);
      },
      (err) => {
        console.error("Failed to fetch posts:", err);
        setLoadingPosts(false);
      },
      { status: "Published" }
    );

    return () => unsubscribe();
  }, [activeClub?.id]);

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
            <Text className="text-sm text-zinc-500">{clubName} · {membershipRole}</Text>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <Button outline>Invite staff</Button>
            <Button color="blue" onClick={() => navigate("/posts")}>
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
            <WallCard posts={posts} loading={loadingPosts} clubName={clubName} />
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
          <Subheading level={2} className="dark:text-zinc-900">Set your store currency</Subheading>
          <Text className="text-sm text-zinc-600">
            You&apos;re now connected to Stripe. Before you can add products you need to set the currency your store
            will show on all listings.
          </Text>
          <DescriptionList className="mt-4 text-sm text-zinc-500">
            <DescriptionTerm>Reminder</DescriptionTerm>
            <DescriptionDetails>Once your currency is saved you cannot change it.</DescriptionDetails>
          </DescriptionList>
        </div>
        <div className="w-full max-w-xs space-y-3 dark:text-zinc-900">
          <Select defaultValue="" className="dark:text-zinc-900">
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
        <Subheading level={2} className="dark:text-zinc-900">Team events</Subheading>
        <Button color="blue" className="ml-auto text-sm ">
          Show calendar
        </Button>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
        <CalendarLargeIcon className="mx-auto size-16 text-blue-500" />
        <Heading level={3} className="mt-4 text-xl font-semibold dark:text-zinc-900">
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
        <Subheading level={2} className="dark:text-zinc-900">Last games</Subheading>
        <Button className="text-sm text-blue-600">
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
              <Heading level={3} className="text-lg font-semibold dark:text-zinc-900">
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

function WallCard({ posts, loading, clubName }: { posts: Post[]; loading: boolean; clubName: string }) {
  const navigate = useNavigate();

  const getInitials = getPostAuthorInitials;

  const formatTime = (timestamp: unknown) => {
    return getTimeSincePost(timestamp as import("firebase/firestore").Timestamp | null);
  };

  return (
    <section className={`${cardBaseClass} h-fit`}>
      <div className="flex flex-wrap items-center gap-4">
        <Subheading level={2} className="dark:text-zinc-900">Wall</Subheading>
        <Badge color="zinc" className="dark:text-zinc-900">{clubName}</Badge>
        <Button color="blue" className="ml-auto" onClick={() => navigate("/posts")}>
          <PlusIcon data-slot="icon" />
          New post
        </Button>
      </div>
      <Divider className="my-6" />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="size-6 text-zinc-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center">
          <MegaphoneIcon className="mx-auto mb-3 size-12 text-zinc-300" />
          <p className="font-medium text-zinc-600">No posts yet</p>
          <p className="mt-1 text-sm text-zinc-500">Create your first post to share with your club.</p>
          <Button color="blue" className="mt-4" onClick={() => navigate("/posts")}>
            <PlusIcon data-slot="icon" />
            Create post
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar
                  initials={getInitials(post.postAsClub && post.targetGroupNames?.[0] ? post.targetGroupNames[0] : post.authorName)}
                  alt={post.authorName}
                  className="size-10 bg-amber-100 text-amber-700"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    {post.postAsClub && post.targetGroupNames?.[0] ? post.targetGroupNames[0] : post.authorName}
                  </p>
                  <p className="text-xs text-zinc-500">{formatTime(post.publishedAt || post.createdAt)}</p>
                </div>
                <span className="ml-auto text-xs text-zinc-500">Seen by {post.viewCount || 0}</span>
              </div>

              {post.title && (
                <Heading level={3} className="text-base font-semibold text-zinc-900 dark:text-zinc-900">
                  {post.title}
                </Heading>
              )}

              <Text className="text-sm text-zinc-600 whitespace-pre-wrap">{post.content}</Text>

              {/* Attachments - Images */}
              {post.attachments?.filter((a) => a.contentType?.startsWith("image/")).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {post.attachments
                    .filter((a) => a.contentType?.startsWith("image/"))
                    .slice(0, 4)
                    .map((attachment, idx) => (
                      <div key={attachment.id || idx} className="relative overflow-hidden rounded-lg">
                        <img
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="aspect-video w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Attachments - Videos */}
              {post.attachments?.filter((a) => a.contentType?.startsWith("video/")).length > 0 && (
                <div className="mt-3 space-y-2">
                  {post.attachments
                    .filter((a) => a.contentType?.startsWith("video/"))
                    .slice(0, 2)
                    .map((attachment, idx) => (
                      <div key={attachment.id || idx} className="overflow-hidden rounded-lg">
                        <video
                          src={attachment.url}
                          className="aspect-video w-full object-cover"
                          controls
                          poster=""
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* YouTube detection from content */}
              {(post.content.includes("youtube.com") || post.content.includes("youtu.be")) && (
                <div className="mt-3 overflow-hidden rounded-lg bg-zinc-100 p-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <VideoIcon className="size-4" />
                    <span>YouTube video linked</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                <button className="flex items-center gap-1 text-zinc-700 hover:text-amber-600 transition-colors">
                  <HeartIcon className="size-4" />
                  Like {post.reactionsCount > 0 && `(${post.reactionsCount})`}
                </button>
                <button className="flex items-center gap-1 text-zinc-700 hover:text-blue-600 transition-colors">
                  <CommentIcon className="size-4" />
                  Comment {post.commentCount > 0 && `(${post.commentCount})`}
                </button>
                <button className="flex items-center gap-1 text-zinc-700 hover:text-green-600 transition-colors">
                  <ShareIcon className="size-4" />
                  Share
                </button>
              </div>
            </article>
          ))}

          {posts.length > 0 && (
            <div className="pt-4 text-center border-t border-zinc-100">
              <Button plain className="text-sm text-blue-600" onClick={() => navigate("/posts")}>
                View all posts
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SupportCard() {
  return (
    <section className={cardBaseClass}>
      <Subheading level={2} className="dark:text-zinc-900">Need help?</Subheading>
      <Text className="mt-2 text-sm text-zinc-600">
        Chat with SMT Dev support or browse the documentation to learn more about scheduling, payments, and
        registrations.
      </Text>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button >Visit support center</Button>
        <Button color="blue" className="text-sm text-blue-600">
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

function VideoIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <rect x="2" y="4" width="14" height="16" rx="2" />
      <path d="M16 10l6-4v12l-6-4v-4z" />
    </svg>
  );
}

function HeartIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.2 3 11.8 3.9 12 5C12.2 3.9 13.8 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CommentIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className || ""}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
