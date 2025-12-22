import type { Route } from "./+types/chat"
import { useCallback, useMemo, useState } from "react"
import { DashboardLayout } from "../components/dashboard-layout"
import {
  ChatPageHeader,
  ChatPanel,
  ConversationsPanel,
  DetailsPanel,
  chatParticipants,
  chatQuickFiles,
  defaultActiveConversationId,
  initialConversations,
  initialMessagesByConversation,
} from "../components/chat"
import type { Conversation, Message } from "../components/chat"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Chat · Jordan Knights Dashboard' },
    { name: 'description', content: 'Real-time club conversations for teams and staff.' },
  ]
}

export default function ChatRoute() {
  const [activeConversationId, setActiveConversationId] = useState(defaultActiveConversationId)
  const [conversationsState, setConversationsState] = useState<Conversation[]>(initialConversations)
  const [messagesState, setMessagesState] = useState<Record<number, Message[]>>(
    initialMessagesByConversation
  )

  const activeConversation = useMemo(
    () => conversationsState.find(conversation => conversation.id === activeConversationId),
    [conversationsState, activeConversationId]
  )

  const currentMessages = useMemo<Message[]>(
    () => messagesState[activeConversationId] ?? [],
    [messagesState, activeConversationId]
  )

  const handleSelectConversation = useCallback((conversationId: number) => {
    setActiveConversationId(conversationId)
  }, [])

  const handleSendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim()
      if (!trimmedContent) return

      const messageTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })

      setMessagesState(prevMessages => {
        const existingMessages = prevMessages[activeConversationId] ?? []
        const newMessage: Message = {
          id: existingMessages.length + 1,
          sender: 'SMT Dev',
          initials: 'SD',
          role: 'Administrator',
          time: messageTime,
          content: trimmedContent,
        }

        return {
          ...prevMessages,
          [activeConversationId]: [...existingMessages, newMessage],
        }
      })

      setConversationsState(prevConversations =>
        prevConversations.map(conversation =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                preview:
                  trimmedContent.length > 50
                    ? `${trimmedContent.substring(0, 50)}...`
                    : trimmedContent,
                timestamp: `Today · ${messageTime}`,
              }
            : conversation
        )
      )
    },
    [activeConversationId]
  )

  const activeMembersCount = useMemo(
    () => chatParticipants.filter(participant => participant.status === 'Online').length,
    []
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 dark">
        <ChatPageHeader activeMembersCount={activeMembersCount} />
        <div className="grid gap-5 lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_300px]">
          <ConversationsPanel
            conversations={conversationsState}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
          <ChatPanel
            conversation={activeConversation}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
          />
          <DetailsPanel
            conversation={activeConversation}
            participants={chatParticipants}
            quickFiles={chatQuickFiles}
            groupLabel="Jordan Knights FC"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

