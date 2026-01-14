import { useState, useEffect, Fragment } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Badge } from "../../components/badge";
import { Input } from "../../components/input";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../../components/dialog";
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
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type Invoice,
  type InvoiceStatus,
} from "../../lib/firestore-payments";
import { formatCurrency, formatDate, getInvoiceStatusColor, generateInvoiceNumber } from "../../lib/stripe";
import * as Headless from "@headlessui/react";
import { Timestamp } from "firebase/firestore";

type TabType = "invoices" | "refunds" | "credit_notes";

const TABS: { id: TabType; label: string }[] = [
  { id: "invoices", label: "Invoices" },
  { id: "refunds", label: "Refunds" },
  { id: "credit_notes", label: "Credit notes" },
];

export default function InvoicesPage() {
  const { activeClub } = useAuth();
  const clubId = activeClub?.id || "";

  const [activeTab, setActiveTab] = useState<TabType>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  
  const pageSize = 30;

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    recipientName: "",
    recipientEmail: "",
    amountDue: 0,
    terms: "30 days",
    notes: "",
  });

  useEffect(() => {
    if (!clubId) return;
    
    async function fetchInvoices() {
      setLoading(true);
      try {
        const typeFilter = activeTab === "invoices" ? "invoice" : 
                          activeTab === "refunds" ? "refund" : "credit_note";
        
        const { invoices: fetchedInvoices } = await getInvoices(clubId, {
          type: typeFilter,
          pageSize: 100,
        });
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchInvoices();
  }, [clubId, activeTab]);

  // Filter invoices based on search
  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inv.recipientName.toLowerCase().includes(query) ||
      inv.recipientEmail.toLowerCase().includes(query) ||
      inv.invoiceNumber.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(paginatedInvoices.map((inv) => inv.id!)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleCreateInvoice = async () => {
    if (!clubId || !newInvoice.recipientName || !newInvoice.recipientEmail) return;

    try {
      const dueDate = new Date();
      const daysMatch = newInvoice.terms.match(/(\d+)/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 30;
      dueDate.setDate(dueDate.getDate() + days);

      await createInvoice({
        recipientName: newInvoice.recipientName,
        recipientEmail: newInvoice.recipientEmail,
        amountDue: newInvoice.amountDue,
        currency: "JOD",
        invoiceNumber: generateInvoiceNumber("UATLHQZ"),
        status: "open",
        terms: newInvoice.terms,
        dueDate,
        type: "invoice",
        clubId,
        notes: newInvoice.notes,
      });

      // Refresh the list
      const { invoices: refreshedInvoices } = await getInvoices(clubId, {
        type: "invoice",
        pageSize: 100,
      });
      setInvoices(refreshedInvoices);

      setIsNewInvoiceOpen(false);
      setNewInvoice({
        recipientName: "",
        recipientEmail: "",
        amountDue: 0,
        terms: "30 days",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      const updates: Partial<Invoice> = { status };
      if (status === "paid") {
        updates.paidAt = new Date();
      }
      await updateInvoice(invoiceId, updates);

      // Update local state
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
      );
      setIsDropdownOpen(null);
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      setIsDropdownOpen(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
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
        <Heading>Invoices</Heading>

        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
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
              onClick={() => setIsNewInvoiceOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              New invoice
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
                    checked={selectedInvoices.size === paginatedInvoices.length && paginatedInvoices.length > 0}
                    onChange={(checked) => handleSelectAll(checked)}
                  />
                </TableHeader>
                <TableHeader>Recipient</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Amount due</TableHeader>
                <TableHeader>Invoice number</TableHeader>
                <TableHeader>Assigned contacts</TableHeader>
                <TableHeader>Product</TableHeader>
                <TableHeader>Terms</TableHeader>
                <TableHeader>Created at</TableHeader>
                <TableHeader>Sent at</TableHeader>
                <TableHeader>Due date</TableHeader>
                <TableHeader>Paid at</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader className="w-10"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-12 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-12 text-zinc-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedInvoices.has(invoice.id!)}
                        onChange={(checked) => handleSelectInvoice(invoice.id!, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {invoice.recipientName}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {invoice.recipientEmail}
                    </TableCell>
                    <TableCell>
                      <Badge color={getInvoiceStatusColor(invoice.status) as any}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.amountDue, invoice.currency)}</TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.assignedContacts?.join(", ") || "-"}</TableCell>
                    <TableCell>{invoice.productName || "-"}</TableCell>
                    <TableCell>{invoice.terms}</TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatDate(getDateValue(invoice.createdAt as any))}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatDate(getDateValue(invoice.sentAt as any))}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatDate(getDateValue(invoice.dueDate as any))}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatDate(getDateValue(invoice.paidAt as any))}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{invoice.type}</span>
                    </TableCell>
                    <TableCell>
                      <Headless.Menu as="div" className="relative">
                        <Headless.MenuButton
                          className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => setIsDropdownOpen(isDropdownOpen === invoice.id ? null : invoice.id!)}
                        >
                          <EllipsisHorizontalIcon className="h-5 w-5 text-zinc-400" />
                        </Headless.MenuButton>
                        <Headless.MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
                          {invoice.status !== "paid" && (
                            <Headless.MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleUpdateStatus(invoice.id!, "paid")}
                                  className={`${
                                    active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                  } block w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                                >
                                  Mark as paid
                                </button>
                              )}
                            </Headless.MenuItem>
                          )}
                          {invoice.status !== "void" && (
                            <Headless.MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleUpdateStatus(invoice.id!, "void")}
                                  className={`${
                                    active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                  } block w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                                >
                                  Void invoice
                                </button>
                              )}
                            </Headless.MenuItem>
                          )}
                          <Headless.MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id!)}
                                className={`${
                                  active ? "bg-red-50 dark:bg-red-900/20" : ""
                                } block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400`}
                              >
                                Delete
                              </button>
                            )}
                          </Headless.MenuItem>
                        </Headless.MenuItems>
                      </Headless.Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredInvoices.length)}
            <br />
            <span className="text-zinc-400">of {filteredInvoices.length} results</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              outline
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  outline={currentPage !== pageNum}
                  color={currentPage === pageNum ? "blue" : undefined}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              outline
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* New Invoice Dialog */}
        <Dialog open={isNewInvoiceOpen} onClose={() => setIsNewInvoiceOpen(false)}>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Recipient Name
                </label>
                <Input
                  type="text"
                  value={newInvoice.recipientName}
                  onChange={(e) => setNewInvoice({ ...newInvoice, recipientName: e.target.value })}
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={newInvoice.recipientEmail}
                  onChange={(e) => setNewInvoice({ ...newInvoice, recipientEmail: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Amount Due (JOD)
                </label>
                <Input
                  type="number"
                  value={newInvoice.amountDue}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amountDue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Payment Terms
                </label>
                <select
                  value={newInvoice.terms}
                  onChange={(e) => setNewInvoice({ ...newInvoice, terms: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes (optional)
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button outline onClick={() => setIsNewInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
