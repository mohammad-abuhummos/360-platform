import type { ReactNode, SVGProps } from "react";
import type { Route } from "./+types/calendar";
import clsx from "clsx";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarTabs = ["Schedule", "Day", "Week", "Month", "Year"] as const;

type EventTone = "amber" | "amberSecondary" | "sand" | "red";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  tone: EventTone;
};

type CalendarDay = {
  date: string;
  dayNumber: number;
  isMuted?: boolean;
  isToday?: boolean;
};

type CalendarWeek = {
  label: string;
  days: CalendarDay[];
};

const eventToneStyles: Record<EventTone, { pill: string; indicator: string }> = {
  amber: {
    pill: "border-amber-200 bg-amber-50 text-amber-900",
    indicator: "bg-amber-500",
  },
  amberSecondary: {
    pill: "border-yellow-200 bg-yellow-50 text-yellow-900",
    indicator: "bg-amber-400",
  },
  sand: {
    pill: "border-orange-100 bg-orange-50 text-orange-900",
    indicator: "bg-orange-400",
  },
  red: {
    pill: "border-red-200 bg-red-50 text-red-900",
    indicator: "bg-red-500",
  },
};

const calendarWeeks: CalendarWeek[] = [
  {
    label: "49",
    days: [
      { date: "2025-12-01", dayNumber: 1 },
      { date: "2025-12-02", dayNumber: 2 },
      { date: "2025-12-03", dayNumber: 3 },
      { date: "2025-12-04", dayNumber: 4 },
      { date: "2025-12-05", dayNumber: 5 },
      { date: "2025-12-06", dayNumber: 6 },
      { date: "2025-12-07", dayNumber: 7 },
    ],
  },
  {
    label: "50",
    days: [
      { date: "2025-12-08", dayNumber: 8 },
      { date: "2025-12-09", dayNumber: 9 },
      { date: "2025-12-10", dayNumber: 10 },
      { date: "2025-12-11", dayNumber: 11 },
      { date: "2025-12-12", dayNumber: 12 },
      { date: "2025-12-13", dayNumber: 13 },
      { date: "2025-12-14", dayNumber: 14, isToday: true },
    ],
  },
  {
    label: "51",
    days: [
      { date: "2025-12-15", dayNumber: 15 },
      { date: "2025-12-16", dayNumber: 16 },
      { date: "2025-12-17", dayNumber: 17 },
      { date: "2025-12-18", dayNumber: 18 },
      { date: "2025-12-19", dayNumber: 19 },
      { date: "2025-12-20", dayNumber: 20 },
      { date: "2025-12-21", dayNumber: 21 },
    ],
  },
  {
    label: "52",
    days: [
      { date: "2025-12-22", dayNumber: 22 },
      { date: "2025-12-23", dayNumber: 23 },
      { date: "2025-12-24", dayNumber: 24 },
      { date: "2025-12-25", dayNumber: 25 },
      { date: "2025-12-26", dayNumber: 26 },
      { date: "2025-12-27", dayNumber: 27 },
      { date: "2025-12-28", dayNumber: 28 },
    ],
  },
  {
    label: "1",
    days: [
      { date: "2025-12-29", dayNumber: 29 },
      { date: "2025-12-30", dayNumber: 30 },
      { date: "2025-12-31", dayNumber: 31 },
      { date: "2026-01-01", dayNumber: 1, isMuted: true },
      { date: "2026-01-02", dayNumber: 2, isMuted: true },
      { date: "2026-01-03", dayNumber: 3, isMuted: true },
      { date: "2026-01-04", dayNumber: 4, isMuted: true },
    ],
  },
];

const calendarEvents: CalendarEvent[] = [
  { id: "dec1-u15c", date: "2025-12-01", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec1-u15b", date: "2025-12-01", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec2-u15c", date: "2025-12-02", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec2-u15b", date: "2025-12-02", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec5-2021", date: "2025-12-05", title: "2021 - Autumn 2025", tone: "sand" },
  { id: "dec5-red", date: "2025-12-05", title: "RED U15 - Autumn 2025", tone: "red" },
  { id: "dec6-u15c", date: "2025-12-06", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec6-u15b", date: "2025-12-06", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec8-u15b", date: "2025-12-08", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec9-u15c", date: "2025-12-09", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec12-2021", date: "2025-12-12", title: "2021 - Autumn 2025", tone: "sand" },
  { id: "dec12-red", date: "2025-12-12", title: "RED U15 - Autumn 2025", tone: "red" },
  { id: "dec13-u15b", date: "2025-12-13", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec13-u15c", date: "2025-12-13", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec14-u15b", date: "2025-12-14", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec14-u15c", date: "2025-12-14", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec15-u15c", date: "2025-12-15", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec16-u15b", date: "2025-12-16", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
];

const eventsByDate = calendarEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
  (acc[event.date] ??= []).push(event);
  return acc;
}, {});

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar · Jordan Knights Dashboard" },
    { name: "description", content: "Month view of the Jordan Knights organization calendar." },
  ];
}

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <CalendarHeader />
        <CalendarBoard />
      </div>
    </DashboardLayout>
  );
}

function CalendarHeader() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="space-y-2">
        <Badge color="zinc">Organization management</Badge>
        <div>
          <Heading level={1} className="text-3xl font-semibold">
            Calendar
          </Heading>
          <Text className="text-sm text-zinc-500">Stay updated with the latest fixtures, trainings, and club events.</Text>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button outline className="text-sm">
          <ExportIcon data-slot="icon" />
          Export
        </Button>
        <Button outline className="text-sm">
          <FilterIcon data-slot="icon" />
          Filter
        </Button>
        <Button plain className="text-sm font-semibold text-zinc-600">
          <ShareIcon data-slot="icon" />
          Share
        </Button>
        <Button color="blue">
          <PlusIcon data-slot="icon" />
          Create
        </Button>
      </div>
    </div>
  );
}

function CalendarBoard() {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full bg-zinc-50 p-1 text-sm font-semibold text-zinc-500">
          {calendarTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={clsx(
                "rounded-full px-4 py-1 transition-colors",
                tab === "Month" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-600">
          <IconPillButton label="Previous month">
            <ChevronLeftIcon />
          </IconPillButton>
          <IconPillButton label="Next month">
            <ChevronRightIcon />
          </IconPillButton>
          <span className="pl-2 text-base font-semibold text-zinc-900">Dec 2025</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Trainings
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Tournaments
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            RED U15
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
        <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <div className="px-4 py-3 text-[0.65rem] font-semibold text-zinc-400">Week</div>
          {daysOfWeek.map((day) => (
            <div key={day} className="border-l border-zinc-200 px-4 py-3">
              {day}
            </div>
          ))}
        </div>
        {calendarWeeks.map((week) => (
          <div key={week.label} className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] border-t border-zinc-200 bg-white">
            <div className="px-4 py-3 text-xs font-semibold text-zinc-400">{week.label}</div>
            {week.days.map((day) => (
              <DayCell key={day.date} day={day} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function DayCell({ day }: { day: CalendarDay }) {
  const dayEvents = eventsByDate[day.date] ?? [];

  return (
    <div
      className={clsx(
        "min-h-[140px] border-l border-zinc-200 p-4 transition-colors",
        day.isMuted ? "bg-zinc-50/60 text-zinc-400" : "bg-white"
      )}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-zinc-800">
        {day.isToday ? (
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {day.dayNumber}
          </span>
        ) : (
          <span className={clsx("text-sm font-semibold", day.isMuted ? "text-zinc-400" : "text-zinc-700")}>{day.dayNumber}</span>
        )}
        {!day.isMuted && <span className="text-xs font-medium uppercase tracking-wide text-zinc-300">Dec</span>}
        {day.isMuted && <span className="text-xs font-medium uppercase tracking-wide text-zinc-300">Jan</span>}
      </div>
      <div className="mt-3 space-y-2">
        {dayEvents.map((event) => (
          <EventPill key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventPill({ event }: { event: CalendarEvent }) {
  const tone = eventToneStyles[event.tone];

  return (
    <div className={clsx("flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-semibold", tone.pill)}>
      <span className={clsx("h-4 w-1 rounded-full", tone.indicator)} />
      <span className="truncate">{event.title}</span>
    </div>
  );
}

function IconPillButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
    >
      {children}
    </button>
  );
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-4">
      <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-4">
      <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-4">
      <path d="M12 5v10m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-4">
      <path d="M4 6h16M7 12h10m-6 6h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-4">
      <path d="M16 5a3 3 0 1 1 2.83 4H18a8 8 0 1 0 0 6h.83A3 3 0 1 1 16 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className="size-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

