import { useEffect, useRef } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'

import { createBrowserRouter, RouterProvider } from 'react-router'
import { socket } from './lib/socket'
import { FriendsPage } from './pages/Friend/FriendPage'
import ListFriend from './pages/Friend/ListFriend'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './redux/store'
import { addMessage, type Message } from './redux/slices/messageSlice'
import { useSound } from 'use-sound'
import notificationSound from './assets/notification.mp3'
import {
  addConversation,
  updateNewMessage,
  upUnreadCount,
  type Conversation,
} from './redux/slices/conversationSlice'
import { selectUser } from './redux/slices/userSlice'
import {
  addNotification,
  type Notification,
} from './redux/slices/notificationSlice'

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat/:conversationId',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/friends',
    element: (
      <ProtectedRoute>
        <FriendsPage>
          <ListFriend />
        </FriendsPage>
      </ProtectedRoute>
    ),
  },
  {
    path: '/groups',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/friend_requests',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
])

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector(selectUser)
  const [play] = useSound(notificationSound, { volume: 0.5 })

  const selectedChatIdRef = useRef<string | null>(null)

  // ✅ connect socket khi có user
  useEffect(() => {
    if (!user?.id) return

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [user?.id])
  useEffect(() => {
    const handler = (data: Message) => {
      dispatch(addMessage(data))

      dispatch(
        updateNewMessage({
          conversationId: data.conversationId,
          lastMessage: { ...data },
        }),
      )

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

  useEffect(() => {
    const handler = ({ conversation }: { conversation: Conversation }) => {
      dispatch(addConversation({ conversation, userId: user.id }))
    }

    socket.on('chat.new_conversation', handler)

    return () => {
      socket.off('chat.new_conversation', handler)
    }
  }, [dispatch, user.id])

  useEffect(() => {
    const handler = (data: Notification) => {
      dispatch(addNotification(data))
      play()
    }

    socket.on('notification.new_notification', handler)

    return () => {
      socket.off('notification.new_notification', handler)
    }
  }, [dispatch, play])

  return <RouterProvider router={router} />
}

export default App
