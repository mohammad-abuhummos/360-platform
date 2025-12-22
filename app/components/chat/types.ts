export type Conversation = {
  id: number
  name: string
  initials: string
  preview: string
  timestamp: string
  seen: string
  tag: string
  unread?: number
}

export type MessageAttachment = {
  id: number
  type: 'video' | 'link'
  src: string
  duration?: string
  poster?: string
  label?: string
}

export type Message = {
  id: number
  sender: string
  initials: string
  role: string
  time: string
  content: string
  attachments?: MessageAttachment[]
}

export type Participant = {
  id: number
  name: string
  initials: string
  role: string
  status: 'Online' | 'Offline'
}

export type QuickFile = {
  id: number
  name: string
  size: string
  updatedAt: string
}

