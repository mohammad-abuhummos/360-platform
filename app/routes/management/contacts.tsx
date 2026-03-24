import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { useAuth } from "~/context/auth-context";
import { ManagementContactsPanel } from "~/components/management/management-contacts-panel";

export default function Contacts() {
  const { activeClub } = useAuth();

  if (!activeClub) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2} className="text-lg font-semibold text-zinc-900 dark:text-white">
            Select a club
          </Heading>
          <p className="mt-2 text-sm text-zinc-500">
            Choose a club from the sidebar to view and manage contacts.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              aria-label="Back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ContactsIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              <Heading className="text-2xl">Contacts</Heading>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
            </button>
            <Button className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700" aria-label="Add">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Contacts are added only from your team roster. Each contact links to that person&apos;s profile.
        </p>

        <ManagementContactsPanel clubId={activeClub.id} />
      </div>
    </DashboardLayout>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM20 8v6M23 11h-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
