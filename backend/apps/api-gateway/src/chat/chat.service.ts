import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  CreateConversationRequest,
  CreateConversationResponse,
  Member,
  SendMessageRequest,
} from 'interfaces/chat.grpc'
import { NotificationGrpcServiceClient } from 'interfaces/notification.grpc'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import { AddMemberToConversationDTO, ReadMessageDto } from './dto/chat.dto'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class ChatService implements OnModuleInit {
  private chatClientService: any
  constructor(
    @Inject(CHAT_GRPC_SERVICE_NAME) private readonly chatClient: ClientGrpc,
    private readonly amqpConnection: AmqpConnection,
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
    /**
     * export interface CreateConversationRequest {
        type: string;
        memberIds: string[];
        groupName?: string | undefined;
        groupAvatar?: string | undefined;
        createrId?: string | undefined;
        }
     */
    //nhận vào type, memberIds, groupName?, groupAvatar?
    let observable = this.chatClientService.createConversation(dto) //grpc qua chat service (microservice)
    //bắn socket về các member trong conversation
    const res = await firstValueFrom(observable)

    return res as CreateConversationResponse
  }

  async addMemberToConversation(
    dto: AddMemberToConversationDTO & { userId: string },
  ) {
    const observable = this.chatClientService.addMemberToConversation(dto)
    return await firstValueFrom(observable)
  }

  async getConversations(userId: string, params: any) {
    const observable = this.chatClientService.getConversations({
      userId,
      limit: params.limit,
      cursor: params.cursor,
    })
    const res = await firstValueFrom(observable)
    return res
  }

  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
    params: any,
  ) {
    const observable = this.chatClientService.getMessagesByConversationId({
      conversationId,
      userId,
      limit: params.limit,
      page: params.page,
    })
    const res = await firstValueFrom(observable)
    return res
  }

  async sendMessage(dto: SendMessageRequest) {
    const observable = this.chatClientService.sendMessage(dto)
    return await firstValueFrom(observable)
  }

  async readMessage(dto: ReadMessageDto & { userId: string }) {
    const observable = this.chatClientService.readMessage(dto)
    return await firstValueFrom(observable)
  }
}
