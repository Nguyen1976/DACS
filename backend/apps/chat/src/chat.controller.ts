import { Controller } from '@nestjs/common'
import { ChatService } from './chat.service'
import { GrpcMethod } from '@nestjs/microservices'
import {
  type AddMemberToConversationRequest,
  CHAT_GRPC_SERVICE_NAME,
  ConversationAssetKind,
  type CreateConversationResponse,
  type CreateConversationRequest,
  type CreateMessageUploadUrlRequest,
  CreateMessageUploadUrlResponse,
  type GetConversationsRequest,
  GetConversationAssetsResponse,
  type GetConversationAssetsRequest,
  GetConversationsResponse,
  type GetMessagesRequest,
  type LeaveConversationRequest,
  type LeaveConversationResponse,
  ReadMessageResponse,
  type ReadMessageRequest,
  type RemoveMemberFromConversationRequest,
  type RemoveMemberFromConversationResponse,
  SendMessageResponse,
  type SendMessageRequest,
  type SearchConversationRequest,
  GetConversationByFriendIdResponse,
} from 'interfaces/chat.grpc'
import { Metadata } from '@grpc/grpc-js'
import { ConversationMapper } from './domain/conversation.mapper'
import { safeExecute } from '@app/common/rpc/safe-execute'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'createConversation')
  async createConversation(
    data: CreateConversationRequest,
    metadata: Metadata,
  ): Promise<CreateConversationResponse> {
    const res = await safeExecute(() =>
      this.chatService.createConversation(data),
    )
    return ConversationMapper.toCreateConversationResponse(res)
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'addMemberToConversation')
  async addMemberToConversation(
    data: AddMemberToConversationRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await safeExecute(() =>
      this.chatService.addMemberToConversation(data),
    )
    return res
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'removeMemberFromConversation')
  async removeMemberFromConversation(
    data: RemoveMemberFromConversationRequest,
    metadata: Metadata,
  ): Promise<RemoveMemberFromConversationResponse> {
    return await safeExecute(() =>
      this.chatService.removeMemberFromConversation(data),
    )
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'leaveConversation')
  async leaveConversation(
    data: LeaveConversationRequest,
    metadata: Metadata,
  ): Promise<LeaveConversationResponse> {
    return await safeExecute(() => this.chatService.leaveConversation(data))
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getConversations')
  async getConversations(
    data: GetConversationsRequest,
    metadata: Metadata,
  ): Promise<GetConversationsResponse> {
    const res = await safeExecute(() =>
      this.chatService.getConversations(data.userId, data),
    )
    return ConversationMapper.toGetConversationsResponse(
      res.conversations,
      res.unreadMap,
    )
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getMessagesByConversationId')
  async getMessagesByConversationId(
    data: GetMessagesRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await safeExecute(() =>
      this.chatService.getMessagesByConversationId(
        data.conversationId,
        data.userId,
        { limit: data.limit, page: data.page, cursor: data.cursor },
      ),
    )
    return res
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getConversationAssets')
  async getConversationAssets(
    data: GetConversationAssetsRequest,
    metadata: Metadata,
  ): Promise<GetConversationAssetsResponse> {
    return await safeExecute(() =>
      this.chatService.getConversationAssets(
        data.conversationId,
        data.userId,
        data.kind as ConversationAssetKind,
        {
          limit: data.limit,
          cursor: data.cursor,
        },
      ),
    )
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'createMessageUploadUrl')
  async createMessageUploadUrl(
    data: CreateMessageUploadUrlRequest,
    metadata: Metadata,
  ): Promise<CreateMessageUploadUrlResponse> {
    return await safeExecute(() =>
      this.chatService.createMessageUploadUrl(data),
    )
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'readMessage')
  async readMessage(
    data: ReadMessageRequest,
    metadata: Metadata,
  ): Promise<ReadMessageResponse> {
    const res = await safeExecute(() => this.chatService.readMessage(data))
    return res
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'sendMessage')
  async sendMessage(
    data: SendMessageRequest,
    metadata: Metadata,
  ): Promise<SendMessageResponse> {
    const normalizeMessageType = (
      type: any,
    ): 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' => {
      if (typeof type === 'number') {
        return (['TEXT', 'IMAGE', 'VIDEO', 'FILE'][type] || 'TEXT') as
          | 'TEXT'
          | 'IMAGE'
          | 'VIDEO'
          | 'FILE'
      }
      const normalized = String(type || 'TEXT').toUpperCase()
      if (normalized.includes('IMAGE')) return 'IMAGE'
      if (normalized.includes('VIDEO')) return 'VIDEO'
      if (normalized.includes('FILE')) return 'FILE'
      return 'TEXT'
    }

    const normalizeMediaType = (type: any): 'IMAGE' | 'VIDEO' | 'FILE' => {
      if (typeof type === 'number') {
        return (['IMAGE', 'VIDEO', 'FILE'][type] || 'FILE') as
          | 'IMAGE'
          | 'VIDEO'
          | 'FILE'
      }
      const normalized = String(type || 'MEDIA_FILE').toUpperCase()
      if (normalized.includes('IMAGE')) return 'IMAGE'
      if (normalized.includes('VIDEO')) return 'VIDEO'
      return 'FILE'
    }

    const res = await safeExecute(() =>
      this.chatService.sendMessage({
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.message || '',
        replyToMessageId: data.replyToMessageId,
        tempMessageId: data.clientMessageId || `grpc-${Date.now()}`,
        clientMessageId: data.clientMessageId,
        type: normalizeMessageType(data.type),
        medias: (data.medias || []).map((media) => ({
          mediaType: normalizeMediaType(media.mediaType),
          objectKey: media.objectKey,
          url: media.url,
          mimeType: media.mimeType,
          size: media.size,
          width: media.width,
          height: media.height,
          duration: media.duration,
          thumbnailUrl: media.thumbnailUrl,
          sortOrder: media.sortOrder,
        })),
      }),
    )

    return {
      message: res?.message,
    } as SendMessageResponse
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'searchConversations')
  async searchConversations(
    data: SearchConversationRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await safeExecute(() =>
      this.chatService.searchConversations(data.userId, data.keyword),
    )
    return ConversationMapper.toGetConversationsResponse(
      res.conversations,
      res.unreadMap,
    )
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getConversationByFriendId')
  async getConversationByFriendId(
    data: { friendId: string; userId: string },
    metadata: Metadata,
  ): Promise<GetConversationByFriendIdResponse> {
    const res = await safeExecute(() =>
      this.chatService.getConversationByFriendId(data.friendId, data.userId),
    )
    return ConversationMapper.toGetConversationByFriendIdResponse(
      res.conversation,
      res.unreadMap,
    ) as GetConversationByFriendIdResponse
  }
}
