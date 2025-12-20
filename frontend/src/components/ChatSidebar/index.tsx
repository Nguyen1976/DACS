import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '../ModeToggle'

interface User {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isOnline?: boolean
}

interface ChatSidebarProps {
  users: User[]
  selectedUserId: string
  onSelectUser: (userId: string) => void
  onNewChat: () => void
}

export function ChatSidebar({
  users,
  selectedUserId,
  onSelectUser,
  onNewChat
}: ChatSidebarProps) {
  return (
    <div className='w-[340px] bg-[#18181b] border-r border-[#27272a] flex flex-col custom-scrollbar'>
      <div className='flex items-center justify-between p-4 border-b border-[#27272a]'>
        <h1 className='text-xl font-semibold text-white'>Chats</h1>
        <div className='flex gap-2'>
          {/* <Button
            variant='ghost'
            size='icon'
            onClick={onToggleTheme}
            className='hover:bg-[#27272a] text-gray-400 hover:text-white'
          >
            {isDark ? (
              <Moon className='w-5 h-5' />
            ) : (
              <Sun className='w-5 h-5' />
            )}
          </Button> */}
          <ModeToggle />
          <Button
            variant='ghost'
            size='icon'
            onClick={onNewChat}
            className='hover:bg-[#27272a] text-gray-400 hover:text-white'
          >
            <Plus className='w-5 h-5' />
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className={cn(
              'w-full p-4 flex items-start gap-3 hover:bg-[#27272a]/50 transition-colors border-b border-[#27272a]/30',
              selectedUserId === user.id && 'bg-[#27272a]'
            )}
          >
            <div className='relative'>
              <Avatar className='w-12 h-12'>
                <AvatarImage
                  src={user.avatar || '/placeholder.svg'}
                  alt={user.name}
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#18181b]' />
              )}
            </div>

            <div className='flex-1 min-w-0 text-left'>
              <div className='flex items-center justify-between mb-1'>
                <span className='font-medium text-white truncate'>
                  {user.name}
                </span>
                <span className='text-xs text-gray-400 ml-2'>
                  {user.timestamp}
                </span>
              </div>
              <p className='text-sm text-gray-400 truncate'>
                {user.lastMessage}
              </p>
            </div>

            {user.unreadCount && user.unreadCount > 0 && (
              <div className='flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center'>
                <span className='text-xs text-white font-medium'>
                  {user.unreadCount}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
