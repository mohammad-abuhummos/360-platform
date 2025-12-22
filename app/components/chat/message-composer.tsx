import { useCallback, useState, type KeyboardEvent } from 'react'
import { Button } from '../button'
import { Textarea } from '../textarea'
import { DotsIcon, ImageIcon, PaperclipIcon, SendIcon, VideoIcon } from './icons'

type MessageComposerProps = {
  onSendMessage: (content: string) => void
}

export function MessageComposer({ onSendMessage }: MessageComposerProps) {
  const [messageContent, setMessageContent] = useState('')

  const pushMessage = useCallback(() => {
    const trimmed = messageContent.trim()
    if (!trimmed) return

    onSendMessage(trimmed)
    setMessageContent('')
  }, [messageContent, onSendMessage])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      pushMessage()
    }
  }

  return (
    <div className="border-t border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
      <div className="relative">
        <Textarea
          value={messageContent}
          onChange={event => setMessageContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Press Enter to send)"
          rows={3}
          resizable={false}
          className="w-full resize-none rounded-xl border-zinc-200/60 bg-white pr-28 shadow-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            className="group rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            title="Attach files"
            type="button"
          >
            <PaperclipIcon className="size-4 transition-transform group-hover:rotate-45" />
          </button>
          <Button
            color="blue"
            className="shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            onClick={pushMessage}
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

