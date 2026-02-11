export interface UserCreatedPayload {
  id: string
  email: string
  username: string
}

export interface UserMakeFriendPayload {
  inviterId: string
  inviterName: string

  inviteeEmail: string
  inviteeName: string
  inviteeId: string
  friendRequestId: string
}

export interface UserUpdateStatusMakeFriendPayload {
  inviterId: string //ngươi nhận thông báo
  inviteeId: string
  inviteeName: string
  status: string
  members: { userId: string; username: string; avatar: string, fullName: string }[]
}

export interface SendMessagePayload {
  conversationId: string
  senderId: string
  message: string
  replyToMessageId?: string
  tempMessageId: string
}

export interface MemberAddedToConversationPayload {
  conversationId: string
  newMemberIds: string[]
}

export interface UserUpdatedPayload {
  userId: string
  avatar?: string
  fullName?: string
}

export interface CallStartedPayload {
  callId: string
  roomId: string
  callerId: string
  callerName: string
  callerAvatar?: string
  targetUserIds: string[]
  conversationId?: string
  callType: 'DIRECT' | 'GROUP'
  mediaType: 'AUDIO' | 'VIDEO'
}

export interface CallAcceptedPayload {
  callId: string
  roomId: string
  userId: string
  username: string
  userAvatar?: string
  token: string
  participantUserIds: string[]
}

export interface CallRejectedPayload {
  callId: string
  roomId: string
  userId: string
  username: string
  participantUserIds: string[]
}

export interface CallEndedPayload {
  callId: string
  roomId: string
  endedBy: string
  participantUserIds: string[]
  reason?: string
}

export interface CallParticipantJoinedPayload {
  callId: string
  roomId: string
  userId: string
  username: string
  userAvatar?: string
  participantUserIds: string[]
}

export interface CallParticipantLeftPayload {
  callId: string
  roomId: string
  userId: string
  username: string
  participantUserIds: string[]
}