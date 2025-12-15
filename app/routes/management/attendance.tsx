'use client'

import { useState } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Badge } from "../../components/badge";
import { Avatar } from "../../components/avatar";
import { Input } from "../../components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";

// Mock data for demonstration
const mockGroupData = [
  { name: "On Field", total: 0, game: 0, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 0, attendanceRate: "0%", unhandledRate: "0%" },
  { name: "2021", total: 11, game: 0, practice: 11, meeting: 0, camp: 0, cup: 0, other: 0, invited: 44, attendanceRate: "100%", unhandledRate: "0%" },
  { name: "AL-AQABA", total: 1, game: 1, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 15, attendanceRate: "100%", unhandledRate: "0%" },
  { name: "AL-KARAK", total: 1, game: 1, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 18, attendanceRate: "100%", unhandledRate: "0%" },
  { name: "AL-TAFEELA", total: 1, game: 1, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 13, attendanceRate: "100%", unhandledRate: "0%" },
  { name: "Academy Teams", total: 0, game: 0, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 0, attendanceRate: "0%", unhandledRate: "0%" },
  { name: "Al-Aqaba", total: 7, game: 7, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 13, attendanceRate: "53.85%", unhandledRate: "46.15%" },
  { name: "Al-Ramtha", total: 7, game: 7, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 18, attendanceRate: "66.67%", unhandledRate: "33.33%" },
  { name: "Al-Salt", total: 7, game: 7, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 17, attendanceRate: "41.18%", unhandledRate: "58.82%" },
  { name: "Amman", total: 5, game: 5, practice: 0, meeting: 0, camp: 0, cup: 0, other: 0, invited: 15, attendanceRate: "86.67%", unhandledRate: "13.33%" },
];

const mockIndividualData = [
  { name: "Abdallah Al-Zoubi", initials: "AA", totalEvents: 16, attended: 15, attendedPercent: "94%", absent: 1, absentPercent: "6%", school: 0, travel: 0, other: 1, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdallah Kanash", initials: "AK", totalEvents: 33, attended: 33, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdallah Sous", initials: "AS", totalEvents: 26, attended: 26, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdalrahman Albawaneh", initials: "AA", totalEvents: 25, attended: 25, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdullah Abu khass", initials: "AA", totalEvents: 32, attended: 32, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdullha El Qutab", initials: "AE", totalEvents: 288, attended: 288, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Abdullah Kleishat", initials: "AK", totalEvents: 28, attended: 28, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "abed al aziz alnatsheh", initials: "AA", totalEvents: 16, attended: 16, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "abedalazz Al bahran", initials: "AA", totalEvents: 31, attended: 31, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Adam Aboura", initials: "AA", totalEvents: 25, attended: 25, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
  { name: "Adam Abuzahra", initials: "AA", totalEvents: 32, attended: 31, attendedPercent: "97%", absent: 1, absentPercent: "3%", school: 0, travel: 0, other: 1, unhandled: 0, unhandledPercent: "0%" },
  { name: "Adam Al Qasim", initials: "AA", totalEvents: 26, attended: 26, attendedPercent: "100%", absent: 0, absentPercent: "0%", school: 0, travel: 0, other: 0, unhandled: 0, unhandledPercent: "0%" },
];

const mockEventData: any[] = [];

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<"overview" | "group" | "individual" | "event">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "group", label: "Group report" },
    { id: "individual", label: "Individual report" },
    { id: "event", label: "Event report" },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button plain className="!p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Heading>Attendance</Heading>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button color="dark">
            <PlusIcon />
          </Button>
          <Button plain className="!p-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="3" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "group" && <GroupReportTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === "individual" && <IndividualReportTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === "event" && <EventReportTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
    </DashboardLayout>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Date and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium">Date</span>
          <span className="text-sm text-blue-600">10/1/2025 – Today</span>
        </div>
        <Button outline>
          <FunnelIcon />
          Filters
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Attendance Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-medium text-zinc-500">Avg. attendance</h3>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-semibold">99.3%</div>
            <div className="text-sm text-zinc-500">of 522 events</div>
          </div>

          {/* Attendance breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="green">Attended</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">10016 activities</span>
                <span className="text-sm text-zinc-500">99.3%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="red">Didn't attend</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">36 activities</span>
                <span className="text-sm text-zinc-500">0.4%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="zinc">No response</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">38 activities</span>
                <span className="text-sm text-zinc-500">0.4%</span>
              </div>
            </div>
          </div>

          {/* Simple chart representation */}
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 400 180">
              <line x1="40" y1="150" x2="360" y2="150" stroke="currentColor" strokeWidth="1" className="text-zinc-200" />
              <polyline
                points="40,100 200,80 360,130"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-500"
              />
              {[40, 200, 360].map((x, i) => (
                <circle key={i} cx={x} cy={i === 0 ? 100 : i === 1 ? 80 : 130} r="4" fill="currentColor" className="text-green-500" />
              ))}
              <polyline
                points="40,150 200,150 360,150"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-300"
              />
              <text x="40" y="170" className="text-xs fill-zinc-500" textAnchor="middle">Oct 1, 2025</text>
              <text x="360" y="170" className="text-xs fill-zinc-500" textAnchor="middle">Dec 14, 2025</text>
            </svg>
          </div>
        </div>

        {/* Breakdown Attendance - Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h3 className="text-sm font-medium text-zinc-500">Breakdown attendance</h3>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Green segment - 99.3% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-green-200 dark:text-green-900"
                  strokeDasharray="219.91 219.91"
                  strokeDashoffset="0"
                />
                {/* Red segment - 0.4% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-red-200 dark:text-red-900"
                  strokeDasharray="0.88 219.91"
                  strokeDashoffset="-219.03"
                />
                {/* Gray segment - 0.4% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-zinc-200 dark:text-zinc-700"
                  strokeDasharray="0.88 219.91"
                  strokeDashoffset="-219.91"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-semibold text-green-600">99.3%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Attended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Didn't attend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-400"></div>
              <span className="text-sm">No response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Number of activities per type */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-sm font-medium text-zinc-500">Number of activities per type</h3>
          </div>
          <div className="mb-4">
            <div className="text-4xl font-semibold">522</div>
            <div className="text-sm text-zinc-500">total events</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge color="green">Game</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">68</span>
                <span className="text-sm text-zinc-500">13%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="orange">Practice</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">439</span>
                <span className="text-sm text-zinc-500">84.1%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="blue">Meeting</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">0</span>
                <span className="text-sm text-zinc-500">0%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="purple">Camp</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">0</span>
                <span className="text-sm text-zinc-500">0%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="red">Cup</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">15</span>
                <span className="text-sm text-zinc-500">2.9%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="zinc">Other</Badge>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">0</span>
                <span className="text-sm text-zinc-500">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Didn't attend reasons */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-zinc-500">Didn't attend reasons</h3>
          </div>
          <div className="mb-4">
            <div className="text-4xl font-semibold">36</div>
            <div className="text-sm text-zinc-500">non-attendees</div>
          </div>

          {/* Tabs for reasons */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex gap-4 text-sm">
              <button className="pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">All</button>
              <button className="pb-2 px-1 border-b-2 border-transparent text-zinc-500">Health</button>
              <button className="pb-2 px-1 border-b-2 border-transparent text-zinc-500">Obligations</button>
              <button className="pb-2 px-1 border-b-2 border-transparent text-zinc-500">Team related</button>
              <button className="pb-2 px-1 border-b-2 border-transparent text-zinc-500">Other</button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge color="zinc">Other</Badge>
              <span className="text-sm font-medium">34</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="blue">School</Badge>
              <span className="text-sm font-medium">1</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="cyan">Travel</Badge>
              <span className="text-sm font-medium">1</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge color="red">Illness</Badge>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupReportTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium">Date</span>
            <span className="text-sm text-blue-600">10/1/2025 – Today</span>
          </div>
          <Button outline>
            <FunnelIcon />
            Filters
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Events</span>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              <div className="flex items-center gap-1">
                Group
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Total
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Game
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Practice
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Meeting
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Camp
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Cup
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Other
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Total invited users
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                <span className="text-green-600">Attendance</span> Rate
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                <span className="text-orange-600">Unhandled</span> Rate
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockGroupData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar initials={row.name.substring(0, 2)} className="size-8" />
                  <span className="font-medium">{row.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.game}</TableCell>
              <TableCell>{row.practice}</TableCell>
              <TableCell>{row.meeting}</TableCell>
              <TableCell>{row.camp}</TableCell>
              <TableCell>{row.cup}</TableCell>
              <TableCell>{row.other}</TableCell>
              <TableCell>{row.invited}</TableCell>
              <TableCell>
                <Badge color={row.attendanceRate === "0%" ? "zinc" : "green"}>{row.attendanceRate}</Badge>
              </TableCell>
              <TableCell>
                <Badge color={row.unhandledRate === "0%" ? "zinc" : "orange"}>{row.unhandledRate}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">20</span> of <span className="font-medium">47 results</span>
        </div>
        <div className="flex items-center gap-2">
          <Button outline className="!px-3 !py-2">1</Button>
          <Button plain className="!px-3 !py-2">2</Button>
          <Button plain className="!px-3 !py-2">3</Button>
          <Button plain className="!px-3 !py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

function IndividualReportTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium">Date</span>
            <span className="text-sm text-blue-600">10/1/2025 – Today</span>
          </div>
          <Button outline>
            <FunnelIcon />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              <div className="flex items-center gap-1">
                Name
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Total events
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Attended
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Absent
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                School
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Travel
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Other
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
            <TableHeader>
              <div className="flex items-center gap-1">
                Unhandled
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockIndividualData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar initials={row.initials} className="size-10" />
                  <span className="font-medium">{row.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.totalEvents}</TableCell>
              <TableCell>
                <Badge color="green">{row.attended} ({row.attendedPercent})</Badge>
              </TableCell>
              <TableCell>
                <Badge color={row.absent === 0 ? "zinc" : "red"}>{row.absent} ({row.absentPercent})</Badge>
              </TableCell>
              <TableCell>{row.school}</TableCell>
              <TableCell>{row.travel}</TableCell>
              <TableCell>{row.other}</TableCell>
              <TableCell>
                <Badge color={row.unhandled === 0 ? "zinc" : "orange"}>{row.unhandled} ({row.unhandledPercent})</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Summary Row */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Total</span>
          <div className="flex items-center gap-8">
            <span>10559</span>
            <Badge color="green">9985 (99%)</Badge>
            <Badge color="red">34 (0%)</Badge>
            <span>1</span>
            <span>1</span>
            <span>34</span>
            <Badge color="orange">38 (0%)</Badge>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button outline className="!px-3 !py-2">1</Button>
        <Button plain className="!px-3 !py-2">2</Button>
        <Button plain className="!px-3 !py-2">3</Button>
        <Button plain className="!px-3 !py-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

function EventReportTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium">Date</span>
            <span className="text-sm text-blue-600">10/1/2025 – Today</span>
          </div>
          <Button outline>
            <FunnelIcon />
            Filter
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">You don't have any available reports</h3>
        <p className="text-sm text-zinc-500">You don't have any available reports</p>
      </div>

      {/* If there was data, it would show a table like this: */}
      {mockEventData.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Date
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>Time</TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Event title
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Location
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Type
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Invited
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Attended
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Absent
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
              <TableHeader>
                <div className="flex items-center gap-1">
                  Unhandled
                  <ChevronUpDownIcon className="w-4 h-4" />
                </div>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Event rows would go here */}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
