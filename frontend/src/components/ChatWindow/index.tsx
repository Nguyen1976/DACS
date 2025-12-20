'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  content: string
  timestamp: string
  isMine: boolean
  type?: 'text' | 'file' | 'system'
  fileData?: {
    name: string
    size: string
  }
}

interface User {
  id: string
  name: string
  avatar: string
  status: string
}

interface ChatWindowProps {
  user?: User
  messages?: Message[]
  onToggleProfile: () => void
  onVoiceCall: () => void
}

export function ChatWindow({
  user,
  messages,
  onToggleProfile,
  onVoiceCall,
}: ChatWindowProps) {
  if (!user) {
    return (
      <div className='flex-1 flex items-center justify-center bg-[#0f0f13] text-gray-500'>
        Select a chat to start messaging
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col bg-[#0f0f13]'>
      {/* Header */}
      <div className='h-16 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-6'>
        <button
          onClick={onToggleProfile}
          className='flex items-center gap-3 hover:opacity-80 transition-opacity'
        >
          <Avatar className='w-10 h-10'>
            <AvatarImage
              src={user.avatar || '/placeholder.svg'}
              alt={user.name}
            />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className='text-left'>
            <div className='font-medium text-white'>{user.name}</div>
            <div className='text-xs text-gray-400'>{user.status}</div>
          </div>
        </button>

        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onVoiceCall}
            className='hover:bg-[#27272a] text-gray-400 hover:text-white'
          >
            <Phone className='w-5 h-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-[#27272a] text-gray-400 hover:text-white'
          >
            <Video className='w-5 h-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggleProfile}
            className='hover:bg-[#27272a] text-gray-400 hover:text-white'
          >
            <MoreVertical className='w-5 h-5' />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'>
        {messages?.map((message) => (
          <div key={message.id}>
            {message.type === 'system' ? (
              <div className='flex justify-center'>
                <div className='bg-[#27272a] px-4 py-2 rounded-full text-xs text-gray-400'>
                  {message.content}
                </div>
              </div>
            ) : message.type === 'file' ? (
              <div
                className={cn(
                  'flex',
                  message.isMine ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-md p-4 rounded-2xl flex items-center gap-3',
                    message.isMine
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#27272a] text-white'
                  )}
                >
                  <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center'>
                    <FileText className='w-5 h-5' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-sm'>
                      {message.fileData?.name}
                    </div>
                    <div className='text-xs opacity-70'>
                      {message.fileData?.size}
                    </div>
                  </div>
                  <div className='text-xs opacity-70 ml-2'>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'flex',
                  message.isMine ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-md px-4 py-3 rounded-2xl',
                    message.isMine
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-[#27272a] text-white rounded-bl-md'
                  )}
                >
                  <p className='text-sm break-words'>{message.content}</p>
                  <span className='text-xs opacity-70 mt-1 block'>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='h-16 bg-[#18181b] border-t border-[#27272a] flex items-center gap-3 px-6'>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-[#27272a] text-gray-400 hover:text-white'
        >
          <Paperclip className='w-5 h-5' />
        </Button>

        <input
          type='text'
          placeholder='Write a message...'
          className='flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm'
        />

        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-[#27272a] text-gray-400 hover:text-white'
        >
          <Smile className='w-5 h-5' />
        </Button>

        <Button
          size='icon'
          className='bg-purple-600 hover:bg-purple-700 text-white rounded-full'
        >
          <Send className='w-5 h-5' />
        </Button>
      </div>
    </div>
  )
}
