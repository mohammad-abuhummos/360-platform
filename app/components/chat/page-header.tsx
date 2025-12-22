import { Button } from '../button'
import { Heading } from '../heading'
import { Text } from '../text'
import { MessageIcon, PlusIcon } from './icons'

type ChatPageHeaderProps = {
  activeMembersCount?: number
}

export function ChatPageHeader({ activeMembersCount = 8 }: ChatPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <Heading level={1} className="text-3xl font-bold tracking-tight dark:text-white">
          Messages
        </Heading>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-white">
              {activeMembersCount} {activeMembersCount === 1 ? 'member' : 'members'}
            </span>{' '}
            active now
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          outline
          className="text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
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

