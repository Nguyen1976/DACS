import authorizeAxiosInstance from "@/utils/authorizeAxios";
import { API_ROOT } from "@/utils/constant";

export const makeFriendRequest = async (
  email: string,
): Promise<{ status: string }> => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/user/make-friend`,
    { email },
  );
  return response.data;
};

export const getFriendRequestDetail = async (friendRequestId: string) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/user/detail-friend-request?friendRequestId=${friendRequestId}`,
  );
  return response.data.data;
};

export const registerAPI = async (data: {
  email: string;
  username: string;
  password: string;
}): Promise<unknown> => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/user/register`,
    data,
  );
  return response.data;
};

export interface FromUser {
  email: string;
  username: string;
  avatar: string;
  id: string;
}

export interface DetailMakeFriendResponse {
  id: string;
  fromUser: FromUser | undefined;
  toUserId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const updateFriendRequestStatus = async ({
  inviterId,
  inviteeName,
  status,
}: {
  inviterId: string;
  inviteeName: string;
  status: "ACCEPTED" | "REJECTED";
}): Promise<{ status: string }> => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/user/update-status-make-friend`,
    { inviterId, inviteeName, status },
  );
  return response.data;
};

export interface UserProfileByIdResponse {
  fullName: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
}

export const getUserProfileByIdAPI = async (
  userId: string,
): Promise<UserProfileByIdResponse> => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/user?userId=${userId}`,
  );
  return response.data.data;
};

export interface ConversationByFriendResponse {
  conversations: {
    id: string;
    type: string;
    unreadCount?: string;
    groupName?: string;
    groupAvatar?: string;
    createdAt: string;
    updatedAt?: string;
    members: Array<{
      userId: string;
      lastReadAt?: string;
      username?: string;
      avatar?: string;
      fullName?: string;
      lastMessageAt?: string;
    }>;
    lastMessage: {
      id: string;
      conversationId: string;
      senderId: string;
      text: string;
      isDeleted?: boolean;
      createdAt: string;
      senderMember?: {
        userId: string;
        username?: string;
        avatar?: string;
        fullName?: string;
      };
    } | null;
  };
}

export const getConversationByFriendIdAPI = async (
  friendId: string,
): Promise<ConversationByFriendResponse> => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/chat/conversation-by-friend/?friendId=${friendId}`,
  );
  return response.data.data;
};

export interface SearchConversationItem {
  id: string;
  type: string;
  unreadCount?: string;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  members: Array<{
    userId: string;
    lastReadAt?: string;
    username?: string;
    avatar?: string;
    fullName?: string;
    lastMessageAt?: string;
  }>;
  lastMessage: {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    isDeleted?: boolean;
    createdAt: string;
    senderMember?: {
      userId: string;
      username?: string;
      avatar?: string;
      fullName?: string;
    };
  } | null;
}

export const searchConversationsAPI = async (
  keyword: string,
): Promise<SearchConversationItem[]> => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/chat/search?keyword=${encodeURIComponent(keyword)}`,
  );
  return response.data.data.conversations || [];
};
