import { Controller } from '@nestjs/common'
import { ChatService } from './chat.service'
import { GrpcMethod } from '@nestjs/microservices'
import {
  type AddMemberToConversationRequest,
  CHAT_GRPC_SERVICE_NAME,
  type CreateConversationResponse,
  type CreateConversationRequest,
  type GetConversationsRequest,
  GetConversationsResponse,
  type GetMessagesRequest,
  type SendMessageRequest,
  type SendMessageResponse,
  ReadMessageResponse,
  type ReadMessageRequest,
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
        { limit: data.limit, page: data.page },
      ),
    )
    return res
  }

  // @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'sendMessage')
  // async sendMessage(
  //   data: SendMessageRequest,
  //   metadata: Metadata,
  // ): Promise<SendMessageResponse> {
  //   const message = await safeExecute(() => this.chatService.sendMessage(data))
  //   return message
  // }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'readMessage')
  async readMessage(
    data: ReadMessageRequest,
    metadata: Metadata,
  ): Promise<ReadMessageResponse> {
    const res = await safeExecute(() => this.chatService.readMessage(data))
    return res
  }
}
