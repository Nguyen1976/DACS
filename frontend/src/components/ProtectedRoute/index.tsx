import { socket } from '@/lib/socket'
import { selectUser } from '@/redux/slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router'
import { useEffect, useRef } from 'react'
import { addMessage, type Message } from '@/redux/slices/messageSlice'
import type { AppDispatch } from '@/redux/store'
import {
  updateNewMessage,
  upUnreadCount,
} from '@/redux/slices/conversationSlice'
import { useSound } from 'use-sound'
import notificationSound from '@/assets/notification.mp3'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { conversationId } = useParams()

  const selectedChatIdRef = useRef<string | null>(conversationId)

  const [play] = useSound(notificationSound, { volume: 0.5 })

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    selectedChatIdRef.current = conversationId ?? null
  }, [conversationId])

  useEffect(() => {
    const handler = (data: Message) => {
      dispatch(addMessage(data))

      dispatch(
        updateNewMessage({
          conversationId: data.conversationId,
          lastMessage: { ...data },
        }),
      )
      console.log(selectedChatIdRef.current)
      if (data.conversationId !== selectedChatIdRef.current) {
        dispatch(
          upUnreadCount({
            conversationId: data.conversationId,
          }),
        )
      }
      play()
    }

    socket.on('chat.new_message', handler)

    return () => {
      socket.off('chat.new_message', handler)
    }
  }, [dispatch, play])

  const user = useSelector(selectUser)
  if (!user?.id) {
    console.log('no user')
    return <Navigate to='/auth' replace />
  }

  return children
}

export default ProtectedRoute
