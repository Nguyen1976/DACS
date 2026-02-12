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


export interface UserUpdatedPayload {
  userId: string
  avatar?: string
  fullName?: string
}


export interface  EmitToUserPayload {
  userIds: string[]
  event: string
  data: any
}