import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  UsersIcon,
  UserPlusIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  UsersIcon as GenderIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Sample data - replace with real data from your API
const contactsData = [
  { name: "Players", value: 253, percentage: 66.06, color: "#10b981" },
  { name: "Staff", value: 21, percentage: 5.48, color: "#f59e0b" },
  { name: "Admins", value: 10, percentage: 2.61, color: "#3b82f6" },
  { name: "Parents", value: 89, percentage: 23.24, color: "#a855f7" },
  { name: "Club lobby", value: 27, percentage: 7.05, color: "#ec4899" },
];

const newPlayersData = [
  { period: "Jan", players: 45 },
  { period: "Feb", players: 52 },
  { period: "Mar", players: 48 },
  { period: "Apr", players: 61 },
  { period: "May", players: 70 },
  { period: "Jun", players: 85 },
  { period: "Jul", players: 92 },
  { period: "Aug", players: 155 },
  { period: "Sep", players: 88 },
  { period: "Oct", players: 75 },
];

const newPlayersStats = [
  { label: "1 day", value: 1, color: "text-blue-600" },
  { label: "7 days", value: 1, color: "text-blue-600" },
  { label: "30 days", value: 4, color: "text-blue-600" },
];

// Player age distribution data
const ageDistributionData = [
  { year: "1988", count: 2, color: "#ef4444" },
  { year: "1998", count: 3, color: "#f97316" },
  { year: "2009", count: 14, color: "#10b981" },
  { year: "2011", count: 17, color: "#f59e0b" },
  { year: "2013", count: 60, color: "#ef4444" },
  { year: "2015", count: 52, color: "#a855f7" },
  { year: "2017", count: 35, color: "#3b82f6" },
  { year: "2019", count: 28, color: "#10b981" },
  { year: "2021", count: 22, color: "#f59e0b" },
  { year: "2022", count: 10, color: "#ec4899" },
];

// Player gender distribution data
const genderDistributionData = [
  { name: "Male", value: 76.3, color: "#10b981", label: "Male" },
  { name: "Female", value: 22.5, color: "#ec4899", label: "Female" },
  { name: "Unspecified", value: 1.2, color: "#3b82f6", label: "Unspecified" },
];

export default function Overview() {
  const totalContacts = contactsData.reduce((sum, item) => sum + item.value, 0);
  const totalNewPlayers = 822;
  const playersWithoutParents = 164;
  const contactsWithoutGroups = 109;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Heading>Overview</Heading>

        {/* Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Total Contacts Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <UsersIcon className="h-5 w-5" />
              <span>Total amount of contacts</span>
            </div>
            <div className="mb-6 text-4xl font-bold text-zinc-900 dark:text-white">
              {totalContacts}
            </div>

            {/* Contact Types List and Chart */}
            <div className="flex items-center gap-8">
              <div className="flex-1 space-y-3">
                {contactsData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Donut Chart */}
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contactsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {contactsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* New Players This Year Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <UserPlusIcon className="h-5 w-5" />
              <span>New players this year</span>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                {totalNewPlayers}
              </div>
              <span className="text-sm text-zinc-500">Total amount</span>
            </div>

            {/* Time Period Stats */}
            <div className="mb-6 flex gap-6">
              {newPlayersStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-8">
                  <span className={`text-sm ${stat.color}`}>{stat.label}</span>
                  <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Line Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newPlayersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="players"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Players Without Connected Parents Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <UserGroupIcon className="h-5 w-5" />
              <span>Players without connected parents</span>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                {playersWithoutParents}
              </div>
              <span className="text-sm text-zinc-500">Total amount</span>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Under 18 years</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  158
                </span>
              </div>
            </div>
          </div>

          {/* Contacts Without Groups Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <ExclamationCircleIcon className="h-5 w-5" />
              <span>Contacts without groups</span>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                {contactsWithoutGroups}
              </div>
              <span className="text-sm text-zinc-500">Total amount</span>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Inactivated</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  28
                </span>
              </div>
            </div>
          </div>

          {/* Player Age Distribution Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <ChartBarIcon className="h-5 w-5" />
              <span>Player age distribution</span>
            </div>

            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {ageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Player Gender Distribution Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <GenderIcon className="h-5 w-5" />
              <span>Player gender distribution</span>
            </div>

            {/* Donut Chart with Labels */}
            <div className="flex items-center justify-center">
              <div className="relative h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    {genderDistributionData.map((item) => (
                      <div key={item.name} className="mb-1">
                        <span
                          className="text-lg font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6">
              {genderDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Archived Contacts Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <ArchiveBoxIcon className="h-5 w-5" />
              <span>Archived contacts</span>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                439
              </div>
              <span className="text-sm text-zinc-500">Total amount</span>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">With unpaid invoices</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  0
                </span>
              </div>
            </div>
          </div>

          {/* Players with Incomplete Required Information Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Players with incomplete required information</span>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                26
              </div>
              <span className="text-sm text-zinc-500">Total amount</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Active</span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    22
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Archived</span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    4
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
