import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/Auth'
import ChatPage from './pages/Chat'

import { createBrowserRouter, RouterProvider } from 'react-router'
import { socket } from './lib/socket'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
])

function App() {
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  return <RouterProvider router={router} />
}

export default App
