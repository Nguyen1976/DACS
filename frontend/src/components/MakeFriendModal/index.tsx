import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { makeFriendRequest } from '@/apis'
import { toast } from 'sonner'

interface MakeFriendModalProps {
  onClose: () => void
}

export function MakeFriendModal({ onClose }: MakeFriendModalProps) {
  const { register, handleSubmit } = useForm<{ email: string }>()


  const onSubmit = (data: { email: string }) => {
    makeFriendRequest(data.email).then(() => {
      toast.success('Friend request sent successfully')
      onClose()
    })
  }

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <form
        className='bg-bg-voice-call rounded-2xl w-full max-w-md mx-4 overflow-hidden'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='flex items-center justify-between p-6 border-button'>
          <h2 className='text-xl font-semibold text-text'>Add friend</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='hover:bg-button text-gray-400 hover:text-text'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <div className='p-6 pb-0'>
          <Input
            className='border-none mb-4 focus:ring-bg-box-message-out! bg-button! text-text outline-none'
            type='text'
            placeholder='Email'
            {...register('email', { required: 'Email is required' })}
          />
        </div>

        <div className='w-full flex justify-end'>
          <Button type='submit' className='m-4 interceptor-loading'>
            Send Request
          </Button>
        </div>
      </form>
    </div>
  )
}
