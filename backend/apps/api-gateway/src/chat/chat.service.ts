import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  CreateConversationRequest,
  CreateConversationResponse,
} from 'interfaces/chat.grpc'
import { NotificationGrpcServiceClient } from 'interfaces/notification.grpc'
import { SOCKET_EVENTS } from 'libs/constant/socket.events'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import { AddMemberToConversationDTO } from './dto/chat.dto'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class ChatService implements OnModuleInit {
  private chatClientService: any
  constructor(
    @Inject(CHAT_GRPC_SERVICE_NAME) private readonly chatClient: ClientGrpc,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
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
    let observable = this.chatClientService.createConversation(dto)
    //bắn socket về các member trong conversation
    const res = await firstValueFrom(observable)

    this.realtimeGateway.emitToUser(
      dto.memberIds.filter((id) => id !== dto.createrId),
      SOCKET_EVENTS.CHAT.NEW_CONVERSATION,
      res,
    )
    return res as CreateConversationResponse
  }

  //k cần grpc
  sendMessage(dto) {
    this.amqpConnection.publish('chat.events', 'message.send', dto)
  }

  async addMemberToConversation(dto: AddMemberToConversationDTO) {
    //nhận vào conversationId, memberIds[]
  }
}
