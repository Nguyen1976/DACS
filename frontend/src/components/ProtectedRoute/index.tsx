import { socket } from "@/lib/socket";
import { selectUser } from "@/redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router";
import { useEffect, useRef } from "react";
import {
  ackMessage,
  addMessage,
  failMessage,
  type Message,
} from "@/redux/slices/messageSlice";
import type { AppDispatch } from "@/redux/store";
import {
  addConversationMembers,
  applyConversationUpdate,
  removeConversationMember,
  setConversationAccessState,
  updateNewMessage,
  upUnreadCount,
} from "@/redux/slices/conversationSlice";
import { useSound } from "use-sound";
import notificationSound from "@/assets/notification.mp3";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { conversationId } = useParams();

  const selectedChatIdRef = useRef<string | null>(conversationId);

  const [play] = useSound(notificationSound, { volume: 0.5 });

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  useEffect(() => {
    selectedChatIdRef.current = conversationId ?? null;
  }, [conversationId]);

  useEffect(() => {
    const handler = (data: Message) => {
      dispatch(addMessage(data));

      dispatch(
        updateNewMessage({
          conversationId: data.conversationId,
          lastMessage: { ...data },
        }),
      );

      if (data.conversationId !== selectedChatIdRef.current) {
        dispatch(
          upUnreadCount({
            conversationId: data.conversationId,
          }),
        );
      }
      play();
    };

    const newMessageHandler = (payload: { message: Message }) => {
      const message = payload.message;
      dispatch(addMessage(message));
      dispatch(
        updateNewMessage({
          conversationId: message.conversationId,
          lastMessage: { ...message },
        }),
      );

      if (message.conversationId !== selectedChatIdRef.current) {
        dispatch(
          upUnreadCount({
            conversationId: message.conversationId,
          }),
        );
      }
      play();
    };

    const ackHandler = (payload: {
      conversationId: string;
      clientMessageId?: string;
      serverMessageId: string;
      message?: Message;
    }) => {
      dispatch(
        ackMessage({
          conversationId: payload.conversationId,
          clientMessageId: payload.clientMessageId,
          serverMessageId: payload.serverMessageId,
          message: payload.message,
        }),
      );
    };

    const errorHandler = (payload: {
      clientMessageId?: string;
      conversationId?: string;
    }) => {
      if (!payload.conversationId) return;
      dispatch(
        failMessage({
          conversationId: payload.conversationId,
          clientMessageId: payload.clientMessageId,
        }),
      );
    };

    const systemMessageHandler = (payload: { message: Message }) => {
      const message = payload.message;
      dispatch(addMessage(message));
      dispatch(
        updateNewMessage({
          conversationId: message.conversationId,
          lastMessage: { ...message },
        }),
      );
    };

    const memberAddedHandler = (payload: {
      conversationId: string;
      memberIds: string[];
      members?: Array<{
        userId: string;
        role?: "ADMIN" | "MEMBER" | "OWNER";
        username?: string;
        fullName?: string;
        avatar?: string;
      }>;
    }) => {
      dispatch(
        addConversationMembers({
          conversationId: payload.conversationId,
          memberIds: payload.memberIds || [],
          members: payload.members || [],
        }),
      );
    };

    const memberRemovedHandler = (payload: {
      conversationId: string;
      targetUserId: string;
    }) => {
      dispatch(
        removeConversationMember({
          conversationId: payload.conversationId,
          userId: payload.targetUserId,
        }),
      );

      if (payload.targetUserId === user.id) {
        dispatch(
          setConversationAccessState({
            conversationId: payload.conversationId,
            membershipStatus: "REMOVED",
            canSendMessage: false,
          }),
        );
      }
    };

    const memberLeftHandler = (payload: {
      conversationId: string;
      actorId: string;
    }) => {
      dispatch(
        removeConversationMember({
          conversationId: payload.conversationId,
          userId: payload.actorId,
        }),
      );

      if (payload.actorId === user.id) {
        dispatch(
          setConversationAccessState({
            conversationId: payload.conversationId,
            membershipStatus: "LEFT",
            canSendMessage: false,
          }),
        );
      }
    };

    const conversationUpdateHandler = (payload: {
      conversation: any;
      membershipStatus?: "ACTIVE" | "REMOVED" | "LEFT";
      canSendMessage?: boolean;
    }) => {
      if (!payload?.conversation) return;
      dispatch(
        applyConversationUpdate({
          conversation: payload.conversation,
          membershipStatus: payload.membershipStatus,
          canSendMessage: payload.canSendMessage,
        }),
      );
    };

    socket.on("chat.new_message", handler);
    socket.on("message:new", newMessageHandler);
    socket.on("message:ack", ackHandler);
    socket.on("message:error", errorHandler);
    socket.on("message:system", systemMessageHandler);
    socket.on("conversation:member_added", memberAddedHandler);
    socket.on("conversation:member_removed", memberRemovedHandler);
    socket.on("conversation:member_left", memberLeftHandler);
    socket.on("conversation:update", conversationUpdateHandler);

    return () => {
      socket.off("chat.new_message", handler);
      socket.off("message:new", newMessageHandler);
      socket.off("message:ack", ackHandler);
      socket.off("message:error", errorHandler);
      socket.off("message:system", systemMessageHandler);
      socket.off("conversation:member_added", memberAddedHandler);
      socket.off("conversation:member_removed", memberRemovedHandler);
      socket.off("conversation:member_left", memberLeftHandler);
      socket.off("conversation:update", conversationUpdateHandler);
    };
  }, [dispatch, play, user.id]);

  if (!user?.id) {
    console.log("no user");
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
