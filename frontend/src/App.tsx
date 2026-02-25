import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/Auth";
import ChatPage from "./pages/Chat";

import { createBrowserRouter, RouterProvider } from "react-router";
import { socket } from "./lib/socket";
import { FriendsPage } from "./pages/Friend/FriendPage";
import ListFriend from "./pages/Friend/ListFriend";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux/store";
import { useSound } from "use-sound";
import notificationSound from "./assets/notification.mp3";
import {
  addConversation,
  type Conversation,
} from "./redux/slices/conversationSlice";
import { selectUser } from "./redux/slices/userSlice";
import {
  addNotification,
  type Notification,
} from "./redux/slices/notificationSlice";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat/:conversationId",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/friends",
    element: (
      <ProtectedRoute>
        <FriendsPage>
          <ListFriend />
        </FriendsPage>
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/friend_requests",
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const [play] = useSound(notificationSound, { volume: 0.5 });

  useEffect(() => {
    if (!user?.id) return;

    socket.auth = {
      token: localStorage.getItem("token"),
    };

    socket.connect();

    let interval: ReturnType<typeof setInterval>;

    const startHeartbeat = () => {
      interval = setInterval(() => {
        if (socket.connected) {
          socket.emit("heartbeat");
        }
      }, 30000);
    };

    const stopHeartbeat = () => {
      if (interval) clearInterval(interval);
    };

    socket.on("connect", startHeartbeat);
    socket.on("disconnect", stopHeartbeat);

    return () => {
      stopHeartbeat();
      socket.off("connect", startHeartbeat);
      socket.off("disconnect", stopHeartbeat);
      socket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    const handler = ({ conversation }: { conversation: Conversation }) => {
      dispatch(addConversation({ conversation, userId: user.id }));
    };

    socket.on("chat.new_conversation", handler);

    return () => {
      socket.off("chat.new_conversation", handler);
    };
  }, [dispatch, user.id]);

  useEffect(() => {
    const handler = (data: Notification) => {
      dispatch(addNotification(data));
      play();
    };

    socket.on("notification.new_notification", handler);

    return () => {
      socket.off("notification.new_notification", handler);
    };
  }, [dispatch, play]);

  return <RouterProvider router={router} />;
}

export default App;
