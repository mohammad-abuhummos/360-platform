import type { Route } from "./+types/chat"
import type { SVGProps } from "react"
import { useState, useEffect, useRef } from "react"
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

const messagesByConversation: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: 'Coach Ahmad',
      initials: 'CA',
      role: 'Head Coach',
      time: 'Tue, Nov 25 · 2:20 PM',
      content: 'الأهالي الكرام، أسعد الله صباحكم بكل خير...',
    },
    {
      id: 2,
      sender: 'Parent Ali',
      initials: 'PA',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:21 PM',
      content: 'شكراً على التحديث، متى التدريب القادم؟',
    },
    {
      id: 3,
      sender: 'Coach Ahmad',
      initials: 'CA',
      role: 'Head Coach',
      time: 'Tue, Nov 25 · 2:22 PM',
      content: 'التدريب القادم يوم السبت الساعة 4 مساءً.',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'Coach Hassan',
      initials: 'CH',
      role: 'Assistant Coach',
      time: 'Tue, Nov 25 · 2:15 PM',
      content: 'تم مشاركة صور التدريب الأخير، يرجى الاطلاع على اللقطات.',
    },
    {
      id: 2,
      sender: 'Parent Sara',
      initials: 'PS',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:18 PM',
      content: 'رائع! أين يمكننا تحميل الصور؟',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'Admin',
      initials: 'AD',
      role: 'Administrator',
      time: 'Tue, Nov 25 · 2:10 PM',
      content: 'يرجى تأكيد الحضور لمباراة نهاية الأسبوع.',
    },
    {
      id: 2,
      sender: 'Parent Khalid',
      initials: 'PK',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:12 PM',
      content: 'تم تأكيد الحضور، شكراً.',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'Bashar',
      initials: 'BA',
      role: 'Administrator',
      time: 'Fri, Nov 14 · 9:50 AM',
      content: 'مرحباً بالجميع، هل يمكنكم تحديث معلومات الاتصال؟',
    },
    {
      id: 2,
      sender: 'Parent Omar',
      initials: 'PO',
      role: 'Parent',
      time: 'Fri, Nov 14 · 9:52 AM',
      content: 'سأقوم بذلك الآن.',
    },
    {
      id: 3,
      sender: 'Bashar',
      initials: 'BA',
      role: 'Administrator',
      time: 'Fri, Nov 14 · 9:55 AM',
      content: 'شكراً لكم جميعاً!',
    },
  ],
  5: [
    {
      id: 1,
      sender: 'Media Team',
      initials: 'MT',
      role: 'Staff',
      time: 'Sat, Nov 8 · 1:25 PM',
      content: 'تحميل صور مباريات كأس الأردن متاحة الآن.',
    },
    {
      id: 2,
      sender: 'Parent Layla',
      initials: 'PL',
      role: 'Parent',
      time: 'Sat, Nov 8 · 1:27 PM',
      content: 'ممتاز! شكراً على المشاركة.',
    },
  ],
  6: [
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
  ],
}

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
  const [activeConversationId, setActiveConversationId] = useState(6)
  const [conversationsState, setConversationsState] = useState(conversations)
  const [messagesState, setMessagesState] = useState(messagesByConversation)

  const activeConversation = conversationsState.find(c => c.id === activeConversationId)
  const currentMessages = messagesState[activeConversationId] || []

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId)
    // Update active state in conversations
    setConversationsState(prev => prev.map(c => ({
      ...c,
      active: c.id === conversationId
    })))
  }

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const newMessage: Message = {
      id: currentMessages.length + 1,
      sender: 'SMT Dev',
      initials: 'SD',
      role: 'Administrator',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      content: content.trim(),
    }

    setMessagesState(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }))

    // Update conversation preview
    setConversationsState(prev => prev.map(c =>
      c.id === activeConversationId
        ? { ...c, preview: content.trim().substring(0, 50) + (content.length > 50 ? '...' : ''), timestamp: `Today · ${newMessage.time}` }
        : c
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 dark">
        <PageHeader />
        <div className="grid gap-5 lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_300px]">
          <ConversationsPanel
            conversations={conversationsState}
            onSelectConversation={handleSelectConversation}
          />
          <ChatPanel
            conversation={activeConversation}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
          />
          <DetailsPanel />
        </div>
      </div>
    </DashboardLayout>
  )
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <Heading level={1} className="text-3xl font-bold tracking-tight dark:text-white">
          Messages
        </Heading>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-white">8 members</span> active now
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button outline className="text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <PlusIcon data-slot="icon" />
          New group
        </Button>
        <Button color="blue" className="text-sm shadow-lg shadow-blue-500/30">
          <MessageIcon data-slot="icon" />
          New message
        </Button>
      </div>
    </div>
  )
}

function ConversationsPanel({
  conversations,
  onSelectConversation
}: {
  conversations: Conversation[]
  onSelectConversation: (id: number) => void
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/30 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
      <div className="space-y-3 border-b border-zinc-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <InputGroup className="shadow-sm">
          <SearchIcon data-slot="icon" />
          <Input
            type="search"
            placeholder="Search messages..."
            aria-label="Search conversations"
            className="bg-zinc-50/50 border-zinc-200/60 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
          />
        </InputGroup>
        <div className="flex gap-2">
          <button className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30">
            All
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            Unread
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            Pinned
          </button>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-zinc-100/80 overflow-y-auto dark:divide-zinc-800">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`group relative flex cursor-pointer gap-3 p-4 transition-all duration-200 ${conversation.active
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 shadow-sm dark:from-blue-950/40 dark:to-indigo-950/30'
              : 'bg-white/50 hover:bg-zinc-50 hover:shadow-sm dark:bg-zinc-900/30 dark:hover:bg-zinc-800/50'
              }`}
          >
            {conversation.active && (
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
            )}

            <div className="relative">
              <Avatar
                initials={conversation.initials}
                alt={conversation.name}
                className={`size-12 ring-2 ${conversation.active
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-blue-200 dark:ring-blue-900'
                  : 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-700 ring-zinc-200/50 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
                  }`}
              />
              {conversation.unread && (
                <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg">
                  {conversation.unread}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Subheading level={3} className={`text-sm font-bold ${conversation.active ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {conversation.name}
                </Subheading>
                <span className="text-xs font-medium text-zinc-500 whitespace-nowrap dark:text-zinc-500">
                  {conversation.timestamp.split('·')[1]?.trim() || conversation.timestamp}
                </span>
              </div>

              <Text className={`text-sm line-clamp-2 ${conversation.unread ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {conversation.preview}
              </Text>

              <div className="flex items-center justify-between">
                <Text className="text-xs text-zinc-400 dark:text-zinc-600">{conversation.seen}</Text>
                <Badge
                  color={conversation.active ? 'blue' : 'zinc'}
                  className="text-xs"
                >
                  {conversation.tag}
                </Badge>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChatPanel({
  conversation,
  messages,
  onSendMessage
}: {
  conversation?: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!conversation) {
    return (
      <section className="flex min-h-[640px] flex-col items-center justify-center rounded-2xl border border-zinc-200/60 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="text-zinc-500 dark:text-zinc-400">Select a conversation to start chatting</Text>
      </section>
    )
  }

  return (
    <section className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 border-b border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 p-5 backdrop-blur-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              initials={conversation.initials}
              alt={conversation.name}
              className="size-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-zinc-900">
              <span className="size-2 rounded-full bg-white" />
            </span>
          </div>

          <div className="space-y-0.5">
            <Heading level={2} className="text-lg font-bold text-zinc-900 dark:text-white">
              {conversation.name}
            </Heading>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-green-600 dark:text-green-500">Active</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <Badge color="zinc" className="text-xs">{conversation.tag}</Badge>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-zinc-500 dark:text-zinc-500">{conversation.seen}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button outline className="text-sm shadow-sm hover:shadow dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <VideoIcon data-slot="icon" />
            Call
          </Button>
          <Button color="blue" className="text-sm shadow-lg shadow-blue-500/30">
            <BroadcastIcon data-slot="icon" />
            Broadcast
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-50/30 to-white p-6 dark:from-black/30 dark:to-zinc-900">
        <div className="max-h-[800px] space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent dark:scrollbar-thumb-zinc-700">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text className="text-zinc-500 dark:text-zinc-400">No messages yet. Start the conversation!</Text>
            </div>
          ) : (
            messages.map((message, idx) => (
              <article key={message.id} className="group flex gap-3 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}>
                <Avatar
                  initials={message.initials}
                  alt={message.sender}
                  className="size-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{message.sender}</p>
                    <Badge color="blue" className="text-xs font-semibold">
                      {message.role}
                    </Badge>
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{message.time.split('·')[1]?.trim() || message.time}</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all group-hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50">
                    <Text className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{message.content}</Text>

                    {message.attachments && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {message.attachments.map((attachment) => (
                          <AttachmentPreview key={attachment.id} attachment={attachment} />
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-700">
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reply
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500">
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-green-600 dark:text-zinc-400 dark:hover:text-green-500">
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageComposer onSendMessage={onSendMessage} />
    </section>
  )
}

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  if (attachment.type === 'video') {
    return (
      <div className="group/video relative overflow-hidden rounded-xl border border-zinc-200/60 bg-gradient-to-br from-zinc-100 to-zinc-50 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900">
        <video
          controls
          src={attachment.src}
          poster={attachment.poster}
          className="h-40 w-full rounded-xl object-cover transition-transform group-hover/video:scale-[1.02]"
        />
        {attachment.duration && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-gradient-to-r from-black/80 to-black/70 px-2.5 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            <svg className="mr-1 inline size-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {attachment.duration}
          </span>
        )}
        {attachment.label && (
          <span className="absolute left-2 top-2 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-zinc-900 shadow-md backdrop-blur-sm dark:bg-zinc-800/95 dark:text-white">
            {attachment.label}
          </span>
        )}
      </div>
    )
  }

  return null
}

function MessageComposer({ onSendMessage }: { onSendMessage: (content: string) => void }) {
  const [messageContent, setMessageContent] = useState('')

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent)
      setMessageContent('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
      <div className="relative">
        <Textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here... (Press Enter to send)"
          rows={3}
          resizable={false}
          className="w-full resize-none rounded-xl border-zinc-200/60 bg-white pr-28 shadow-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            className="group rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            title="Attach files"
          >
            <PaperclipIcon className="size-4 transition-transform group-hover:rotate-45" />
          </button>
          <Button
            color="blue"
            className="shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            onClick={handleSend}
          >
            <SendIcon data-slot="icon" className="size-4" />
            Send
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-blue-950 dark:hover:text-blue-400">
          <VideoIcon className="size-3.5 transition-transform group-hover:scale-110" />
          Video
        </button>
        <button className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-purple-100 hover:text-purple-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-purple-950 dark:hover:text-purple-400">
          <ImageIcon className="size-3.5 transition-transform group-hover:scale-110" />
          Images
        </button>
        <button className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-green-100 hover:text-green-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-green-950 dark:hover:text-green-400">
          <svg className="size-3.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Emoji
        </button>
        <button className="group flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-amber-100 hover:text-amber-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-amber-950 dark:hover:text-amber-400">
          <DotsIcon className="size-3.5 transition-transform group-hover:scale-110" />
          More
        </button>
      </div>
    </div>
  )
}

function DetailsPanel() {
  return (
    <section className="hidden space-y-5 overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/30 p-5 shadow-xl shadow-zinc-900/5 xl:block dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Subheading level={3} className="font-bold text-zinc-900 dark:text-white">Chat Details</Subheading>
          <button className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
            <DotsIcon className="size-4" />
          </button>
        </div>
        <Text className="text-xs text-zinc-600 dark:text-zinc-400">Coaches · Jordan Knights FC</Text>
      </div>

      {/* Group Avatar */}
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

      {/* Participants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Members</p>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            + Add
          </button>
        </div>
        <ul className="space-y-2">
          {participants.map((person) => (
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
              <Badge
                color={person.status === 'Online' ? 'green' : 'zinc'}
                className="text-xs"
              >
                {person.status}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="border-dashed dark:border-zinc-800" />

      {/* Quick Files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Shared Files</p>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View all
          </button>
        </div>
        <ul className="space-y-2">
          {quickFiles.map((file) => (
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

      {/* Actions */}
      <div className="space-y-2">
        <button className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Privacy settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave chat
        </button>
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
