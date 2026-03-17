import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Badge } from "../../components/badge";
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
import { Checkbox } from "../../components/checkbox";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  getSubscriptions,
  cancelSubscription,
  type Subscription,
  type SubscriptionStatus,
} from "../../lib/firestore-payments";
import { CreateSubscriptionModal } from "../../components/payments/create-subscription-modal";
import { formatDate, getSubscriptionStatusColor } from "../../lib/stripe";
import * as Headless from "@headlessui/react";
import { Timestamp } from "firebase/firestore";

export default function SubscriptionsPage() {
  const { activeClub } = useAuth();
  const clubId = activeClub?.id || "";

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [isNewSubOpen, setIsNewSubOpen] = useState(false);

  useEffect(() => {
    if (!clubId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const subsResult = await getSubscriptions(clubId, { pageSize: 100 });
        setSubscriptions(subsResult.subscriptions);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [clubId]);

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.recipientName.toLowerCase().includes(query) ||
      sub.recipientEmail.toLowerCase().includes(query) ||
      sub.productName.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubs(new Set(filteredSubs.map((sub) => sub.id!)));
    } else {
      setSelectedSubs(new Set());
    }
  };

  const handleSelectSub = (subId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubs);
    if (checked) {
      newSelected.add(subId);
    } else {
      newSelected.delete(subId);
    }
    setSelectedSubs(newSelected);
  };

  const handleRefreshSubscriptions = async () => {
    if (!clubId) return;
    const { subscriptions: refreshed } = await getSubscriptions(clubId, { pageSize: 100 });
    setSubscriptions(refreshed);
  };

  const handleCancelSubscription = async (subId: string) => {
    try {
      await cancelSubscription(subId, "User requested cancellation");
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subId ? { ...sub, status: "canceled" as SubscriptionStatus } : sub
        )
      );
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  const getDateValue = (date: Date | Timestamp | undefined): Date | undefined => {
    if (!date) return undefined;
    if (date instanceof Timestamp) return date.toDate();
    return date;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Heading>Subscriptions</Heading>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
            <Button outline className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button outline className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              color="blue"
              className="flex items-center gap-2"
              onClick={() => setIsNewSubOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              New subscription
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-10">
                  <Checkbox
                    checked={selectedSubs.size === filteredSubs.length && filteredSubs.length > 0}
                    onChange={(checked) => handleSelectAll(checked)}
                  />
                </TableHeader>
                <TableHeader>Recipient</TableHeader>
                <TableHeader>Billing email</TableHeader>
                <TableHeader>Assigned user(s)</TableHeader>
                <TableHeader>Product</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Paid installments</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Plan</TableHeader>
                <TableHeader>Collection method</TableHeader>
                <TableHeader>Start at</TableHeader>
                <TableHeader>Current period end</TableHeader>
                <TableHeader className="text-blue-500">Created</TableHeader>
                <TableHeader>Next invoice</TableHeader>
                <TableHeader className="w-10"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={15} className="py-12 text-center text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
                          <CurrencyDollarIcon className="h-12 w-12 text-zinc-400" />
                        </div>
                        <div className="absolute -right-2 -top-2 rounded-full bg-emerald-500 p-1.5">
                          <ArrowPathIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-zinc-900 dark:text-white">
                          Could not find any subscriptions
                        </p>
                        <p className="text-sm text-zinc-500">
                          Could not find any subscriptions
                        </p>
                      </div>
                      <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => setIsNewSubOpen(true)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        New subscription
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubs.has(sub.id!)}
                        onChange={(checked) => handleSelectSub(sub.id!, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {sub.recipientName}
                    </TableCell>
                    <TableCell className="text-blue-600">{sub.recipientEmail}</TableCell>
                    <TableCell>{sub.assignedUsers?.join(", ") || "-"}</TableCell>
                    <TableCell>{sub.productName}</TableCell>
                    <TableCell className="capitalize">{sub.type}</TableCell>
                    <TableCell>
                      {sub.paidInstallments}/{sub.totalInstallments || "∞"}
                    </TableCell>
                    <TableCell>
                      <Badge color={getSubscriptionStatusColor(sub.status) as any}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell className="capitalize">
                      {sub.collectionMethod.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(getDateValue(sub.startAt as any))}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(getDateValue(sub.currentPeriodEnd as any))}
                    </TableCell>
                    <TableCell className="text-sm text-blue-500">
                      {formatDate(getDateValue(sub.createdAt as any))}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(getDateValue(sub.nextInvoiceDate as any))}
                    </TableCell>
                    <TableCell>
                      <Headless.Menu as="div" className="relative">
                        <Headless.MenuButton className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <EllipsisHorizontalIcon className="h-5 w-5 text-zinc-400" />
                        </Headless.MenuButton>
                        <Headless.MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
                          {sub.status !== "canceled" && (
                            <Headless.MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleCancelSubscription(sub.id!)}
                                  className={`${
                                    active ? "bg-red-50 dark:bg-red-900/20" : ""
                                  } block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400`}
                                >
                                  Cancel subscription
                                </button>
                              )}
                            </Headless.MenuItem>
                          )}
                        </Headless.MenuItems>
                      </Headless.Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="text-sm text-zinc-500">{filteredSubs.length} results</div>

        <CreateSubscriptionModal
          open={isNewSubOpen}
          onClose={() => setIsNewSubOpen(false)}
          clubId={clubId}
          onSuccess={handleRefreshSubscriptions}
        />
      </div>
    </DashboardLayout>
  );
}
