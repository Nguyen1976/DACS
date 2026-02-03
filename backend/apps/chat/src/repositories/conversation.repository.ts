import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType } from '@prisma/client'

@Injectable()
export class ConversationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: {
    type: conversationType
    groupName?: string
    groupAvatar?: string
  }) {
    return await this.prisma.conversation.create({
      data: {
        type: data.type,
        groupName: data.groupName || null,
        groupAvatar: data.groupAvatar || null,
      },
    })
  }

  async findById(id: string) {
    return await this.prisma.conversation.findUnique({
      where: { id },
    })
  }

  async findByIdWithMembers(id: string) {
    return await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
            fullName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
            replyToMessageId: true,
            isDeleted: true,
            deleteType: true,
            senderMember: {
              select: {
                userId: true,
                username: true,
                avatar: true,
                fullName: true,
              },
            },
          },
        },
      },
    })
  }

  async findByUserIdPaginated(userId: string, skip: number, take: number) {
    //phân tích cách cũ khi findMany và some trong members k tận dụng được index ở userId
    //và việc join xong mới where nên rất chậm khi data lớn
    //cách mới: tận dụng index ở userId để lọc trước rồi mới join
    //khi conversation lớn thì nó vẫn nhanh vì chạy trên membership có sẵn
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take,
      select: { conversationId: true },
    })

    const conversations = await this.prisma.conversation.findMany({
      where: {
        id: { in: memberships.map((m) => m.conversationId) },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
            fullName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
            replyToMessageId: true,
            isDeleted: true,
            deleteType: true,
            senderMember: {
              select: {
                userId: true,
                username: true,
                avatar: true,
                fullName: true,
              },
            },
          },
        },
      },
    })

    return conversations
  }

  async updateUpdatedAt(conversationId: string) {
    return await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }
}
