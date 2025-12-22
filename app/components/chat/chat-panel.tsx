import { useEffect, useRef } from 'react'
import { Avatar } from '../avatar'
import { Badge } from '../badge'
import { Button } from '../button'
import { Heading } from '../heading'
import { Text } from '../text'
import { AttachmentPreview } from './attachment-preview'
import { BroadcastIcon, VideoIcon } from './icons'
import { MessageComposer } from './message-composer'
import type { Conversation, Message } from './types'

type ChatPanelProps = {
  conversation?: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function ChatPanel({ conversation, messages, onSendMessage }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
              <Badge color="zinc" className="text-xs">
                {conversation.tag}
              </Badge>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-zinc-500 dark:text-zinc-500">{conversation.seen}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            outline
            className="text-sm shadow-sm hover:shadow dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <VideoIcon data-slot="icon" />
            Call
          </Button>
          <Button color="blue" className="text-sm shadow-lg shadow-blue-500/30">
            <BroadcastIcon data-slot="icon" />
            Broadcast
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-50/30 to-white p-6 dark:from-black/30 dark:to-zinc-900">
        <div className="max-h-[800px] space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent dark:scrollbar-thumb-zinc-700">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text className="text-zinc-500 dark:text-zinc-400">No messages yet. Start the conversation!</Text>
            </div>
          ) : (
            messages.map((message, idx) => (
              <article
                key={message.id}
                className="group flex gap-3 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
              >
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
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      {message.time.split('·')[1]?.trim() || message.time}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all group-hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50">
                    <Text className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{message.content}</Text>

                    {message.attachments && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {message.attachments.map(attachment => (
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

