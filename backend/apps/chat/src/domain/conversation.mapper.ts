import {
  CreateConversationResponse,
  GetConversationByFriendIdResponse,
  GetConversationsResponse,
} from 'interfaces/chat.grpc'

export class ConversationMapper {
  // Add mapping methods here as needed

  private static mapMessage(message: any) {
    if (!message) return null

    return {
      ...message,
      text: message.content || '',
      type: message.type || 'TEXT',
      clientMessageId: message.clientMessageId || undefined,
      createdAt: message.createdAt.toString(),
      medias: (message.medias || []).map((media: any) => ({
        ...media,
        size: String(media.size),
      })),
    }
  }

  static toGetConversationByIdResponse(res: any): any {
    return this.formatConversationResponse(res)
  }

  static toGetConversationsResponse(
    conversations,
    unreadMap: Map<string, string>,
  ): GetConversationsResponse {
    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        type: c.type,
        groupName: c.groupName,
        groupAvatar: c.groupAvatar,
        unreadCount: unreadMap.get(c.id) ?? '0',
        createdAt: c.createdAt.toString(),
        updatedAt: c.updatedAt.toString(),
        members: c.members.map((m) => ({
          ...m,
          userId: m.userId,
          username: m.username,
          avatar: m.avatar,
          fullName: m.fullName,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : null,
          lastMessageAt: m.lastMessageAt.toString(),
        })),
        lastMessage: c.messages.length ? this.mapMessage(c.messages[0]) : null,
      })),
    } as GetConversationsResponse
  }
  static toGetConversationByFriendIdResponse(
    conversation,
    unreadMap: Map<string, string>,
  ): GetConversationByFriendIdResponse {
    return {
      conversation: {
        id: conversation.id,
        type: conversation.type,
        groupName: conversation.groupName,
        groupAvatar: conversation.groupAvatar,
        unreadCount: unreadMap.get(conversation.id) ?? '0',
        createdAt: conversation.createdAt.toString(),
        updatedAt: conversation.updatedAt.toString(),
        members: conversation.members.map((m) => ({
          userId: m.userId,
          username: m.username,
          avatar: m.avatar,
          fullName: m.fullName,
          lastReadAt: m.lastReadAt?.toString() ?? null,
          lastMessageAt: m.lastMessageAt.toString(),
        })),
        lastMessage: conversation.messages.length
          ? this.mapMessage(conversation.messages[0])
          : null,
      },
    } as GetConversationByFriendIdResponse
  }

  static toCreateConversationResponse(res: any): CreateConversationResponse {
    return this.formatConversationResponse(res)
  }

  // Private helper methods
  static formatConversationResponse(res: any): CreateConversationResponse {
    return {
      conversation: {
        id: res?.id,
        unreadCount: '0',
        type: res?.type,
        groupName: res?.groupName,
        groupAvatar: res?.groupAvatar,
        createdAt: res?.createdAt.toString(),
        updatedAt: res?.updatedAt.toString(),
        members: res?.members.map((m: any) => ({
          ...m,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : '',
        })),
        messages: res?.messages?.map((msg: any) => this.mapMessage(msg)) || [],
      },
    } as CreateConversationResponse
  }
}
