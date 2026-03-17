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
  PaperAirplaneIcon,
  CreditCardIcon,
  EnvelopeIcon,
  LinkIcon,
  EyeIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
  getInvoices,
  updateInvoice,
  deleteInvoice,
  type Invoice,
  type InvoiceStatus,
} from "../../lib/firestore-payments";
import { formatCurrency, formatDate, getInvoiceStatusColor, generatePaymentLink, redirectToCheckout } from "../../lib/stripe";
import { CreateInvoiceModal } from "../../components/payments/create-invoice-modal";
import { sendInvoiceEmail, previewInvoiceEmail, initEmailJS } from "../../lib/email-service";
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
  
  // Send invoice states
  const [isSendInvoiceOpen, setIsSendInvoiceOpen] = useState(false);
  const [selectedInvoiceForSend, setSelectedInvoiceForSend] = useState<Invoice | null>(null);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [copiedLink, setCopiedLink] = useState(false);
  
  const pageSize = 30;
  const organizationName = activeClub?.name || "Jordan Knights Football Club";

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

  const handleRefreshInvoices = async () => {
    if (!clubId) return;
    const { invoices: refreshedInvoices } = await getInvoices(clubId, {
      type: activeTab === "invoices" ? "invoice" : activeTab === "refunds" ? "refund" : "credit_note",
      pageSize: 100,
    });
    setInvoices(refreshedInvoices);
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

  // Open send invoice dialog
  const handleOpenSendInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForSend(invoice);
    const paymentLink = generatePaymentLink(
      invoice.id!,
      invoice.amountDue,
      invoice.currency,
      invoice.recipientEmail
    );
    const html = previewInvoiceEmail(invoice, paymentLink, organizationName);
    setEmailPreviewHtml(html);
    setIsSendInvoiceOpen(true);
    setSendStatus({ type: null, message: "" });
  };

  // Send invoice email
  const handleSendInvoiceEmail = async () => {
    if (!selectedInvoiceForSend) return;
    
    setIsSending(true);
    setSendStatus({ type: null, message: "" });

    try {
      initEmailJS();
      
      const paymentLink = generatePaymentLink(
        selectedInvoiceForSend.id!,
        selectedInvoiceForSend.amountDue,
        selectedInvoiceForSend.currency,
        selectedInvoiceForSend.recipientEmail
      );

      const result = await sendInvoiceEmail(
        selectedInvoiceForSend,
        paymentLink,
        organizationName
      );

      if (result.success) {
        // Update invoice sentAt
        await updateInvoice(selectedInvoiceForSend.id!, {
          sentAt: new Date(),
        });
        
        // Update local state
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === selectedInvoiceForSend.id
              ? { ...inv, sentAt: new Date() }
              : inv
          )
        );

        setSendStatus({ type: "success", message: "Invoice sent successfully!" });
      } else {
        setSendStatus({ type: "error", message: result.message });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      setSendStatus({ type: "error", message: "Failed to send invoice. Please try again." });
    } finally {
      setIsSending(false);
    }
  };

  // Copy payment link to clipboard
  const handleCopyPaymentLink = async (invoice: Invoice) => {
    const paymentLink = generatePaymentLink(
      invoice.id!,
      invoice.amountDue,
      invoice.currency,
      invoice.recipientEmail
    );
    
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Redirect to payment page
  const handlePayNow = (invoice: Invoice) => {
    redirectToCheckout(
      invoice.id!,
      invoice.amountDue,
      invoice.currency,
      invoice.invoiceNumber,
      invoice.recipientEmail,
      invoice.productName
    );
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
                        <Headless.MenuItems className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
                          {/* Payment Actions - for unpaid invoices */}
                          {invoice.status !== "paid" && invoice.status !== "void" && (
                            <>
                              <Headless.MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleOpenSendInvoice(invoice)}
                                    className={`${
                                      active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                    } flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                                  >
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Send invoice
                                  </button>
                                )}
                              </Headless.MenuItem>
                              <Headless.MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleCopyPaymentLink(invoice)}
                                    className={`${
                                      active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                    } flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    {copiedLink ? "Copied!" : "Copy payment link"}
                                  </button>
                                )}
                              </Headless.MenuItem>
                              <Headless.MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handlePayNow(invoice)}
                                    className={`${
                                      active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                    } flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400`}
                                  >
                                    <CreditCardIcon className="h-4 w-4" />
                                    Pay now
                                  </button>
                                )}
                              </Headless.MenuItem>
                              <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
                            </>
                          )}
                          
                          {invoice.status !== "paid" && (
                            <Headless.MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleUpdateStatus(invoice.id!, "paid")}
                                  className={`${
                                    active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                  } flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                                >
                                  <CheckIcon className="h-4 w-4" />
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

        <CreateInvoiceModal
          open={isNewInvoiceOpen}
          onClose={() => setIsNewInvoiceOpen(false)}
          clubId={clubId}
          onSuccess={handleRefreshInvoices}
        />

        {/* Send Invoice Dialog */}
        <Dialog 
          open={isSendInvoiceOpen} 
          onClose={() => !isSending && setIsSendInvoiceOpen(false)}
          size="xl"
        >
          <DialogTitle>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-blue-500" />
              Send Invoice
            </div>
          </DialogTitle>
          <DialogBody>
            {selectedInvoiceForSend && (
              <div className="space-y-4">
                {/* Invoice Summary */}
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">To:</span>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {selectedInvoiceForSend.recipientName}
                      </p>
                      <p className="text-blue-600">{selectedInvoiceForSend.recipientEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500">Amount:</span>
                      <p className="text-xl font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(selectedInvoiceForSend.amountDue, selectedInvoiceForSend.currency)}
                      </p>
                      <p className="text-zinc-500">Invoice #{selectedInvoiceForSend.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Link */}
                <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Payment Link
                      </span>
                    </div>
                    <Button
                      outline
                      className="flex items-center gap-1.5 text-xs"
                      onClick={() => handleCopyPaymentLink(selectedInvoiceForSend)}
                    >
                      {copiedLink ? (
                        <>
                          <CheckIcon className="h-4 w-4 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 truncate text-xs text-zinc-500">
                    {generatePaymentLink(
                      selectedInvoiceForSend.id!,
                      selectedInvoiceForSend.amountDue,
                      selectedInvoiceForSend.currency,
                      selectedInvoiceForSend.recipientEmail
                    )}
                  </p>
                </div>

                {/* Email Preview */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email Preview
                    </span>
                  </div>
                  <div className="h-80 overflow-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700">
                    <iframe
                      srcDoc={emailPreviewHtml}
                      className="h-full w-full"
                      title="Invoice Email Preview"
                    />
                  </div>
                </div>

                {/* Status Message */}
                {sendStatus.type && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      sendStatus.type === "success"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {sendStatus.message}
                  </div>
                )}

                {/* EmailJS Setup Note */}
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <strong>Note:</strong> To send emails, configure your EmailJS credentials in the environment variables:
                  <code className="ml-1 rounded bg-amber-100 px-1 dark:bg-amber-900/30">
                    VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
                  </code>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogActions>
            <Button
              outline
              onClick={() => setIsSendInvoiceOpen(false)}
              disabled={isSending}
            >
              {sendStatus.type === "success" ? "Close" : "Cancel"}
            </Button>
            {sendStatus.type !== "success" && (
              <Button
                color="blue"
                onClick={handleSendInvoiceEmail}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Send Invoice
                  </>
                )}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
