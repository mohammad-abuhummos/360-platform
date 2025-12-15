import { useMemo, useState } from "react";
import type { ReactNode, SVGProps } from "react";
import type { Route } from "./+types/calendar";
import clsx from "clsx";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "../components/dialog";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarTabs = ["Schedule", "Day", "Week", "Month", "Year"] as const;
const focusDay = "2025-12-14";
const scheduleOrder = ["2025-12-14", "2025-12-16"];
const focusWeekLabel = "Week 50, 2025";
const focusMonthLabel = "Dec 2025";
const focusYear = 2025;

const toolbarMeta: Record<CalendarTab, { label: string; subLabel?: string }> = {
  Schedule: { label: "From today", subLabel: "Upcoming trainings" },
  Day: { label: "Sun, Dec 14", subLabel: focusWeekLabel },
  Week: { label: "December", subLabel: focusWeekLabel },
  Month: { label: focusMonthLabel },
  Year: { label: `${focusYear}` },
};

const navLabels: Record<CalendarTab, { prev: string; next: string }> = {
  Schedule: { prev: "Previous schedule", next: "Next schedule" },
  Day: { prev: "Previous day", next: "Next day" },
  Week: { prev: "Previous week", next: "Next week" },
  Month: { prev: "Previous month", next: "Next month" },
  Year: { prev: "Previous year", next: "Next year" },
};

type CalendarTab = (typeof calendarTabs)[number];

type EventTone = "amber" | "amberSecondary" | "sand" | "red";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  tone: EventTone;
};

type DetailedEvent = CalendarEvent & {
  practice: string;
  location: string;
  startTime: string; // 24h "HH:MM"
  endTime: string;
  attendance: {
    accepted: number;
    declined: number;
    pending: number;
    waiting: number;
  };
  acceptedLabel?: string;
  stream?: boolean;
};

const detailedEvents: DetailedEvent[] = [
  {
    id: "dec14-u15b",
    date: "2025-12-14",
    title: "U15-B - Autumn 2025",
    practice: "Practice U15-2",
    startTime: "17:00",
    endTime: "18:30",
    location: "Amman",
    tone: "amberSecondary",
    attendance: { accepted: 12, declined: 0, pending: 0, waiting: 0 },
    acceptedLabel: "You accepted",
    stream: true,
  },
  {
    id: "dec14-u15c",
    date: "2025-12-14",
    title: "U15-C - Autumn 2025",
    practice: "Practice U15-3",
    startTime: "17:00",
    endTime: "18:30",
    location: "Amman",
    tone: "amber",
    attendance: { accepted: 30, declined: 0, pending: 0, waiting: 0 },
    acceptedLabel: "You accepted",
    stream: true,
  },
  {
    id: "dec16-u15c",
    date: "2025-12-16",
    title: "U15-C - Autumn 2025",
    practice: "Practice U15-3",
    startTime: "17:00",
    endTime: "18:30",
    location: "Amman",
    tone: "amber",
    attendance: { accepted: 30, declined: 0, pending: 0, waiting: 0 },
    acceptedLabel: "You accepted",
    stream: true,
  },
  {
    id: "dec16-u15b",
    date: "2025-12-16",
    title: "U15-B - Autumn 2025",
    practice: "Practice U15-2",
    startTime: "17:00",
    endTime: "18:30",
    location: "Amman",
    tone: "amberSecondary",
    attendance: { accepted: 12, declined: 0, pending: 0, waiting: 0 },
    acceptedLabel: "You accepted",
    stream: true,
  },
  {
    id: "dec13-u15c",
    date: "2025-12-13",
    title: "U15-C - Autumn 2025",
    practice: "Practice U15-3",
    startTime: "12:30",
    endTime: "14:00",
    location: "Jordan Knights Club Fields",
    tone: "amber",
    attendance: { accepted: 26, declined: 1, pending: 0, waiting: 0 },
    stream: false,
  },
  {
    id: "dec13-u15b",
    date: "2025-12-13",
    title: "U15-B - Autumn 2025",
    practice: "Practice U15-2",
    startTime: "17:00",
    endTime: "18:30",
    location: "Amman",
    tone: "amberSecondary",
    attendance: { accepted: 18, declined: 1, pending: 0, waiting: 0 },
    stream: false,
  },
  {
    id: "dec13-red",
    date: "2025-12-13",
    title: "RED U15 - Autumn 2025",
    practice: "Practice RED",
    startTime: "20:30",
    endTime: "22:00",
    location: "Amman",
    tone: "red",
    attendance: { accepted: 15, declined: 0, pending: 0, waiting: 0 },
    stream: false,
  },
  {
    id: "dec12-2021",
    date: "2025-12-12",
    title: "2021 - Autumn 2025",
    practice: "Tournament",
    startTime: "11:00",
    endTime: "12:00",
    location: "Jordan Knights Stadium",
    tone: "sand",
    attendance: { accepted: 22, declined: 0, pending: 0, waiting: 0 },
    stream: false,
  },
];

const calendarWeeks = [
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
  { id: "dec12-2021b", date: "2025-12-12", title: "2021 - Autumn 2025", tone: "sand" },
  { id: "dec12-redb", date: "2025-12-12", title: "RED U15 - Autumn 2025", tone: "red" },
  { id: "dec13-u15bb", date: "2025-12-13", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec13-u15cb", date: "2025-12-13", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec14-u15bb", date: "2025-12-14", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
  { id: "dec14-u15cb", date: "2025-12-14", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec15-u15c", date: "2025-12-15", title: "U15-C - Autumn 2025", tone: "amber" },
  { id: "dec16-u15b", date: "2025-12-16", title: "U15-B - Autumn 2025", tone: "amberSecondary" },
];

const eventsByDate = calendarEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
  (acc[event.date] ??= []).push(event);
  return acc;
}, {});

const scheduleToneClasses: Record<EventTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  amberSecondary: "border-yellow-200 bg-yellow-50 text-yellow-900",
  sand: "border-orange-100 bg-orange-50 text-orange-900",
  red: "border-red-100 bg-red-50 text-red-900",
};

const timelineToneClasses: Record<EventTone, string> = {
  amber: "border-amber-300 bg-amber-50 text-amber-900",
  amberSecondary: "border-yellow-200 bg-yellow-50 text-yellow-900",
  sand: "border-orange-200 bg-orange-50 text-orange-900",
  red: "border-red-300 bg-red-50 text-red-900",
};

const timelineStartMinutes = 9 * 60;
const timelineEndMinutes = 21 * 60;
const hourHeight = 64;
const timelineMinutes = Array.from({ length: timelineEndMinutes / 60 - timelineStartMinutes / 60 + 1 }, (_, index) => timelineStartMinutes + index * 60);
const timelineHeight = ((timelineEndMinutes - timelineStartMinutes) / 60) * hourHeight;

const weekColumns = [
  { label: "mon", date: "2025-12-08" },
  { label: "tue", date: "2025-12-09" },
  { label: "wed", date: "2025-12-10" },
  { label: "thu", date: "2025-12-11" },
  { label: "fri", date: "2025-12-12" },
  { label: "sat", date: "2025-12-13" },
  { label: "sun", date: "2025-12-14", highlight: true },
];

const yearMonths = buildYearCalendar(focusYear);

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar · Jordan Knights Dashboard" },
    { name: "description", content: "Club calendar views for schedule, day, week, month, and year." },
  ];
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<CalendarTab>("Month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <DashboardLayout>
      <>
        <div className="space-y-8">
          <CalendarHeader onCreate={() => setIsCreateOpen(true)} />
          <CalendarBoard activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <CreateEventDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </>
    </DashboardLayout>
  );
}

function CalendarHeader({ onCreate }: { onCreate: () => void }) {
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
        <Button color="blue" onClick={onCreate}>
          <PlusIcon data-slot="icon" />
          Create
        </Button>
      </div>
    </div>
  );
}

function CalendarBoard({ activeTab, onTabChange }: { activeTab: CalendarTab; onTabChange: (tab: CalendarTab) => void }) {
  const { label, subLabel } = toolbarMeta[activeTab];
  const navLabel = navLabels[activeTab];

  const view = (() => {
    switch (activeTab) {
      case "Schedule":
        return <ScheduleView events={detailedEvents} />;
      case "Day":
        return <DayView events={detailedEvents} />;
      case "Week":
        return <WeekView events={detailedEvents} />;
      case "Month":
        return <MonthView />;
      case "Year":
        return <YearView />;
      default:
        return null;
    }
  })();

  return (
    <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full bg-zinc-50 p-1 text-sm font-semibold text-zinc-500">
          {calendarTabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={clsx(
                  "rounded-full px-4 py-1 transition-colors",
                  isActive ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                )}
                aria-pressed={isActive}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-600">
          <IconPillButton label={navLabel.prev}>
            <ChevronLeftIcon />
          </IconPillButton>
          <IconPillButton label={navLabel.next}>
            <ChevronRightIcon />
          </IconPillButton>
          <span className="pl-2 text-base font-semibold text-zinc-900">{label}</span>
        </div>
        <div className="ml-auto flex flex-col text-right text-xs font-semibold text-zinc-500">
          {subLabel && <span>{subLabel}</span>}
          <span className="text-[0.65rem] uppercase tracking-wide text-zinc-400">Jordan Knights FC</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
        <LegendDot color="bg-amber-500" label="Trainings" />
        <LegendDot color="bg-orange-400" label="Tournaments" />
        <LegendDot color="bg-red-500" label="RED U15" />
      </div>

      <div className="mt-6">{view}</div>
    </section>
  );
}

function ScheduleView({ events }: { events: DetailedEvent[] }) {
  const grouped = useMemo(() => groupEventsByDate(events.filter((event) => scheduleOrder.includes(event.date))), [events]);

  return (
    <div className="space-y-8">
      {scheduleOrder.map((date) => {
        const entries = grouped[date];
        if (!entries?.length) return null;
        const { title, subtitle, isToday } = describeDate(date);
        return (
          <div key={date} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
              <span className="text-sm uppercase tracking-wide text-zinc-400">{subtitle}</span>
              {isToday && <Badge color="blue" className="text-xs uppercase">today</Badge>}
            </div>
            <div className="space-y-3">
              {entries.map((event) => (
                <ScheduleCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard({ event }: { event: DetailedEvent }) {
  const toneClass = scheduleToneClasses[event.tone];
  const summary = [
    { label: "Accepted", value: event.attendance.accepted, color: "bg-green-500" },
    { label: "Pending", value: event.attendance.pending, color: "bg-yellow-500" },
    { label: "Declined", value: event.attendance.declined, color: "bg-red-500" },
    { label: "Waiting", value: event.attendance.waiting, color: "bg-zinc-400" },
  ];

  return (
    <div className={clsx("rounded-3xl border p-4 shadow-sm", toneClass)}>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{event.practice}</p>
          <p className="text-lg font-semibold text-zinc-900">{event.title}</p>
          <p className="text-sm font-semibold text-zinc-700">{formatEventTime(event)}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2 text-right text-xs font-semibold text-zinc-500">
          <span className="uppercase tracking-wide text-zinc-400">Attendance</span>
          <div className="flex flex-wrap gap-3">
            {summary.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1">
                <span className={clsx("size-2 rounded-full", item.color)} />
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-4" />
          {formatEventTime(event)}
        </span>
        <span className="inline-flex items-center gap-1">
          <LocationPinIcon className="size-4" />
          {event.location}
        </span>
        {event.stream && (
          <span className="inline-flex items-center gap-1 text-blue-600">
            <VideoIcon className="size-4" />
            Stream available
          </span>
        )}
        {event.acceptedLabel && (
          <span className="inline-flex items-center gap-1 text-green-600">
            <ShieldCheckIcon className="size-4" />
            {event.acceptedLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function DayView({ events }: { events: DetailedEvent[] }) {
  const dayEvents = events.filter((event) => event.date === focusDay);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      <div className="grid grid-cols-[80px_minmax(0,1fr)]">
        <HoursColumn />
        <div className="relative bg-white">
          <TimelineBackground />
          <CurrentTimeMarker minutes={12 * 60} />
          {dayEvents.map((event) => (
            <TimelineEvent key={event.id} event={event} variant="day" />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ events }: { events: DetailedEvent[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      <div className="grid grid-cols-8 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <div className="px-4 py-3" />
        {weekColumns.map((day) => {
          const { title } = describeDate(day.date);
          const dayNumber = title.split(" ")[1];
          return (
            <div key={day.date} className="border-l border-zinc-200 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900 capitalize">{day.label}</p>
              <p className="text-xs text-zinc-500">{dayNumber}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8">
        <HoursColumn className="border-r" />
        {weekColumns.map((day) => (
          <div key={day.date} className="relative border-l border-zinc-100 bg-white">
            <TimelineBackground />
            {day.highlight && <CurrentTimeMarker minutes={12 * 60} subtle />}
            {events
              .filter((event) => event.date === day.date)
              .map((event) => (
                <TimelineEvent key={event.id} event={event} variant="week" />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
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
  );
}

function YearView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {yearMonths.map((month) => (
        <div key={month.name} className="rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-zinc-900">
            <span>{month.name}</span>
            <span className="text-xs text-zinc-400">{month.year}</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-medium text-zinc-400">
            {weekDayHeadings.map((day) => (
              <span key={`${month.name}-${day}`}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-700">
            {month.weeks.flatMap((week, weekIndex) =>
              week.map((value, index) => (
                <span
                  key={`${month.name}-${weekIndex}-${index}`}
                  className={clsx(
                    "rounded-md px-1 py-1",
                    value === null && "text-zinc-300",
                    value === 14 && month.name === "December" && "bg-blue-50 text-blue-600"
                  )}
                >
                  {value ?? ""}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
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
  const tone = scheduleToneClasses[event.tone];

  return (
    <div className={clsx("flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-semibold", tone)}>
      <span className="text-sm font-medium text-zinc-700">{event.title}</span>
    </div>
  );
}

function HoursColumn({ className }: { className?: string } = {}) {
  return (
    <div className={clsx("bg-white", className)}>
      {timelineMinutes.map((minutes, index) => (
        <div
          key={minutes}
          className={clsx(
            "flex h-16 items-start justify-end border-b border-zinc-100 pr-3 text-xs font-semibold text-zinc-400",
            index === timelineMinutes.length - 1 && "border-b-0"
          )}
        >
          {formatHour(minutes)}
        </div>
      ))}
    </div>
  );
}

function TimelineBackground() {
  return (
    <div className="absolute inset-0">
      {timelineMinutes.slice(0, -1).map((minutes) => (
        <div key={minutes} className="h-16 border-b border-dashed border-zinc-100" />
      ))}
    </div>
  );
}

function CurrentTimeMarker({ minutes, subtle }: { minutes: number; subtle?: boolean }) {
  const offset = ((minutes - timelineStartMinutes) / 60) * hourHeight;
  return (
    <div
      className={clsx("absolute left-0 right-0 flex items-center", subtle ? "text-blue-200" : "text-blue-500")}
      style={{ top: offset }}
    >
      <span className={clsx("size-2 rounded-full bg-current", subtle && "opacity-50")} />
      <span className={clsx("ml-2 h-px flex-1 bg-current", subtle && "opacity-30")} />
    </div>
  );
}

function TimelineEvent({ event, variant }: { event: DetailedEvent; variant: "day" | "week" }) {
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);
  const top = ((start - timelineStartMinutes) / 60) * hourHeight;
  const height = Math.max(((end - start) / 60) * hourHeight, 48);
  const tone = timelineToneClasses[event.tone];

  return (
    <div
      className={clsx(
        "absolute left-4 right-4 rounded-2xl border px-3 py-2 text-xs font-medium shadow-sm",
        tone,
        variant === "week" && "left-3 right-3"
      )}
      style={{ top, height }}
    >
      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">{event.practice}</p>
      <p className="text-sm font-semibold text-zinc-900">{event.title}</p>
      <p className="text-xs font-semibold text-zinc-600">{formatEventTime(event)}</p>
    </div>
  );
}

function CreateEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <DialogTitle>Schedule a new event</DialogTitle>
      <DialogDescription>Fill the quick form below to announce a training, scrimmage, or tournament.</DialogDescription>
      <DialogBody>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="event-name" className="text-sm font-semibold text-zinc-700">
              Event name
            </label>
            <Input id="event-name" placeholder="U15 training" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="event-date" className="text-sm font-semibold text-zinc-700">
                Date
              </label>
              <Input id="event-date" type="date" defaultValue="2025-12-14" />
            </div>
            <div className="space-y-2">
              <label htmlFor="event-time" className="text-sm font-semibold text-zinc-700">
                Time
              </label>
              <Input id="event-time" type="time" defaultValue="17:00" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="event-location" className="text-sm font-semibold text-zinc-700">
              Location
            </label>
            <Input id="event-location" placeholder="Jordan Knights Stadium" />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-notes" className="text-sm font-semibold text-zinc-700">
              Notes
            </label>
            <Textarea id="event-notes" rows={4} placeholder="Share any context with your staff and players..." />
          </div>
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button color="blue" onClick={onClose}>
          Create event
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={clsx("size-2 rounded-full", color)} />
      {label}
    </span>
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

function describeDate(date: string) {
  const dateObj = new Date(`${date}T00:00:00`);
  const title = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const subtitle = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  return { title, subtitle, isToday: date === focusDay };
}

function groupEventsByDate<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
}

function formatEventTime(event: DetailedEvent) {
  const start = formatHour(timeToMinutes(event.startTime));
  const end = formatHour(timeToMinutes(event.endTime));
  return `${start} – ${end}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHour(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:00 ${meridiem}`;
}

const weekDayHeadings = ["M", "T", "W", "T", "F", "S", "S"];

type CalendarDay = {
  date: string;
  dayNumber: number;
  isMuted?: boolean;
  isToday?: boolean;
};

type YearMonth = {
  name: string;
  year: number;
  weeks: (number | null)[][];
};

function buildYearCalendar(year: number): YearMonth[] {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    name: new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long" }),
    year,
    weeks: buildMonthMatrix(year, monthIndex),
  }));
}

function buildMonthMatrix(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(7).fill(null);
  let dayOfWeek = ((new Date(year, monthIndex, 1).getDay() + 6) % 7) as number; // Monday-first

  for (let i = 0; i < dayOfWeek; i += 1) {
    week[i] = null;
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    week[dayOfWeek] = day;
    if (dayOfWeek === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
      dayOfWeek = 0;
    } else {
      dayOfWeek += 1;
    }
  }

  if (!weeks.includes(week)) {
    weeks.push(week);
  }

  return weeks;
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 4 5 7v5c0 4.28 2.99 8.42 7 9.99 4.01-1.57 7-5.71 7-9.99V7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.5 11.5 2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="m18 9 3-2v10l-3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
