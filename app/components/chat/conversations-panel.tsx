import { Avatar } from '../avatar'
import { Badge } from '../badge'
import { Input, InputGroup } from '../input'
import { Subheading } from '../heading'
import { Text } from '../text'
import { SearchIcon } from './icons'
import type { Conversation } from './types'

type ConversationsPanelProps = {
  conversations: Conversation[]
  activeConversationId: number
  onSelectConversation: (id: number) => void
}

export function ConversationsPanel({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationsPanelProps) {
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
        {conversations.map(conversation => {
          const isActive = conversation.id === activeConversationId
          return (
            <li
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group relative flex cursor-pointer gap-3 p-4 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 shadow-sm dark:from-blue-950/40 dark:to-indigo-950/30'
                  : 'bg-white/50 hover:bg-zinc-50 hover:shadow-sm dark:bg-zinc-900/30 dark:hover:bg-zinc-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
              )}

              <div className="relative">
                <Avatar
                  initials={conversation.initials}
                  alt={conversation.name}
                  className={`size-12 ring-2 ${
                    isActive
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
                  <Subheading
                    level={3}
                    className={`text-sm font-bold ${
                      isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {conversation.name}
                  </Subheading>
                  <span className="text-xs font-medium text-zinc-500 whitespace-nowrap dark:text-zinc-500">
                    {conversation.timestamp.split('·')[1]?.trim() || conversation.timestamp}
                  </span>
                </div>

                <Text
                  className={`text-sm line-clamp-2 ${
                    conversation.unread
                      ? 'font-medium text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {conversation.preview}
                </Text>

                <div className="flex items-center justify-between">
                  <Text className="text-xs text-zinc-400 dark:text-zinc-600">{conversation.seen}</Text>
                  <Badge color={isActive ? 'blue' : 'zinc'} className="text-xs">
                    {conversation.tag}
                  </Badge>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

