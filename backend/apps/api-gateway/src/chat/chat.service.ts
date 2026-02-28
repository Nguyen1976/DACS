import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  ConversationAssetKind,
  GetConversationAssetsResponse,
  CreateMessageUploadUrlResponse,
  MessageType,
  CreateConversationRequest,
  CreateConversationResponse,
  Member,
} from 'interfaces/chat.grpc'
import { NotificationGrpcServiceClient } from 'interfaces/notification.grpc'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import {
  AddMemberToConversationDTO,
  CreateMessageUploadUrlDTO,
  ReadMessageDto,
} from './dto/chat.dto'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { CreateConversationDTO } from './dto/chat.dto'
import type { Multer } from 'multer'

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
    dto: CreateConversationDTO & {
      createrId: string
      members: Member[]
      groupAvatar?: Multer.File
    },
  ): Promise<CreateConversationResponse> {
    let observable = this.chatClientService.createConversation({
      ...dto,
      type: 'GROUP',
      groupAvatar: dto.groupAvatar ? dto.groupAvatar.buffer : undefined,
      groupAvatarFilename: dto.groupAvatar
        ? dto.groupAvatar.originalname
        : undefined,
    })
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
      cursor: params.cursor,
    })
    const res = await firstValueFrom(observable)
    return res
  }

  async getConversationAssets(
    conversationId: string,
    userId: string,
    kind: 'MEDIA' | 'LINK' | 'DOC',
    params: {
      limit?: number
      cursor?: string | null
    },
  ): Promise<GetConversationAssetsResponse> {
    const kindMap: Record<'MEDIA' | 'LINK' | 'DOC', ConversationAssetKind> = {
      MEDIA: ConversationAssetKind.ASSET_MEDIA,
      LINK: ConversationAssetKind.ASSET_LINK,
      DOC: ConversationAssetKind.ASSET_DOC,
    }

    const observable = this.chatClientService.getConversationAssets({
      conversationId,
      userId,
      kind: kindMap[kind],
      limit: String(params.limit || 20),
      cursor: params.cursor || undefined,
    })

    return await firstValueFrom(observable)
  }

  async createMessageUploadUrl(
    dto: CreateMessageUploadUrlDTO & { userId: string },
  ): Promise<CreateMessageUploadUrlResponse> {
    const mapMessageType = (type: 'IMAGE' | 'VIDEO' | 'FILE') => {
      if (type === 'IMAGE') return MessageType.IMAGE
      if (type === 'VIDEO') return MessageType.VIDEO
      return MessageType.FILE
    }

    const observable = this.chatClientService.createMessageUploadUrl({
      ...dto,
      type: mapMessageType(dto.type),
    })
    return await firstValueFrom(observable)
  }

  async readMessage(dto: ReadMessageDto & { userId: string }) {
    const observable = this.chatClientService.readMessage(dto)
    return await firstValueFrom(observable)
  }

  async searchConversations(userId: string, keyword: string) {
    const observable = this.chatClientService.searchConversations({
      userId,
      keyword,
    })
    return await firstValueFrom(observable)
  }

  async getConversationByFriendId(friendId: string, userId: string) {
    const observable = this.chatClientService.getConversationByFriendId({
      friendId,
      userId,
    })
    return await firstValueFrom(observable)
  }
}
