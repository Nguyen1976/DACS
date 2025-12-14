import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  CreateConversationRequest,
  CreateConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'interfaces/chat.grpc'
import { NotificationGrpcServiceClient } from 'interfaces/notification.grpc'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'

@Injectable()
export class ChatService implements OnModuleInit {
  private chatClientService: any
  constructor(
    @Inject(CHAT_GRPC_SERVICE_NAME) private readonly chatClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.chatClientService =
      this.chatClient.getService<NotificationGrpcServiceClient>(
        CHAT_GRPC_SERVICE_NAME,
      )
  }

  async createConversation(
    dto: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    //nhận vào type, memberIds, groupName?, groupAvatar?
    let observable = this.chatClientService.createConversation(dto)

    return await firstValueFrom(observable)
  }

  async sendMessage(dto: SendMessageRequest): Promise<SendMessageResponse> {

    let observable = this.chatClientService.sendMessage(dto)

    return await firstValueFrom(observable)
  }
}
