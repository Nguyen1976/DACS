import { Inject, Injectable } from '@nestjs/common'
import { conversationType, Status } from '@prisma/client'
import {
  AddMemberToConversationRequest,
  type AddMemberToConversationResponse,
  CreateConversationRequest,
  GetMessagesResponse,
  ReadMessageRequest,
  ReadMessageResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'interfaces/chat.grpc'
import type {
  MessageSendPayload,
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import {
  ConversationRepository,
  MessageRepository,
  ConversationMemberRepository,
} from './repositories'
import { ChatErrors } from './errors/chat.errors'
import { ChatEventsPublisher } from './rmq/publishers/chat-events.publisher'
import { StorageR2Service } from '@app/storage-r2/storage-r2.service'

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
    private readonly memberRepo: ConversationMemberRepository,
    private readonly eventsPublisher: ChatEventsPublisher,
    @Inject(StorageR2Service)
    private readonly storageR2Service: StorageR2Service,
  ) {}

  async createConversationWhenAcceptFriend(
    data: UserUpdateStatusMakeFriendPayload,
  ) {
    if (!(data.status === Status.ACCEPTED)) return
    await this.createConversation({
      type: conversationType.DIRECT,
      members: data.members,
    })
  }

  async createConversation(data: CreateConversationRequest) {
    const memberIds = data.members
      .map((m) => m.userId)
      .filter((id) => id !== data.createrId)
    //trường hợp tạo nhóm
    if (data.createrId && memberIds.length <= 1) {
      ChatErrors.conversationNotEnoughMembers()
    }

    let avatarUrl = ''
    if (data.groupAvatar && data.groupAvatarFilename) {
      const mime =
        this.getMimeType(data.groupAvatarFilename) || 'application/octet-stream'

      avatarUrl = await this.storageR2Service.upload({
        buffer: data.groupAvatar as Buffer,
        mime,
        folder: 'avatars',
        ext: data.groupAvatarFilename?.split('.').pop() || 'bin',
      })
    }

    const conversation = await this.conversationRepo.create({
      type: data.type as conversationType,
      groupName: data.groupName,
      groupAvatar: avatarUrl,
    })

    await this.memberRepo.createMany(
      conversation.id,
      data.members,
      data.createrId as string,
      data.type as conversationType,
    )

    const res = await this.conversationRepo.findByIdWithMembers(conversation.id)

    this.eventsPublisher.publishConversationCreated({
      ...res,
      memberIds,
    })

    return res
  }

  async sendMessage(data: MessageSendPayload) {
    const conversationMembers = await this.memberRepo.findByConversationId(
      data.conversationId,
    )
    const memberIds = conversationMembers.map((cm) => cm.userId)

    if (!memberIds.includes(data.senderId)) {
      ChatErrors.senderNotMember()
    }

    const message = await this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      text: data.text,
      replyToMessageId: data.replyToMessageId,
    })

    await this.conversationRepo.updateUpdatedAt(data.conversationId)

    await this.memberRepo.updateLastMessageAt(
      data.conversationId,
      message.createdAt,
    )

    this.eventsPublisher.publishMessageSent(
      { ...message, tempMessageId: data.tempMessageId },
      memberIds as string[],
    )
  }

  async addMemberToConversation(
    dto: AddMemberToConversationRequest,
  ): Promise<AddMemberToConversationResponse> {
    const conversation = await this.conversationRepo.findById(
      dto.conversationId,
    )

    if (!conversation) {
      ChatErrors.conversationNotFound()
    }

    if (conversation.type === conversationType.DIRECT) {
      ChatErrors.userNoPermission()
    }

    const existingMembers = await this.memberRepo.findByConversationId(
      dto.conversationId,
    )
    //check role
    const checkRole = existingMembers.find(
      (m) => m.userId === dto.userId && m.role === 'admin',
    )
    if (!checkRole) {
      ChatErrors.userNoPermission()
    }

    const memberIds = dto.members.map((member) => member.userId)

    const existingMemberIds = existingMembers.map((m) => m.userId)
    const newMemberIds = memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    )

    if (newMemberIds.length === 0) {
      return {
        status: 'SUCCESS',
      }
    }

    await this.memberRepo.addMembers(dto.conversationId, newMemberIds)
    const res = await this.conversationRepo.findByIdWithMembers(conversation.id)

    this.eventsPublisher.publishMemberAddedToConversation({
      ...res,
      newMemberIds,
    })

    return {
      status: 'SUCCESS',
    }
  }

  async getConversations(userId: string, params: any) {
    const take = Number(params.limit) || 20
    const cursor = params.cursor ? new Date(params.cursor) : null
    const conversations = await this.conversationRepo.findByUserIdPaginated(
      userId,
      cursor,
      take,
    )
    const unreadMap = await this.calculateUnreadCounts(conversations, userId)

    return {
      conversations,
      unreadMap,
    }
  }

  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
    params: any,
  ): Promise<GetMessagesResponse> {
    const isMember = await this.memberRepo.findByConversationIdAndUserId(
      conversationId,
      userId,
    )

    if (!isMember) {
      ChatErrors.userNotMember()
    }

    const take = params.limit || 20
    const page = params.page || 1
    const skip = (page - 1) * take

    const messages = await this.messageRepo.findByConversationIdPaginated(
      conversationId,
      skip,
      parseInt(take),
    )

    return {
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toString(),
      })),
    } as GetMessagesResponse
  }

  async readMessage(data: ReadMessageRequest): Promise<ReadMessageResponse> {
    const message = await this.messageRepo.findById(
      data.lastReadMessageId,
      data.conversationId,
    )

    if (!message) {
      ChatErrors.invalidLastReadMessage()
    }

    await this.memberRepo.updateLastRead(
      data.conversationId,
      data.userId,
      data.lastReadMessageId,
    )

    return { lastReadMessageId: data.lastReadMessageId }
  }

  async handleUserUpdated(data: UserUpdatedPayload) {
    await this.memberRepo.updateByUserId(data.userId, {
      avatar: data.avatar,
      fullName: data.fullName,
    })
  }

  async searchConversations(userId: string, keyword: string) {
    const conversations = await this.conversationRepo.searchByKeyword(
      userId,
      keyword,
    )

    const converOfFriend =
      await this.conversationRepo.findDirectConversationOfFriend(
        userId,
        keyword,
      )

    const mergedConversations = [...converOfFriend]

    const unreadMap = await this.calculateUnreadCounts(
      mergedConversations,
      userId,
    )

    return {
      conversations: mergedConversations,
      unreadMap,
    }
  }

  async getConversationByFriendId(friendId: string, userId: string) {
    const conversation = await this.conversationRepo.findConversationByFriendId(
      friendId,
      userId,
    )

    if (!conversation) {
      ChatErrors.conversationNotFound()
    }

    const isMember = conversation.members.find((m) => m.userId === userId)
    if (!isMember) {
      ChatErrors.userNotMember()
    }

    const unreadMap = await this.calculateUnreadCounts([conversation], userId)
    console.log('unreadMap', unreadMap)
    console.log('conversation', conversation)
    return {
      conversation,
      unreadMap,
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  private async calculateUnreadCounts(
    conversations: any[],
    userId: string,
  ): Promise<Map<string, string>> {
    const unreadMap = new Map<string, string>()

    await Promise.all(
      conversations.map(async (c) => {
        const me = c.members.find((m: any) => m.userId === userId)
        const lastReadAt = me?.lastReadAt ?? null

        const unreadMessages = await this.messageRepo.findUnreadMessages(
          c.id,
          lastReadAt,
          userId,
        )

        if (unreadMessages.length === 0) {
          unreadMap.set(c.id, '0')
        } else if (unreadMessages.length <= 5) {
          unreadMap.set(c.id, String(unreadMessages.length))
        } else {
          unreadMap.set(c.id, '5+')
        }
      }),
    )

    return unreadMap
  }
}
