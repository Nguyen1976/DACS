import { cn } from '@/lib/utils'
import type { Message } from '@/redux/slices/messageSlice'
import { selectUser } from '@/redux/slices/userSlice'
import { formatDateTime } from '@/utils/formatDateTime'
import { useSelector } from 'react-redux'

const MessageComponent = ({ message }: { message: Message }) => {
  const user = useSelector(selectUser)

  return (
    <div key={message.id}>
      <div
        className={cn(
          'flex',
          message.senderMember?.userId === user.id
            ? 'justify-end'
            : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-md px-4 py-3 rounded-2xl',
            message.senderMember?.userId === user.id
              ? 'bg-bg-box-message-out text-text rounded-br-md'
              : 'bg-bg-box-message-incoming text-text rounded-bl-md'
          )}
        >
          <p className='text-sm break-words'>{message.text}</p>
          <span className='text-xs opacity-70 mt-1 block'>
            {formatDateTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MessageComponent
