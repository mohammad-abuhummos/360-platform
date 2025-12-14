import type { Route } from "./+types/chat"
import type { SVGProps } from "react"
import { DashboardLayout } from "../components/dashboard-layout"
import { Heading, Subheading } from "../components/heading"
import { Text } from "../components/text"
import { Button } from "../components/button"
import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Input, InputGroup } from "../components/input"
import { Textarea } from "../components/textarea"
import { Divider } from "../components/divider"

type IconProps = SVGProps<SVGSVGElement>

type Conversation = {
  id: number
  name: string
  initials: string
  preview: string
  timestamp: string
  seen: string
  tag: string
  unread?: number
  active?: boolean
}

type MessageAttachment = {
  id: number
  type: 'video' | 'link'
  src: string
  duration?: string
  poster?: string
  label?: string
}

type Message = {
  id: number
  sender: string
  initials: string
  role: string
  time: string
  content: string
  attachments?: MessageAttachment[]
}

type Participant = {
  id: number
  name: string
  initials: string
  role: string
  status: 'Online' | 'Offline'
}

type QuickFile = {
  id: number
  name: string
  size: string
  updatedAt: string
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'U15-3',
    initials: 'JK',
    preview: 'الأهالي الكرام، أسعد الله صباحكم بكل خير...',
    timestamp: 'Tue, Nov 25 · 2:22 PM',
    seen: 'Seen by 52',
    tag: 'Teams',
  },
  {
    id: 2,
    name: 'U13-3',
    initials: 'JJ',
    preview: 'تم مشاركة صور التدريب الأخير، يرجى الاطلاع على اللقطات.',
    timestamp: 'Tue, Nov 25 · 2:22 PM',
    seen: 'Seen by 34',
    tag: 'Teams',
  },
  {
    id: 3,
    name: 'U10-2',
    initials: 'U2',
    preview: 'يرجى تأكيد الحضور لمباراة نهاية الأسبوع.',
    timestamp: 'Tue, Nov 25 · 2:21 PM',
    seen: 'Seen by 18',
    tag: 'Scheduling',
  },
  {
    id: 4,
    name: 'U10-1',
    initials: 'U1',
    preview: 'بشار: https://ts-upload...',
    timestamp: 'Fri, Nov 14 · 9:55 AM',
    seen: 'Seen by 21',
    tag: 'Media',
    unread: 4,
  },
  {
    id: 5,
    name: 'U13-1',
    initials: 'U1',
    preview: 'تحميل صور مباريات كأس الأردن متاحة الآن.',
    timestamp: 'Sat, Nov 8 · 1:29 PM',
    seen: 'Seen by 40',
    tag: 'Media',
  },
  {
    id: 6,
    name: 'Coaches',
    initials: 'CH',
    preview: 'Bashar: https://ts-uploads/...',
    timestamp: 'Sat, Nov 8 · 1:29 PM',
    seen: '+3 more',
    tag: 'Staff',
    active: true,
  },
]

const messages: Message[] = [
  {
    id: 1,
    sender: 'Bashar',
    initials: 'BA',
    role: 'Administrator',
    time: 'Tue, Nov 25 · 2:21 PM',
    content: 'الأهالي الكرام، أسعد الله صباحكم بكل خير. نود مشاركتكم لقطات مباريات كأس الأردن لهذا الأسبوع.',
    attachments: [
      { id: 1, type: 'video', src: '/login.mp4', duration: '0:07', poster: '/logo.jpeg', label: 'Game 1' },
      { id: 2, type: 'video', src: '/login.mp4', duration: '0:13', poster: '/logo.jpeg', label: 'Game 2' },
      { id: 3, type: 'video', src: '/login.mp4', duration: '0:15', poster: '/logo.jpeg', label: 'Game 3' },
      { id: 4, type: 'video', src: '/login.mp4', duration: '0:08', poster: '/logo.jpeg', label: 'Game 4' },
    ],
  },
  {
    id: 2,
    sender: 'Abed',
    initials: 'AA',
    role: 'Coach',
    time: 'Tue, Nov 25 · 2:23 PM',
    content: 'شكراً بشار. سنشارك اللقطات مع الأهالي اليوم لتأكيد الحضور والحماس للمباريات القادمة.',
  },
  {
    id: 3,
    sender: 'Sarah',
    initials: 'SA',
    role: 'Assistant',
    time: 'Tue, Nov 25 · 2:24 PM',
    content: 'تمت جدولة المنشور على صفحة النادي، وإذا احتجتم دعم إضافي مع المنتسبين أعلِموني.',
  },
]

const participants: Participant[] = [
  { id: 1, name: 'Bashar Abdulalleh', initials: 'BA', role: 'Administrator', status: 'Online' },
  { id: 2, name: 'Abed Alkhatib', initials: 'AA', role: 'Coach', status: 'Online' },
  { id: 3, name: 'Sarah Alami', initials: 'SA', role: 'Assistant', status: 'Offline' },
  { id: 4, name: 'Fadi Arabiat', initials: 'FA', role: 'Coach', status: 'Offline' },
]

const quickFiles: QuickFile[] = [
  { id: 1, name: 'JordanCup-highlights.mp4', size: '128 MB', updatedAt: 'Updated 2h ago' },
  { id: 2, name: 'Weekend-schedule.pdf', size: '1.8 MB', updatedAt: 'Updated yesterday' },
  { id: 3, name: 'Training-plan.xlsx', size: '620 KB', updatedAt: 'Updated Mon' },
]

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Chat · Jordan Knights Dashboard' },
    { name: 'description', content: 'Real-time club conversations for teams and staff.' },
  ]
}

export default function ChatRoute() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_280px]">
          <ConversationsPanel />
          <ChatPanel />
          <DetailsPanel />
        </div>
      </div>
    </DashboardLayout>
  )
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="space-y-1">
        <Heading level={1} className="text-3xl font-semibold">
          Chat
        </Heading>
        <Text className="text-sm text-zinc-500">Jordan Knights Football Club · Coaches channel</Text>
      </div>
      <div className="ml-auto flex flex-wrap gap-3">
        <Button outline>
          <PlusIcon data-slot="icon" />
          New group
        </Button>
        <Button color="blue">
          <MessageIcon data-slot="icon" />
          New chat
        </Button>
      </div>
    </div>
  )
}

function ConversationsPanel() {
  return (
    <section className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="space-y-4 border-b border-zinc-100 p-6">
        <InputGroup>
          <SearchIcon data-slot="icon" />
          <Input type="search" placeholder="Search conversations" aria-label="Search conversations" />
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          <Button plain className="text-sm text-zinc-600">
            Filters
          </Button>
          <Button plain className="text-sm text-zinc-600">
            Unread
          </Button>
          <Badge color="zinc" className="text-xs">
            Pinned
          </Badge>
        </div>
      </div>

      <ul className="divide-y divide-zinc-100">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={`flex cursor-pointer gap-4 px-6 py-5 transition hover:bg-zinc-50 ${conversation.active ? 'bg-blue-50/60' : 'bg-white'}`}
          >
            <Avatar initials={conversation.initials} alt={conversation.name} className="size-12 bg-blue-600/10 text-blue-600" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Subheading level={3} className="text-base font-semibold">
                  {conversation.name}
                </Subheading>
                <Badge color="zinc">{conversation.tag}</Badge>
                {conversation.unread && <Badge color="blue">{conversation.unread}</Badge>}
                <span className="ml-auto text-xs text-zinc-500">{conversation.timestamp}</span>
              </div>
              <Text className="text-sm text-zinc-600 line-clamp-2">{conversation.preview}</Text>
              <Text className="text-xs text-zinc-400">{conversation.seen}</Text>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChatPanel() {
  return (
    <section className="flex min-h-[640px] flex-col rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 border-b border-zinc-100 p-6">
        <div className="space-y-1">
          <Heading level={2} className="text-2xl font-semibold">
            Coaches
          </Heading>
          <Text className="text-sm text-zinc-500">Active · 8 members · Last reply 2m ago</Text>
          <div className="flex items-center gap-2">
            {participants.slice(0, 3).map((person) => (
              <Avatar key={person.id} initials={person.initials} alt={person.name} className="size-8 bg-zinc-900/5" />
            ))}
            <Badge color="zinc">+{participants.length - 3}</Badge>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button plain className="text-sm text-blue-600">
            Details
          </Button>
          <Button outline>
            <VideoIcon data-slot="icon" />
            Start call
          </Button>
          <Button color="blue">
            <BroadcastIcon data-slot="icon" />
            Broadcast
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-hidden p-6">
        <div className="max-h-[520px] space-y-6 overflow-y-auto pr-2">
          {messages.map((message) => (
            <article key={message.id} className="flex gap-4">
              <Avatar initials={message.initials} alt={message.sender} className="size-11 bg-blue-600/10 text-blue-600" />
              <div className="min-w-0 flex-1 space-y-2 rounded-2xl bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">{message.sender}</p>
                  <Badge color="zinc">{message.role}</Badge>
                  <span className="text-xs text-zinc-500">{message.time}</span>
                </div>
                <Text className="text-sm text-zinc-700">{message.content}</Text>
                {message.attachments && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {message.attachments.map((attachment) => (
                      <AttachmentPreview key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                  <button className="hover:text-zinc-900">Reply</button>
                  <button className="hover:text-zinc-900">Pin</button>
                  <button className="hover:text-zinc-900">Share</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <MessageComposer />
    </section>
  )
}

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  if (attachment.type === 'video') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-100 bg-black/5">
        <video controls src={attachment.src} poster={attachment.poster} className="h-48 w-full rounded-2xl object-cover" />
        {attachment.duration && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            {attachment.duration}
          </span>
        )}
        {attachment.label && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-900">
            {attachment.label}
          </span>
        )}
      </div>
    )
  }

  return null
}

function MessageComposer() {
  return (
    <div className="border-t border-zinc-100 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Textarea placeholder="Say something to the team..." rows={3} resizable={false} className="flex-1" />
        <div className="flex gap-2">
          <Button outline>
            <PaperclipIcon data-slot="icon" />
            Attach
          </Button>
          <Button color="blue">
            <SendIcon data-slot="icon" />
            Send
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <VideoIcon className="size-4" />
          Share match footage
        </div>
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4" />
          Upload gallery
        </div>
        <div className="flex items-center gap-2">
          <DotsIcon className="size-4" />
          More actions
        </div>
      </div>
    </div>
  )
}

function DetailsPanel() {
  return (
    <section className="hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm xl:block">
      <div className="flex items-center justify-between">
        <Subheading level={3}>Details</Subheading>
        <Button plain className="text-sm text-blue-600">
          Manage
        </Button>
      </div>
      <Text className="mt-2 text-sm text-zinc-500">Coaches chat · Jordan Knights FC</Text>

      <Divider className="my-6" />

      <div className="space-y-4">
        <p className="text-xs uppercase text-zinc-500">Participants</p>
        <ul className="space-y-3">
          {participants.map((person) => (
            <li key={person.id} className="flex items-center gap-3">
              <Avatar initials={person.initials} alt={person.name} className="size-9 bg-zinc-900/5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">{person.name}</p>
                <Text className="text-xs text-zinc-500">{person.role}</Text>
              </div>
              <Badge color={person.status === 'Online' ? 'green' : 'zinc'}>{person.status}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="my-6" />

      <div className="space-y-3">
        <p className="text-xs uppercase text-zinc-500">Quick files</p>
        <ul className="space-y-3">
          {quickFiles.map((file) => (
            <li key={file.id} className="rounded-2xl border border-zinc-100 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <PaperclipIcon className="size-4 text-zinc-500" />
                {file.name}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                <span>{file.size}</span>
                <span>{file.updatedAt}</span>
              </div>
            </li>
          ))}
        </ul>
        <Button plain className="text-sm text-blue-600">
          View all files
        </Button>
      </div>
    </section>
  )
}

function iconClasses(className?: string) {
  return ['size-5', className].filter(Boolean).join(' ')
}

function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function MessageIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path
        d="M5 7c0-1.657 1.79-3 4-3h6c2.21 0 4 1.343 4 3v5c0 1.657-1.79 3-4 3h-2l-3 4v-4H9c-2.21 0-4-1.343-4-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M15.5 15.5 20 20" strokeLinecap="round" />
      <circle cx="11" cy="11" r="6" />
    </svg>
  )
}

function VideoIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m15 12-4 3V9z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BroadcastIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M5.5 5.5a9 9 0 0 0 0 12.73M18.5 5.5a9 9 0 0 1 0 12.73" strokeLinecap="round" />
    </svg>
  )
}

function PaperclipIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="M16.5 6.5 8.75 14.25a2.5 2.5 0 1 0 3.54 3.54l6.01-6.01a4 4 0 0 0-5.66-5.66L6.7 11.05" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SendIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} className={iconClasses(className)}>
      <path d="m4 4 16 8-16 8 4.5-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ImageIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props} className={iconClasses(className)}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m7 17 3.5-3.5L14 17l3-3 2 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
