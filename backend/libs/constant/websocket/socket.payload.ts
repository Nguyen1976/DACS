export interface SendMessagePayloadSocket {
  conversationId: string
  message: string
  replyToMessageId?: string
  memberIds: string[]
  tempMessageId: string
}
