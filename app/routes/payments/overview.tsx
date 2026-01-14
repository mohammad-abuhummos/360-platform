import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../../components/dialog";
import { useAuth } from "../../context/auth-context";
import { seedPaymentData } from "../../lib/seed-payments";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import {
  getInvoiceStats,
  getSubscriptionStats,
  getPaymentTimeline,
  getPaymentInsights,
  type PaymentInsight,
} from "../../lib/firestore-payments";
import { formatCurrency } from "../../lib/stripe";

interface InvoiceStats {
  paid: number;
  open: number;
  pastDue: number;
  uncollectible: number;
  totalRevenue: number;
  totalCount: number;
}

interface SubscriptionStats {
  active: number;
  canceled: number;
  pastDue: number;
  total: number;
  newThisMonth: number;
}

const STATUS_COLORS = {
  paid: "#10b981",
  open: "#3b82f6",
  pastDue: "#f97316",
  uncollectible: "#ef4444",
};

export default function PaymentsOverview() {
  const { activeClub } = useAuth();
  const clubId = activeClub?.id || "";

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1); // Start of year
    return { from, to: now };
  });

  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
    paid: 0,
    open: 0,
    pastDue: 0,
    uncollectible: 0,
    totalRevenue: 0,
    totalCount: 0,
  });

  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    active: 0,
    canceled: 0,
    pastDue: 0,
    total: 0,
    newThisMonth: 0,
  });

  const [timelineData, setTimelineData] = useState<{ date: string; amount: number }[]>([]);
  const [insights, setInsights] = useState<PaymentInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeedDialogOpen, setIsSeedDialogOpen] = useState(false);
  const [seedProgress, setSeedProgress] = useState<string[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = useCallback(async () => {
    if (!clubId) return;

    setIsSeeding(true);
    setSeedProgress([]);

    try {
      await seedPaymentData(clubId, (message) => {
        setSeedProgress((prev) => [...prev, message]);
      });

      // Refresh data after seeding
      const [invStats, subStats, timeline, paymentInsights] = await Promise.all([
        getInvoiceStats(clubId, dateRange),
        getSubscriptionStats(clubId),
        getPaymentTimeline(clubId, dateRange),
        getPaymentInsights(clubId),
      ]);

      setInvoiceStats(invStats);
      setSubscriptionStats(subStats);
      setTimelineData(timeline);
      setInsights(paymentInsights);
    } catch (error) {
      console.error("Error seeding data:", error);
      setSeedProgress((prev) => [...prev, `❌ Error: ${error}`]);
    } finally {
      setIsSeeding(false);
    }
  }, [clubId, dateRange]);

  useEffect(() => {
    if (!clubId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [invStats, subStats, timeline, paymentInsights] = await Promise.all([
          getInvoiceStats(clubId, dateRange),
          getSubscriptionStats(clubId),
          getPaymentTimeline(clubId, dateRange),
          getPaymentInsights(clubId),
        ]);

        setInvoiceStats(invStats);
        setSubscriptionStats(subStats);
        setTimelineData(timeline);
        setInsights(paymentInsights);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [clubId, dateRange]);

  const pieChartData = [
    { name: "Paid", value: invoiceStats.paid, color: STATUS_COLORS.paid },
    { name: "Open", value: invoiceStats.open, color: STATUS_COLORS.open },
    { name: "Past due", value: invoiceStats.pastDue, color: STATUS_COLORS.pastDue },
    { name: "Uncollectible", value: invoiceStats.uncollectible, color: STATUS_COLORS.uncollectible },
  ].filter(item => item.value > 0);

  const totalInvoices = invoiceStats.paid + invoiceStats.open + invoiceStats.pastDue + invoiceStats.uncollectible;

  // Format timeline data for chart
  const formattedTimeline = timelineData.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const refundRatio = invoiceStats.totalCount > 0
    ? ((invoiceStats.uncollectible / invoiceStats.totalCount) * 100).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Heading>Overview</Heading>
          <div className="flex items-center gap-2">
            <Button outline className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Date</span>
              <span className="text-blue-600">
                {dateRange.from.toLocaleDateString()} – Today
              </span>
            </Button>
          </div>
        </div>

        {/* Today's Insights */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Today's insights
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Requires Action Card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Requires action</span>
              </div>
              <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                {insights?.requiresAction ?? 0} invoices
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-500">Past due</span>
                  <span className="text-zinc-900 dark:text-white">{invoiceStats.pastDue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-500">Uncollectible</span>
                  <span className="text-zinc-900 dark:text-white">{invoiceStats.uncollectible}</span>
                </div>
              </div>
            </div>

            {/* Est. Payments Coming 30 Days Card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Est. payments coming 30 days</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Invoices</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(insights?.estimatedPayments30Days.invoices ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Subscriptions</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(insights?.estimatedPayments30Days.subscriptions ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Est. Recurring Revenue Card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Est. recurring revenue</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-500">Monthly</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(insights?.recurringRevenue.monthly ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Quarterly</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(insights?.recurringRevenue.quarterly ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Annually</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(insights?.recurringRevenue.annually ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Report */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
              Payments report
              <span className="cursor-help rounded-full border border-zinc-300 p-0.5 text-xs text-zinc-400">?</span>
            </h2>
            <Button outline className="flex items-center gap-2 text-sm">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Date</span>
              <span className="text-blue-600">
                {dateRange.from.toLocaleDateString()} – Today
              </span>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Invoice Status Bar Chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Invoice status</span>
              </div>

              {/* Status bars */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge color="green">Paid</Badge>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: totalInvoices > 0 ? `${(invoiceStats.paid / totalInvoices) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="min-w-[3rem] text-right font-medium text-zinc-900 dark:text-white">
                    {invoiceStats.paid}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="blue">Open</Badge>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: totalInvoices > 0 ? `${(invoiceStats.open / totalInvoices) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="min-w-[3rem] text-right font-medium text-zinc-900 dark:text-white">
                    {invoiceStats.open}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="orange">Past due</Badge>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-orange-500 transition-all duration-500"
                      style={{ width: totalInvoices > 0 ? `${(invoiceStats.pastDue / totalInvoices) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="min-w-[3rem] text-right font-medium text-zinc-900 dark:text-white">
                    {invoiceStats.pastDue}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="red">Uncollectible</Badge>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-red-500 transition-all duration-500"
                      style={{ width: totalInvoices > 0 ? `${(invoiceStats.uncollectible / totalInvoices) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="min-w-[3rem] text-right font-medium text-zinc-900 dark:text-white">
                    {invoiceStats.uncollectible}
                  </span>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Invoice status</span>
              </div>

              <div className="flex h-64 items-center justify-center">
                <div className="relative h-full w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData.length > 0 ? pieChartData : [{ name: 'No data', value: 1, color: '#e5e7eb' }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(pieChartData.length > 0 ? pieChartData : [{ color: '#e5e7eb' }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {totalInvoices > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-500">
                        {((invoiceStats.paid / totalInvoices) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {[
                  { label: "Paid", color: "bg-emerald-500" },
                  { label: "Open", color: "bg-blue-500" },
                  { label: "Past due", color: "bg-orange-500" },
                  { label: "Uncollectible", color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded ${item.color}`} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Payments Count */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">Payments</div>
                <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
                  {invoiceStats.paid}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Since {dateRange.from.toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                <CreditCardIcon className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Refund Ratio */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">Refund ratio</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {refundRatio}%
                  </span>
                  <span className="text-sm text-zinc-400">
                    {invoiceStats.uncollectible} of {invoiceStats.totalCount}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Since {dateRange.from.toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-500/10">
                <ArrowUturnLeftIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* New Subscriptions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500">New subscriptions</div>
                <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
                  {subscriptionStats.newThisMonth}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Since {dateRange.from.toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 dark:bg-purple-500/10">
                <UserGroupIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Net Revenue */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Net revenue (incl. fees)</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge color="green">Paid</Badge>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatCurrency(invoiceStats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Subscriptions Summary */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <ArrowPathIcon className="h-4 w-4" />
              <span>Subscriptions</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
              {subscriptionStats.active}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              Active subscriptions
            </div>
          </div>
        </div>

        {/* Seed Data Dialog */}
        <Dialog open={isSeedDialogOpen} onClose={() => !isSeeding && setIsSeedDialogOpen(false)}>
          <DialogTitle>Seed Sample Payment Data</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              {seedProgress.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                  This will create sample payment data including:
                </p>
              ) : null}

              {seedProgress.length === 0 ? (
                <ul className="list-inside list-disc space-y-1 text-sm text-zinc-500">
                  <li>4 product categories</li>
                  <li>6 products with prices</li>
                  <li>~150 invoices with various statuses</li>
                  <li>5 active subscriptions</li>
                </ul>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <pre className="text-xs text-zinc-600 dark:text-zinc-400">
                    {seedProgress.join('\n')}
                  </pre>
                </div>
              )}

              {seedProgress.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Note: This will add data to your Firebase database.
                </p>
              )}
            </div>
          </DialogBody>
          <DialogActions>
            <Button
              outline
              onClick={() => setIsSeedDialogOpen(false)}
              disabled={isSeeding}
            >
              {seedProgress.length > 0 && !isSeeding ? 'Close' : 'Cancel'}
            </Button>
            {seedProgress.length === 0 && (
              <Button
                color="blue"
                onClick={handleSeedData}
                disabled={isSeeding}
              >
                {isSeeding ? 'Seeding...' : 'Start Seeding'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
