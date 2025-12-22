import type { MessageAttachment } from './types'

type AttachmentPreviewProps = {
  attachment: MessageAttachment
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  if (attachment.type !== 'video') {
    return null
  }

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

