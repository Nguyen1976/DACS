export interface StartCallDto {
  callerId: string
  callerName: string
  callerAvatar?: string
  targetUserIds: string[]
  conversationId?: string
  callType: 'DIRECT' | 'GROUP'
  mediaType: 'AUDIO' | 'VIDEO'
}

export interface AcceptCallDto {
  callId: string
  roomId: string
  userId: string
  username: string
  userAvatar?: string
}

export interface RejectCallDto {
  callId: string
  roomId: string
  userId: string
  username: string
}

export interface EndCallDto {
  callId: string
  roomId: string
  endedBy: string
  reason?: string
}
