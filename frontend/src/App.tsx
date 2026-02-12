import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'

import { createBrowserRouter, RouterProvider } from 'react-router'
import { socket } from './lib/socket'
import { FriendsPage } from './pages/Friend/FriendPage'
import ListFriend from './pages/Friend/ListFriend'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './redux/store'
import { useSound } from 'use-sound'
import notificationSound from './assets/notification.mp3'
import {
  addConversation,
  type Conversation,
} from './redux/slices/conversationSlice'
import { selectUser } from './redux/slices/userSlice'
import {
  addNotification,
  type Notification,
} from './redux/slices/notificationSlice'
import {
  setIncomingCall,
  setCallConnected,
  addParticipant,
  removeParticipant,
  setCallEnded,
  resetCall,
} from './redux/slices/callSlice'
import { IncomingCallDialog } from './components/call/IncomingCallDialog'
import { CallModal } from './components/call/CallModal'

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



  // ✅ connect socket khi có user
  useEffect(() => {
    if (!user?.id) return

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [user?.id])

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

  // Call event listeners
  useEffect(() => {
    const handleIncomingCall = (data: any) => {
      dispatch(setIncomingCall({
        callId: data.callId,
        roomId: data.roomId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        callType: data.callType,
        mediaType: data.mediaType,
      }))
      play()
    }

    const handleCallAccepted = (data: any) => {
      dispatch(setCallConnected({
        callId: data.callId,
        roomId: data.roomId,
        userId: data.userId,
        username: data.username,
        userAvatar: data.userAvatar,
        token: data.token,
      }))
    }

    const handleCallRejected = (data: any) => {
      dispatch(setCallEnded())
      setTimeout(() => dispatch(resetCall()), 2000)
    }

    const handleCallEnded = (data: any) => {
      dispatch(setCallEnded())
      setTimeout(() => dispatch(resetCall()), 2000)
    }

    const handleParticipantJoined = (data: any) => {
      dispatch(addParticipant({
        userId: data.userId,
        username: data.username,
        userAvatar: data.userAvatar,
      }))
    }

    const handleParticipantLeft = (data: any) => {
      dispatch(removeParticipant({ userId: data.userId }))
    }

    socket.on('call.incoming_call', handleIncomingCall)
    socket.on('call.call_accepted', handleCallAccepted)
    socket.on('call.call_rejected', handleCallRejected)
    socket.on('call.call_ended', handleCallEnded)
    socket.on('call.participant_joined', handleParticipantJoined)
    socket.on('call.participant_left', handleParticipantLeft)

    return () => {
      socket.off('call.incoming_call', handleIncomingCall)
      socket.off('call.call_accepted', handleCallAccepted)
      socket.off('call.call_rejected', handleCallRejected)
      socket.off('call.call_ended', handleCallEnded)
      socket.off('call.participant_joined', handleParticipantJoined)
      socket.off('call.participant_left', handleParticipantLeft)
    }
  }, [dispatch, play])

  return (
    <>
      <RouterProvider router={router} />
      <IncomingCallDialog />
      <CallModal />
    </>
  )
}

export default App
