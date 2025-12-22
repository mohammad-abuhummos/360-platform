import { Avatar } from '../avatar'
import { Badge } from '../badge'
import { Button } from '../button'
import { Divider } from '../divider'
import { Subheading } from '../heading'
import { Text } from '../text'
import { DotsIcon, PaperclipIcon, VideoIcon } from './icons'
import type { Conversation, Participant, QuickFile } from './types'

type DetailsPanelProps = {
  participants: Participant[]
  quickFiles: QuickFile[]
  conversation?: Conversation
  groupLabel?: string
}

export function DetailsPanel({
  participants,
  quickFiles,
  conversation,
  groupLabel = 'Jordan Knights FC',
}: DetailsPanelProps) {
  return (
    <section className="hidden space-y-5 overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/30 p-5 shadow-xl shadow-zinc-900/5 xl:block dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Subheading level={3} className="font-bold text-zinc-900 dark:text-white">
            {conversation?.name ?? 'Chat Details'}
          </Subheading>
          <button className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
            <DotsIcon className="size-4" />
          </button>
        </div>
        <Text className="text-xs text-zinc-600 dark:text-zinc-400">
          {conversation?.tag ? `${conversation.tag} · ${groupLabel}` : groupLabel}
        </Text>
      </div>

      <div className="flex justify-center py-3">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg className="size-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg border-2 border-white bg-green-500 text-xs font-bold text-white shadow dark:border-zinc-900">
            {participants.length}
          </span>
        </div>
      </div>

      <Divider className="border-dashed dark:border-zinc-800" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Members
          </p>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            + Add
          </button>
        </div>
        <ul className="space-y-2">
          {participants.map(person => (
            <li
              key={person.id}
              className="group flex items-center gap-2.5 rounded-xl border border-transparent p-2 transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm dark:hover:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <div className="relative">
                <Avatar
                  initials={person.initials}
                  alt={person.name}
                  className="size-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
                />
                {person.status === 'Online' && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 truncate dark:text-white">{person.name}</p>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">{person.role}</Text>
              </div>
              <Badge color={person.status === 'Online' ? 'green' : 'zinc'} className="text-xs">
                {person.status}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="border-dashed dark:border-zinc-800" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Shared Files
          </p>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View all
          </button>
        </div>
        <ul className="space-y-2">
          {quickFiles.map(file => (
            <li
              key={file.id}
              className="group cursor-pointer rounded-xl border border-zinc-200/60 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-blue-900"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                  {file.name.endsWith('.pdf') ? (
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18h10v-2H7v2zM7 14h10v-2H7v2zm10-8H7v2h10V6z" />
                    </svg>
                  ) : file.name.endsWith('.mp4') ? (
                    <VideoIcon className="size-4" />
                  ) : (
                    <PaperclipIcon className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {file.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">{file.size}</span>
                    <span>•</span>
                    <span>{file.updatedAt.replace('Updated ', '')}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="border-dashed dark:border-zinc-800" />

      <div className="space-y-2">
        <Button className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </Button>
        <Button className="flex w-full items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Privacy settings
        </Button>
        <Button className="flex w-full items-center gap-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave chat
        </Button>
      </div>
    </section>
  )
}

