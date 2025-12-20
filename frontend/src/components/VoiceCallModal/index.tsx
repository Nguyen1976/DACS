import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, Mic, Volume2 } from 'lucide-react'

interface User {
  id: string
  name: string
  avatar: string
}

interface VoiceCallModalProps {
  user: User
  onClose: () => void
}

export function VoiceCallModal({ user, onClose }: VoiceCallModalProps) {
  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-[#2d2d3d] rounded-2xl w-full max-w-sm mx-4 p-8 relative'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='absolute top-4 right-4 hover:bg-[#3d3d4d] text-gray-400 hover:text-white'
        >
          <X className='w-5 h-5' />
        </Button>

        <div className='flex flex-col items-center'>
          <Avatar className='w-32 h-32 mb-6'>
            <AvatarImage
              src={user.avatar || '/placeholder.svg'}
              alt={user.name}
            />
            <AvatarFallback className='text-3xl'>{user.name[0]}</AvatarFallback>
          </Avatar>

          <h3 className='text-2xl font-semibold text-white mb-2'>
            {user.name}
          </h3>
          <p className='text-gray-400 mb-8'>Voice calling...</p>

          <div className='flex gap-6'>
            <Button
              variant='ghost'
              size='icon'
              className='w-14 h-14 rounded-full bg-[#3d3d4d] hover:bg-[#4d4d5d] text-white'
            >
              <Mic className='w-6 h-6' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white'
            >
              <X className='w-6 h-6' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='w-14 h-14 rounded-full bg-[#3d3d4d] hover:bg-[#4d4d5d] text-white'
            >
              <Volume2 className='w-6 h-6' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
