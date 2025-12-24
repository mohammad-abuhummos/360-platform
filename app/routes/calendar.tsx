import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode, SVGProps } from "react";
import type { Route } from "./+types/calendar";
import { useNavigate } from "react-router";
import clsx from "clsx";
import { Timestamp } from "firebase/firestore";
import { DashboardLayout } from "../components/dashboard-layout";
import { Heading } from "../components/heading";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Avatar } from "../components/avatar";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "../components/dialog";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { useAuth } from "~/context/auth-context";
import {
  subscribeToEvents,
  createEvent,
  type CalendarEvent as DBCalendarEvent,
  type EventType,
  type EventParticipant,
  type GameDetails,
  eventTypeConfig,
  isGameEvent,
} from "~/lib/firestore-events";
import { subscribeToClubMembers, type ClubMember } from "~/lib/firestore-team";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarTabs = ["Schedule", "Day", "Week", "Month", "Year"] as const;

const navLabels: Record<CalendarTab, { prev: string; next: string }> = {
  Schedule: { prev: "Previous schedule", next: "Next schedule" },
  Day: { prev: "Previous day", next: "Next day" },
  Week: { prev: "Previous week", next: "Next week" },
  Month: { prev: "Previous month", next: "Next month" },
  Year: { prev: "Previous year", next: "Next year" },
};

type CalendarTab = (typeof calendarTabs)[number];

function getToolbarMeta(focusDate: Date, activeTab: CalendarTab): { label: string; subLabel?: string } {
  const dayLabel = focusDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const monthLabel = focusDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const weekNumber = getWeekNumber(focusDate);
  const weekLabel = `Week ${weekNumber}, ${focusDate.getFullYear()}`;

  switch (activeTab) {
    case "Schedule":
      return { label: "From today", subLabel: "Upcoming trainings" };
    case "Day":
      return { label: dayLabel, subLabel: weekLabel };
    case "Week":
      return { label: focusDate.toLocaleDateString("en-US", { month: "long" }), subLabel: weekLabel };
    case "Month":
      return { label: monthLabel };
    case "Year":
      return { label: `${focusDate.getFullYear()}` };
    default:
      return { label: "" };
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Timeline settings
const timelineStartMinutes = 9 * 60;
const timelineEndMinutes = 21 * 60;
const hourHeight = 64;
const timelineMinutes = Array.from({ length: timelineEndMinutes / 60 - timelineStartMinutes / 60 + 1 }, (_, index) => timelineStartMinutes + index * 60);

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar · Jordan Knights Dashboard" },
    { name: "description", content: "Club calendar views for schedule, day, week, month, and year." },
  ];
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { activeClub, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<CalendarTab>("Month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [events, setEvents] = useState<DBCalendarEvent[]>([]);
  const [showEventTypeMenu, setShowEventTypeMenu] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ClubMember[]>([]);

  // Subscribe to events from database
  useEffect(() => {
    if (!activeClub?.id) return;

    const unsubscribe = subscribeToEvents(activeClub.id, (fetchedEvents) => {
      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, [activeClub?.id]);

  // Subscribe to team members
  useEffect(() => {
    if (!activeClub?.id) return;

    const unsubscribe = subscribeToClubMembers(activeClub.id, (members) => {
      setTeamMembers(members);
    });

    return () => unsubscribe();
  }, [activeClub?.id]);

  const navigateCalendar = useCallback((direction: "prev" | "next") => {
    const delta = direction === "prev" ? -1 : 1;
    setFocusDate((prev) => {
      const d = new Date(prev);
      switch (activeTab) {
        case "Schedule":
        case "Day":
          d.setDate(d.getDate() + delta);
          break;
        case "Week":
          d.setDate(d.getDate() + delta * 7);
          break;
        case "Month":
          d.setMonth(d.getMonth() + delta);
          break;
        case "Year":
          d.setFullYear(d.getFullYear() + delta);
          break;
      }
      return d;
    });
  }, [activeTab]);

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleCreateEvent = async (eventData: CreateEventFormData) => {
    if (!activeClub?.id || !profile) return;

    const startDate = new Date(`${eventData.startDate}T${eventData.startTime}`);
    const endDate = new Date(`${eventData.endDate}T${eventData.endTime}`);

    // Calculate attendance stats based on organizers and participants
    const acceptedCount = eventData.organizers.filter((o) => o.attendanceStatus === "accepted").length +
      eventData.participants.filter((p) => p.attendanceStatus === "accepted").length;
    const pendingCount = eventData.organizers.filter((o) => o.attendanceStatus === "pending").length +
      eventData.participants.filter((p) => p.attendanceStatus === "pending").length;

    const newEvent: Omit<DBCalendarEvent, "id" | "createdAt" | "updatedAt" | "commentsCount"> = {
      clubId: activeClub.id,
      type: eventData.type,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      startTime: Timestamp.fromDate(startDate),
      endTime: Timestamp.fromDate(endDate),
      meetTimeBefore: eventData.meetTimeBefore,
      repeat: eventData.repeat,
      autoAddAdmins: eventData.autoAddAdmins,
      autoAddPlayers: eventData.autoAddPlayers,
      hideParticipants: eventData.hideParticipants,
      visibility: eventData.visibility,
      showOnWebsite: eventData.showOnWebsite,
      physicalStrain: eventData.physicalStrain,
      attachments: [],
      resources: [],
      organizers: eventData.organizers,
      participants: eventData.participants,
      attendanceStats: {
        accepted: acceptedCount,
        declined: 0,
        pending: pendingCount,
        waiting: 0
      },
      createdBy: profile.id,
      createdByName: profile.displayName,
    };

    if (isGameEvent(eventData.type) && eventData.gameDetails) {
      newEvent.gameDetails = eventData.gameDetails;
    }

    await createEvent(activeClub.id, newEvent);
    setIsCreateOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950">
        <div className="space-y-8">
          <CalendarHeader
            onCreateClick={() => setShowEventTypeMenu(true)}
            showEventTypeMenu={showEventTypeMenu}
            onCloseEventTypeMenu={() => setShowEventTypeMenu(false)}
            onSelectEventType={(type) => {
              setShowEventTypeMenu(false);
              setIsCreateOpen(true);
            }}
          />
          <CalendarBoard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            focusDate={focusDate}
            onNavigate={navigateCalendar}
            events={events}
            onEventClick={handleEventClick}
          />
        </div>
        <CreateEventDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleCreateEvent}
          clubName={activeClub?.name ?? ""}
          teamMembers={teamMembers}
          currentUser={profile}
        />
      </div>
    </DashboardLayout>
  );
}

function CalendarHeader({
  onCreateClick,
  showEventTypeMenu,
  onCloseEventTypeMenu,
  onSelectEventType
}: {
  onCreateClick: () => void;
  showEventTypeMenu: boolean;
  onCloseEventTypeMenu: () => void;
  onSelectEventType: (type: EventType) => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="space-y-2">
        <Badge color="zinc">Organization management</Badge>
        <div>
          <Heading level={1} className="text-3xl font-semibold text-zinc-100">
            Calendar
          </Heading>
          <Text className="text-sm text-zinc-400">Stay updated with the latest fixtures, trainings, and club events.</Text>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button outline className="text-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <ExportIcon data-slot="icon" />
          Export
        </Button>
        <Button outline className="text-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <FilterIcon data-slot="icon" />
          Filter
        </Button>
        <Button plain className="text-sm font-semibold text-zinc-400 hover:text-zinc-200">
          <ShareIcon data-slot="icon" />
          Share
        </Button>
        <div className="relative">
          <Button color="blue" onClick={onCreateClick}>
            <PlusIcon data-slot="icon" />
            Create
          </Button>
          {showEventTypeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={onCloseEventTypeMenu} />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-white p-2 shadow-xl ring-1 ring-zinc-200">
                {(Object.keys(eventTypeConfig) as EventType[]).map((type) => {
                  const config = eventTypeConfig[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onSelectEventType(type)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                    >
                      <span className={clsx("size-2 rounded-full", config.dotColor)} />
                      <span className="text-zinc-900">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarBoard({
  activeTab,
  onTabChange,
  focusDate,
  onNavigate,
  events,
  onEventClick,
}: {
  activeTab: CalendarTab;
  onTabChange: (tab: CalendarTab) => void;
  focusDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  events: DBCalendarEvent[];
  onEventClick: (eventId: string) => void;
}) {
  const { label, subLabel } = getToolbarMeta(focusDate, activeTab);
  const navLabel = navLabels[activeTab];

  const calendarWeeks = useMemo(() => buildCalendarWeeks(focusDate), [focusDate]);
  const weekColumns = useMemo(() => buildWeekColumns(focusDate), [focusDate]);
  const yearMonths = useMemo(() => buildYearCalendar(focusDate.getFullYear()), [focusDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, DBCalendarEvent[]> = {};
    events.forEach((event) => {
      const date = event.startTime?.toDate();
      if (date) {
        const dateStr = formatDateString(date);
        (grouped[dateStr] ??= []).push(event);
      }
    });
    return grouped;
  }, [events]);

  const view = (() => {
    switch (activeTab) {
      case "Schedule":
        return <ScheduleView events={events} focusDate={focusDate} onEventClick={onEventClick} />;
      case "Day":
        return <DayView events={events} focusDate={focusDate} onEventClick={onEventClick} />;
      case "Week":
        return <WeekView events={events} weekColumns={weekColumns} focusDate={focusDate} onEventClick={onEventClick} />;
      case "Month":
        return <MonthView calendarWeeks={calendarWeeks} focusDate={focusDate} eventsByDate={eventsByDate} onEventClick={onEventClick} />;
      case "Year":
        return <YearView yearMonths={yearMonths} focusDate={focusDate} />;
      default:
        return null;
    }
  })();

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full bg-zinc-800 p-1 text-sm font-semibold text-zinc-400">
          {calendarTabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={clsx(
                  "rounded-full px-4 py-1 transition-colors",
                  isActive ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                )}
                aria-pressed={isActive}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-300">
          <IconPillButton label={navLabel.prev} onClick={() => onNavigate("prev")}>
            <ChevronLeftIcon />
          </IconPillButton>
          <IconPillButton label={navLabel.next} onClick={() => onNavigate("next")}>
            <ChevronRightIcon />
          </IconPillButton>
          <span className="pl-2 text-base font-semibold text-zinc-100">{label}</span>
        </div>
        <div className="ml-auto flex flex-col text-right text-xs font-semibold text-zinc-400">
          {subLabel && <span>{subLabel}</span>}
          <span className="text-[0.65rem] uppercase tracking-wide text-zinc-500">Jordan Knights FC</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
        {(Object.keys(eventTypeConfig) as EventType[]).map((type) => {
          const config = eventTypeConfig[type];
          return (
            <LegendDot key={type} color={config.dotColor} label={config.label} />
          );
        })}
      </div>

      <div className="mt-6">{view}</div>
    </section>
  );
}

function ScheduleView({ events, focusDate, onEventClick }: { events: DBCalendarEvent[]; focusDate: Date; onEventClick: (id: string) => void }) {
  const focusDateStr = formatDateString(focusDate);

  // Get events from focus date onwards
  const upcomingEvents = events.filter((event) => {
    const eventDate = event.startTime?.toDate();
    return eventDate && eventDate >= focusDate;
  }).slice(0, 10);

  // Group by date
  const grouped = useMemo(() => {
    const g: Record<string, DBCalendarEvent[]> = {};
    upcomingEvents.forEach((event) => {
      const date = event.startTime?.toDate();
      if (date) {
        const dateStr = formatDateString(date);
        (g[dateStr] ??= []).push(event);
      }
    });
    return g;
  }, [upcomingEvents]);

  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarEmptyIcon className="size-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dates.map((date) => {
        const entries = grouped[date];
        const { title, subtitle, isToday } = describeDate(date, focusDateStr);
        return (
          <div key={date} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
              <span className="text-sm uppercase tracking-wide text-zinc-500">{subtitle}</span>
              {isToday && <Badge color="blue" className="text-xs uppercase">today</Badge>}
            </div>
            <div className="space-y-3">
              {entries.map((event) => (
                <ScheduleCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard({ event, onClick }: { event: DBCalendarEvent; onClick: () => void }) {
  const config = eventTypeConfig[event.type];
  const toneClass = getEventToneClass(event.type);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("w-full text-left rounded-3xl border p-4 shadow-lg shadow-black/20 transition-transform hover:scale-[1.01]", toneClass)}
    >
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{config.label}</p>
          <p className="text-lg font-semibold">{event.title}</p>
          <p className="text-sm font-semibold opacity-80">{formatEventTimeRange(event)}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2 text-right text-xs font-semibold text-zinc-400">
          <span className="uppercase tracking-wide text-zinc-500">Attendance</span>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500" />
              {event.attendanceStats.accepted}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-yellow-500" />
              {event.attendanceStats.pending}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-red-500" />
              {event.attendanceStats.declined}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-300">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-4" />
          {formatEventTimeRange(event)}
        </span>
        <span className="inline-flex items-center gap-1">
          <LocationPinIcon className="size-4" />
          {event.location}
        </span>
      </div>
    </button>
  );
}

function DayView({ events, focusDate, onEventClick }: { events: DBCalendarEvent[]; focusDate: Date; onEventClick: (id: string) => void }) {
  const focusDateStr = formatDateString(focusDate);
  const dayEvents = events.filter((event) => {
    const eventDate = event.startTime?.toDate();
    return eventDate && formatDateString(eventDate) === focusDateStr;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700">
      <div className="grid grid-cols-[80px_minmax(0,1fr)]">
        <HoursColumn />
        <div className="relative bg-zinc-800">
          <TimelineBackground />
          <CurrentTimeMarker minutes={new Date().getHours() * 60 + new Date().getMinutes()} />
          {dayEvents.map((event) => (
            <TimelineEvent key={event.id} event={event} variant="day" onClick={() => onEventClick(event.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ events, weekColumns, focusDate, onEventClick }: { events: DBCalendarEvent[]; weekColumns: WeekColumn[]; focusDate: Date; onEventClick: (id: string) => void }) {
  const focusDateStr = formatDateString(focusDate);
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700">
      <div className="grid grid-cols-8 bg-zinc-800 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <div className="px-4 py-3" />
        {weekColumns.map((day) => {
          const { title } = describeDate(day.date, focusDateStr);
          const dayNumber = title.split(" ")[1];
          return (
            <div key={day.date} className="border-l border-zinc-700 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-200 capitalize">{day.label}</p>
              <p className="text-xs text-zinc-500">{dayNumber}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8">
        <HoursColumn className="border-r border-zinc-700" />
        {weekColumns.map((day) => {
          const dayEvents = events.filter((event) => {
            const eventDate = event.startTime?.toDate();
            return eventDate && formatDateString(eventDate) === day.date;
          });
          return (
            <div key={day.date} className="relative border-l border-zinc-700/50 bg-zinc-800">
              <TimelineBackground />
              {day.highlight && <CurrentTimeMarker minutes={new Date().getHours() * 60 + new Date().getMinutes()} subtle />}
              {dayEvents.map((event) => (
                <TimelineEvent key={event.id} event={event} variant="week" onClick={() => onEventClick(event.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ calendarWeeks, focusDate, eventsByDate, onEventClick }: { calendarWeeks: CalendarWeek[]; focusDate: Date; eventsByDate: Record<string, DBCalendarEvent[]>; onEventClick: (id: string) => void }) {
  const focusDateStr = formatDateString(focusDate);
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700">
      <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] bg-zinc-800 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <div className="px-4 py-3 text-[0.65rem] font-semibold text-zinc-500">Week</div>
        {daysOfWeek.map((day) => (
          <div key={day} className="border-l border-zinc-700 px-4 py-3">
            {day}
          </div>
        ))}
      </div>
      {calendarWeeks.map((week) => (
        <div key={week.label} className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] border-t border-zinc-700 bg-zinc-900">
          <div className="px-4 py-3 text-xs font-semibold text-zinc-500">{week.label}</div>
          {week.days.map((day) => (
            <DayCell key={day.date} day={day} focusDateStr={focusDateStr} events={eventsByDate[day.date] || []} onEventClick={onEventClick} />
          ))}
        </div>
      ))}
    </div>
  );
}

function YearView({ yearMonths, focusDate }: { yearMonths: YearMonth[]; focusDate: Date }) {
  const focusDay = focusDate.getDate();
  const focusMonth = focusDate.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {yearMonths.map((month) => (
        <div key={month.name} className="rounded-2xl border border-zinc-700 bg-zinc-800 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-zinc-200">
            <span>{month.name}</span>
            <span className="text-xs text-zinc-500">{month.year}</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-medium text-zinc-500">
            {weekDayHeadings.map((day, idx) => (
              <span key={`${month.name}-${day}-${idx}`}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-300">
            {month.weeks.flatMap((week, weekIndex) =>
              week.map((value, index) => (
                <span
                  key={`${month.name}-${weekIndex}-${index}`}
                  className={clsx(
                    "rounded-md px-1 py-1",
                    value === null && "text-zinc-600",
                    value === focusDay && month.name === focusMonth && "bg-blue-600 text-white"
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

function DayCell({ day, focusDateStr, events, onEventClick }: { day: CalendarDay; focusDateStr: string; events: DBCalendarEvent[]; onEventClick: (id: string) => void }) {
  const isToday = day.date === focusDateStr;
  const monthLabel = new Date(day.date).toLocaleDateString("en-US", { month: "short" });

  return (
    <div
      className={clsx(
        "min-h-[140px] border-l border-zinc-700 p-4 transition-colors",
        day.isMuted ? "bg-zinc-800/50 text-zinc-500" : "bg-zinc-900"
      )}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
        {isToday ? (
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {day.dayNumber}
          </span>
        ) : (
          <span className={clsx("text-sm font-semibold", day.isMuted ? "text-zinc-500" : "text-zinc-300")}>{day.dayNumber}</span>
        )}
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-600">{monthLabel}</span>
      </div>
      <div className="mt-3 space-y-2">
        {events.slice(0, 3).map((event) => (
          <EventPill key={event.id} event={event} onClick={() => onEventClick(event.id)} />
        ))}
        {events.length > 3 && (
          <span className="text-xs text-zinc-500">+{events.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

function EventPill({ event, onClick }: { event: DBCalendarEvent; onClick: () => void }) {
  const toneClass = getEventToneClass(event.type);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("flex w-full items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-semibold text-left transition-transform hover:scale-[1.02]", toneClass)}
    >
      <span className="text-sm font-medium truncate">{event.title}</span>
    </button>
  );
}

function HoursColumn({ className }: { className?: string } = {}) {
  return (
    <div className={clsx("bg-zinc-900", className)}>
      {timelineMinutes.map((minutes, index) => (
        <div
          key={minutes}
          className={clsx(
            "flex h-16 items-start justify-end border-b border-zinc-700/50 pr-3 text-xs font-semibold text-zinc-500",
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
        <div key={minutes} className="h-16 border-b border-dashed border-zinc-700/30" />
      ))}
    </div>
  );
}

function CurrentTimeMarker({ minutes, subtle }: { minutes: number; subtle?: boolean }) {
  if (minutes < timelineStartMinutes || minutes > timelineEndMinutes) return null;
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

function TimelineEvent({ event, variant, onClick }: { event: DBCalendarEvent; variant: "day" | "week"; onClick: () => void }) {
  const startDate = event.startTime?.toDate();
  const endDate = event.endTime?.toDate();
  if (!startDate || !endDate) return null;

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

  if (startMinutes < timelineStartMinutes || startMinutes > timelineEndMinutes) return null;

  const top = ((startMinutes - timelineStartMinutes) / 60) * hourHeight;
  const height = Math.max(((endMinutes - startMinutes) / 60) * hourHeight, 48);
  const toneClass = getEventToneClass(event.type);
  const config = eventTypeConfig[event.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "absolute left-4 right-4 rounded-2xl border px-3 py-2 text-xs font-medium shadow-lg shadow-black/20 text-left transition-transform hover:scale-[1.02]",
        toneClass,
        variant === "week" && "left-3 right-3"
      )}
      style={{ top, height }}
    >
      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">{config.label}</p>
      <p className="text-sm font-semibold">{event.title}</p>
      <p className="text-xs font-semibold opacity-80">{formatEventTimeRange(event)}</p>
    </button>
  );
}

// ==================== Create Event Dialog ====================

type CreateEventFormData = {
  type: EventType;
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetTimeBefore: number;
  repeat: "none" | "daily" | "weekly" | "biweekly" | "monthly";
  autoAddAdmins: boolean;
  autoAddPlayers: boolean;
  hideParticipants: boolean;
  visibility: "everyone" | "organizers_only" | "participants_only";
  showOnWebsite: boolean;
  physicalStrain: number;
  gameDetails?: GameDetails;
  organizers: EventParticipant[];
  participants: EventParticipant[];
};

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
};

function CreateEventDialog({
  open,
  onClose,
  onSave,
  clubName,
  teamMembers,
  currentUser,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateEventFormData) => void;
  clubName: string;
  teamMembers: ClubMember[];
  currentUser: UserProfile | null;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [showOrganizerPicker, setShowOrganizerPicker] = useState(false);
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserAsOrganizer: EventParticipant | null = currentUser ? {
    id: currentUser.id,
    name: currentUser.displayName,
    initials: getInitials(currentUser.displayName),
    role: "organizer",
    attendanceStatus: "accepted",
  } : null;

  const [formData, setFormData] = useState<CreateEventFormData>({
    type: "practice",
    title: "",
    description: "",
    location: "",
    startDate: today,
    startTime: "09:00",
    endDate: today,
    endTime: "10:00",
    meetTimeBefore: 0,
    repeat: "none",
    autoAddAdmins: false,
    autoAddPlayers: false,
    hideParticipants: false,
    visibility: "everyone",
    showOnWebsite: true,
    physicalStrain: 50,
    gameDetails: {
      isFriendlyMatch: false,
      gameFormat: "11v11",
      periods: 2,
      periodLength: 45,
    },
    organizers: currentUserAsOrganizer ? [currentUserAsOrganizer] : [],
    participants: [],
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && currentUserAsOrganizer) {
      setFormData((prev) => ({
        ...prev,
        organizers: [currentUserAsOrganizer],
        participants: [],
      }));
    }
  }, [open, currentUser?.id]);

  const updateField = <K extends keyof CreateEventFormData>(key: K, value: CreateEventFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateGameDetails = <K extends keyof GameDetails>(key: K, value: GameDetails[K]) => {
    setFormData((prev) => ({
      ...prev,
      gameDetails: { ...prev.gameDetails!, [key]: value },
    }));
  };

  const addOrganizer = (member: ClubMember) => {
    if (formData.organizers.some((o) => o.id === member.id)) return;
    const newOrganizer: EventParticipant = {
      id: member.id,
      name: member.name,
      initials: member.initials,
      role: "organizer",
      attendanceStatus: "pending",
    };
    setFormData((prev) => ({
      ...prev,
      organizers: [...prev.organizers, newOrganizer],
    }));
  };

  const removeOrganizer = (id: string) => {
    // Don't remove the current user
    if (id === currentUser?.id) return;
    setFormData((prev) => ({
      ...prev,
      organizers: prev.organizers.filter((o) => o.id !== id),
    }));
  };

  const addParticipant = (member: ClubMember) => {
    if (formData.participants.some((p) => p.id === member.id)) return;
    const newParticipant: EventParticipant = {
      id: member.id,
      name: member.name,
      initials: member.initials,
      role: "participant",
      attendanceStatus: "pending",
    };
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
    }));
  };

  const removeParticipant = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const staffMembers = filteredMembers.filter((m) => m.segment === "staff");
  const playerMembers = filteredMembers.filter((m) => m.segment === "player");

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.location.trim()) return;
    onSave(formData);
    // Reset form
    setFormData({
      type: "practice",
      title: "",
      description: "",
      location: "",
      startDate: today,
      startTime: "09:00",
      endDate: today,
      endTime: "10:00",
      meetTimeBefore: 0,
      repeat: "none",
      autoAddAdmins: false,
      autoAddPlayers: false,
      hideParticipants: false,
      visibility: "everyone",
      showOnWebsite: true,
      physicalStrain: 50,
      gameDetails: {
        isFriendlyMatch: false,
        gameFormat: "11v11",
        periods: 2,
        periodLength: 45,
      },
      organizers: currentUserAsOrganizer ? [currentUserAsOrganizer] : [],
      participants: [],
    });
    setShowOrganizerPicker(false);
    setShowParticipantPicker(false);
  };

  return (
    <Dialog open={open} onClose={onClose} size="2xl" className="!bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
        <div className="flex items-center gap-3">
          <Button plain onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <ChevronLeftIcon className="size-5 text-zinc-400" />
          </Button>
          <CalendarEmptyIcon className="size-5 text-zinc-400" />
          <DialogTitle className="text-zinc-100 text-lg font-semibold">Create event</DialogTitle>
        </div>
        <div className="flex gap-2">
          <Button outline onClick={onClose} className="text-zinc-300 border-zinc-600 hover:bg-zinc-800">Cancel</Button>
          <Button color="blue" onClick={handleSubmit}>Save</Button>
        </div>
      </div>

      <DialogBody className="mt-6 max-h-[70vh] overflow-y-auto">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Form */}
          <div className="space-y-6">
            <div className="text-sm text-zinc-400">
              New event in: <span className="text-blue-400 font-medium">{clubName} <ChevronDownSmallIcon className="inline size-4" /></span>
            </div>

            {/* Event Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                <CalendarEmptyIcon className="size-5 text-zinc-400" />
                Event information
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Event type</label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value as EventType)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {(Object.keys(eventTypeConfig) as EventType[]).map((type) => (
                    <option key={type} value={type}>
                      {eventTypeConfig[type].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Event title <span className="text-red-400 text-xs">Required</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Event title"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Location <span className="text-red-400 text-xs">Required</span>
                </label>
                <div className="relative">
                  <LocationPinIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Location"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date/Time */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Start time</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                    />
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => updateField("startTime", e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">End time</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField("endDate", e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                    />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => updateField("endTime", e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-400">(GMT +03:00) Amman, Zarqa, Irbid, Russeifa</p>
              </div>

              {/* Meet time before */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Meet time before event</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-2 rounded-l-lg border border-r-0 border-zinc-700">Minutes</span>
                  <input
                    type="number"
                    value={formData.meetTimeBefore}
                    onChange={(e) => updateField("meetTimeBefore", parseInt(e.target.value) || 0)}
                    className="w-24 rounded-r-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min={0}
                  />
                </div>
              </div>

              {/* RSVP Before */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-300">RSVP Before</span>
              </label>

              {/* Repeat */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Repeat</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.repeat}
                    onChange={(e) => updateField("repeat", e.target.value as CreateEventFormData["repeat"])}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">Until</span>
                    <input
                      type="date"
                      disabled={formData.repeat === "none"}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-12 pr-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-zinc-900 disabled:text-zinc-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Auto-add settings */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Auto-add new group members</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoAddAdmins}
                      onChange={(e) => updateField("autoAddAdmins", e.target.checked)}
                      className="size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-400">Add new admins/staff as organizers to this event</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoAddPlayers}
                      onChange={(e) => updateField("autoAddPlayers", e.target.checked)}
                      className="size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-400">Add new players as participants to this event</span>
                  </label>
                </div>
              </div>

              {/* Participants visibility */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Participants visibility</label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hideParticipants}
                    onChange={(e) => updateField("hideParticipants", e.target.checked)}
                    className="mt-1 size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-300">Hide participants</span>
                    <p className="text-xs text-zinc-500 mt-0.5">Toggle this setting to hide participants from each other. Organizers will still be able to see all participants.</p>
                  </div>
                </label>
              </div>

              {/* Visibility */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
                <label className="text-sm font-medium text-zinc-300">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => updateField("visibility", e.target.value as CreateEventFormData["visibility"])}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="everyone">Visible to everyone in {clubName}</option>
                  <option value="organizers_only">Organizers only</option>
                  <option value="participants_only">Participants only</option>
                </select>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnWebsite}
                    onChange={(e) => updateField("showOnWebsite", e.target.checked)}
                    className="size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-400">Show on website</span>
                </label>
              </div>

              {/* Add attachments */}
              <Button outline className="text-sm text-blue-400 border-zinc-700 hover:bg-zinc-800">
                <PlusIcon className="size-4" />
                Add attachments
              </Button>

              {/* Physical strain */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Physical strain</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-400">Low</span>
                  <div className="flex-1 relative">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.physicalStrain}
                      onChange={(e) => updateField("physicalStrain", parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 size-4 bg-zinc-100 border-2 border-blue-500 rounded-full shadow-md pointer-events-none"
                      style={{ left: `calc(${formData.physicalStrain}% - 8px)` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-400">High</span>
                </div>
                <p className="text-xs text-zinc-500">Enter the expected physical strain to track load levels of attendees.</p>
              </div>

              {/* Game Details Section (only for game/cup) */}
              {isGameEvent(formData.type) && (
                <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                    <GameIcon className="size-5 text-zinc-400" />
                    Game details
                  </div>

                  {/* Teams */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Teams</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-zinc-700 flex items-center justify-center">
                          <ShieldIcon className="size-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{clubName}</p>
                          <p className="text-xs text-zinc-500">Home</p>
                        </div>
                      </div>
                      <Button outline className="size-8 p-0 border-zinc-600">
                        <SwitchIcon className="size-4 text-zinc-400" />
                      </Button>
                      <Button outline className="size-8 p-0 border-zinc-600">
                        <PlusIcon className="size-4 text-zinc-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Game start */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Game start</label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                    />
                  </div>

                  {/* Competition */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Competition</label>
                    <Button outline className="text-sm text-blue-400 border-zinc-700 hover:bg-zinc-800">
                      <SearchIcon className="size-4" />
                      Select competition
                    </Button>
                  </div>

                  {/* Friendly match */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gameDetails?.isFriendlyMatch}
                      onChange={(e) => updateGameDetails("isFriendlyMatch", e.target.checked)}
                      className="mt-1 size-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-zinc-300">Friendly match</span>
                      <p className="text-xs text-zinc-500 mt-0.5">If this is a friendly match, toggle this switch to be able to filter it out in reporting.</p>
                    </div>
                  </label>

                  {/* Game format */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Game format</label>
                    <select
                      value={formData.gameDetails?.gameFormat}
                      onChange={(e) => updateGameDetails("gameFormat", e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="11v11">11v11</option>
                      <option value="9v9">9v9</option>
                      <option value="7v7">7v7</option>
                      <option value="5v5">5v5</option>
                    </select>
                  </div>

                  {/* Periods */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Periods</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateGameDetails("periods", Math.max(1, (formData.gameDetails?.periods || 2) - 1))}
                          className="size-10 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
                        >
                          <MinusIcon className="size-4 text-zinc-400" />
                        </button>
                        <input
                          type="number"
                          value={formData.gameDetails?.periods}
                          onChange={(e) => updateGameDetails("periods", parseInt(e.target.value) || 2)}
                          className="w-16 text-center rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min={1}
                        />
                        <button
                          type="button"
                          onClick={() => updateGameDetails("periods", (formData.gameDetails?.periods || 2) + 1)}
                          className="size-10 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
                        >
                          <PlusIcon className="size-4 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Period length</label>
                      <div className="flex items-center">
                        <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-2 rounded-l-lg border border-r-0 border-zinc-700">Minutes</span>
                        <input
                          type="number"
                          value={formData.gameDetails?.periodLength}
                          onChange={(e) => updateGameDetails("periodLength", parseInt(e.target.value) || 45)}
                          className="w-20 rounded-r-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formData.gameDetails?.periods} x {formData.gameDetails?.periodLength} min ({(formData.gameDetails?.periods || 2) * (formData.gameDetails?.periodLength || 45)} minutes)
                  </p>

                  {/* Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Field</label>
                    <input
                      type="text"
                      value={formData.gameDetails?.field || ""}
                      onChange={(e) => updateGameDetails("field", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Field type</label>
                    <select
                      value={formData.gameDetails?.fieldType || "unknown"}
                      onChange={(e) => updateGameDetails("fieldType", e.target.value as GameDetails["fieldType"])}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="grass">Grass</option>
                      <option value="artificial">Artificial</option>
                      <option value="indoor">Indoor</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                <OrganizerIcon className="size-5 text-amber-400" />
                Organizers ({formData.organizers.length})
              </div>

              {/* Selected organizers list */}
              <div className="space-y-2">
                {formData.organizers.map((organizer) => (
                  <div key={organizer.id} className="flex items-center gap-3 rounded-lg bg-zinc-800 p-3 border border-zinc-700">
                    <Avatar initials={organizer.initials} className="size-9 bg-amber-900/50 text-amber-300" />
                    <span className="text-sm font-medium text-zinc-100 flex-1">{organizer.name}</span>
                    {organizer.id !== currentUser?.id && (
                      <button
                        type="button"
                        onClick={() => removeOrganizer(organizer.id)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <XSmallIcon className="size-4 text-zinc-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add organizers button */}
              <div className="relative">
                <Button
                  outline
                  className="w-full text-sm text-blue-400 border-zinc-700 hover:bg-zinc-800"
                  onClick={() => {
                    setShowOrganizerPicker(!showOrganizerPicker);
                    setShowParticipantPicker(false);
                    setSearchQuery("");
                  }}
                >
                  <PlusIcon className="size-4" />
                  Add organizers
                </Button>

                {/* Organizer picker dropdown */}
                {showOrganizerPicker && (
                  <MemberPickerDropdown
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    staffMembers={staffMembers}
                    playerMembers={playerMembers}
                    selectedIds={formData.organizers.map((o) => o.id)}
                    onSelect={addOrganizer}
                    onClose={() => setShowOrganizerPicker(false)}
                  />
                )}
              </div>
              <p className="text-xs text-zinc-500">Invites will be sent to {formData.organizers.length} organizer{formData.organizers.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                <UsersIcon className="size-5 text-blue-400" />
                Participants ({formData.participants.length})
              </div>

              {/* Selected participants list */}
              {formData.participants.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 rounded-lg bg-zinc-800 p-3 border border-zinc-700">
                      <Avatar initials={participant.initials} className="size-9 bg-blue-900/50 text-blue-300" />
                      <span className="text-sm font-medium text-zinc-100 flex-1">{participant.name}</span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.id)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <XSmallIcon className="size-4 text-zinc-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add participants button */}
              <div className="relative">
                <Button
                  outline
                  className="w-full text-sm text-blue-400 border-zinc-700 hover:bg-zinc-800"
                  onClick={() => {
                    setShowParticipantPicker(!showParticipantPicker);
                    setShowOrganizerPicker(false);
                    setSearchQuery("");
                  }}
                >
                  <PlusIcon className="size-4" />
                  Add participants
                </Button>

                {/* Participant picker dropdown */}
                {showParticipantPicker && (
                  <MemberPickerDropdown
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    staffMembers={staffMembers}
                    playerMembers={playerMembers}
                    selectedIds={formData.participants.map((p) => p.id)}
                    onSelect={addParticipant}
                    onClose={() => setShowParticipantPicker(false)}
                  />
                )}
              </div>
              <p className="text-xs text-zinc-500">Invites will be sent to {formData.participants.length} participant{formData.participants.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

// Member picker dropdown component
function MemberPickerDropdown({
  searchQuery,
  onSearchChange,
  staffMembers,
  playerMembers,
  selectedIds,
  onSelect,
  onClose,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  staffMembers: ClubMember[];
  playerMembers: ClubMember[];
  selectedIds: string[];
  onSelect: (member: ClubMember) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-zinc-800 shadow-xl border border-zinc-700 max-h-80 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-zinc-700">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Members list */}
        <div className="overflow-y-auto max-h-60">
          {staffMembers.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                Staff ({staffMembers.length})
              </div>
              {staffMembers.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => !isSelected && onSelect(member)}
                    disabled={isSelected}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      isSelected ? "bg-blue-900/30 cursor-not-allowed" : "hover:bg-zinc-700"
                    )}
                  >
                    <Avatar initials={member.initials} className="size-8 bg-amber-900/50 text-amber-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{member.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{member.title || member.role}</p>
                    </div>
                    {isSelected && <CheckCircleIcon className="size-5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {playerMembers.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                Players ({playerMembers.length})
              </div>
              {playerMembers.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => !isSelected && onSelect(member)}
                    disabled={isSelected}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      isSelected ? "bg-blue-900/30 cursor-not-allowed" : "hover:bg-zinc-700"
                    )}
                  >
                    <Avatar initials={member.initials} className="size-8 bg-blue-900/50 text-blue-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{member.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{member.title || member.role}</p>
                    </div>
                    {isSelected && <CheckCircleIcon className="size-5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {staffMembers.length === 0 && playerMembers.length === 0 && (
            <div className="p-6 text-center text-sm text-zinc-400">
              No members found
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== Helper Functions ====================

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "??";
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function describeDate(date: string, focusDateStr?: string) {
  const dateObj = new Date(`${date}T00:00:00`);
  const title = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const subtitle = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  return { title, subtitle, isToday: focusDateStr ? date === focusDateStr : false };
}

function formatEventTimeRange(event: DBCalendarEvent): string {
  const start = event.startTime?.toDate();
  const end = event.endTime?.toDate();
  if (!start) return "";

  const startStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endStr = end?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return endStr ? `${startStr} – ${endStr}` : startStr;
}

function formatHour(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:00 ${meridiem}`;
}

function getEventToneClass(type: EventType): string {
  const tones: Record<EventType, string> = {
    game: "border-green-700/50 bg-green-900/40 text-green-100",
    practice: "border-amber-700/50 bg-amber-900/40 text-amber-100",
    meeting: "border-blue-700/50 bg-blue-900/40 text-blue-100",
    camp: "border-purple-700/50 bg-purple-900/40 text-purple-100",
    cup: "border-red-700/50 bg-red-900/40 text-red-100",
    other: "border-zinc-700/50 bg-zinc-800/40 text-zinc-100",
  };
  return tones[type] || tones.other;
}

// ==================== Calendar Building Functions ====================

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

type WeekColumn = {
  label: string;
  date: string;
  highlight?: boolean;
};

type YearMonth = {
  name: string;
  year: number;
  weeks: (number | null)[][];
};

const weekDayHeadings = ["M", "T", "W", "T", "F", "S", "S"];

function buildCalendarWeeks(focusDate: Date): CalendarWeek[] {
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const focusDateStr = formatDateString(focusDate);

  const weeks: CalendarWeek[] = [];
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  const startDate = new Date(firstDay);
  startDate.setDate(1 - startDayOfWeek);

  let currentDate = new Date(startDate);

  while (currentDate <= lastDay || currentDate.getDay() !== 1) {
    const week: CalendarDay[] = [];
    const weekNumber = getWeekNumber(currentDate);

    for (let i = 0; i < 7; i++) {
      const dateStr = formatDateString(currentDate);
      week.push({
        date: dateStr,
        dayNumber: currentDate.getDate(),
        isMuted: currentDate.getMonth() !== month,
        isToday: dateStr === focusDateStr,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push({ label: String(weekNumber), days: week });

    if (currentDate.getMonth() !== month && currentDate.getDay() === 1) {
      break;
    }
  }

  return weeks;
}

function buildWeekColumns(focusDate: Date): WeekColumn[] {
  const dayLabels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const startOfWeek = new Date(focusDate);
  const dayOfWeek = (focusDate.getDay() + 6) % 7;
  startOfWeek.setDate(focusDate.getDate() - dayOfWeek);

  const focusDateStr = formatDateString(focusDate);

  return dayLabels.map((label, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    const dateStr = formatDateString(d);
    return {
      label,
      date: dateStr,
      highlight: dateStr === focusDateStr,
    };
  });
}

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
  let dayOfWeek = ((new Date(year, monthIndex, 1).getDay() + 6) % 7) as number;

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

// ==================== UI Components ====================

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={clsx("size-2 rounded-full", color)} />
      {label}
    </span>
  );
}

function IconPillButton({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-600 hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

// ==================== Icons ====================

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

function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} className="size-4">
      <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarEmptyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

function GameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className="size-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18" />
      <path d="M3.5 9h17M3.5 15h17" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 3L4 6v6c0 4.28 2.99 8.42 8 9.99 5.01-1.57 8-5.71 8-9.99V6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className="size-5">
      <circle cx="9" cy="7" r="3" />
      <path d="M15 11a3 3 0 1 0-2.75-4" />
      <path d="M4 19a5 5 0 0 1 10 0M14 19a4 4 0 0 1 8 0" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function SwitchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function OrganizerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M18.5 10.5l1.5-1.5-2-2-1.5 1.5 2 2z" />
      <path d="M16.5 12.5l-1 1 2 2 1-1-2-2z" />
    </svg>
  );
}

function XSmallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronDownSmallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}
