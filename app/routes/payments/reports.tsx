import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { useAuth } from "../../context/auth-context";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../../components/table";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  getRevenueReport,
  getProducts,
  type PaymentReport,
  type Product,
} from "../../lib/firestore-payments";
import { formatCurrency } from "../../lib/stripe";

type TabType = "revenue" | "payouts";

const TABS: { id: TabType; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "payouts", label: "Payouts" },
];

// Generate month columns
function generateMonthColumns(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (current <= endDate) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthKey);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  const { activeClub } = useAuth();
  const clubId = activeClub?.id || "";

  const [activeTab, setActiveTab] = useState<TabType>("revenue");
  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [volumeFilter, setVolumeFilter] = useState<string>("paid");

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1); // Start of year
    return { from, to: now };
  });

  // Generate month columns for the table
  const monthColumns = generateMonthColumns(dateRange.from, dateRange.to);

  useEffect(() => {
    if (!clubId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [reportsResult, productsResult] = await Promise.all([
          getRevenueReport(clubId, dateRange),
          getProducts(clubId, { archived: false }),
        ]);
        setReports(reportsResult);
        setProducts(productsResult);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [clubId, dateRange]);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    return report.productName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate totals
  const totalsByMonth: Record<string, number> = {};
  let grandTotal = 0;

  filteredReports.forEach((report) => {
    grandTotal += report.total;
    monthColumns.forEach((month) => {
      if (!totalsByMonth[month]) totalsByMonth[month] = 0;
      totalsByMonth[month] += report.monthly[month] || 0;
    });
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Heading>Revenue</Heading>

        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button outline className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Date</span>
              <span className="text-blue-600">
                {dateRange.from.toLocaleDateString()} – Today
              </span>
            </Button>
            
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="all">Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>

            <select
              value={volumeFilter}
              onChange={(e) => setVolumeFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="paid">Paid volume</option>
              <option value="gross">Gross volume</option>
              <option value="net">Net volume</option>
            </select>

            <Button outline className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Revenue Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="sticky left-0 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1">
                    Product
                    <ChevronUpDownIcon className="h-4 w-4 text-zinc-400" />
                  </div>
                </TableHeader>
                <TableHeader>
                  <div className="flex items-center gap-1">
                    Total
                    <ChevronUpDownIcon className="h-4 w-4 text-zinc-400" />
                  </div>
                </TableHeader>
                {monthColumns.map((month) => (
                  <TableHeader key={month}>
                    <div className="flex items-center gap-1">
                      {formatMonthLabel(month)}
                      <ChevronUpDownIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={monthColumns.length + 2} className="py-12 text-center text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <>
                  {/* Show placeholder rows for products if no revenue data */}
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="sticky left-0 bg-white font-medium text-blue-600 dark:bg-zinc-900">
                          {product.title}
                        </TableCell>
                        <TableCell className="text-zinc-500">-</TableCell>
                        {monthColumns.map((month) => (
                          <TableCell key={month} className="text-zinc-500">-</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={monthColumns.length + 2} className="py-12 text-center text-zinc-500">
                        No revenue data found
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.productId}>
                    <TableCell className="sticky left-0 bg-white font-medium text-blue-600 dark:bg-zinc-900">
                      {report.productName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(report.total)}
                    </TableCell>
                    {monthColumns.map((month) => (
                      <TableCell key={month} className="text-zinc-600 dark:text-zinc-400">
                        {report.monthly[month] ? formatCurrency(report.monthly[month]) : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
              
              {/* Total Row */}
              {(filteredReports.length > 0 || products.length > 0) && (
                <TableRow className="bg-zinc-50 font-medium dark:bg-zinc-800/50">
                  <TableCell className="sticky left-0 bg-zinc-50 dark:bg-zinc-800/50">
                    Total
                  </TableCell>
                  <TableCell>{formatCurrency(grandTotal)}</TableCell>
                  {monthColumns.map((month) => (
                    <TableCell key={month}>
                      {totalsByMonth[month] ? formatCurrency(totalsByMonth[month]) : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Payouts Tab Content */}
        {activeTab === "payouts" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500">
              Payout reports will be available after connecting your Stripe account.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
