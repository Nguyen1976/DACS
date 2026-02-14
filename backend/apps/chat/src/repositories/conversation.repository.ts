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

  async findByUserIdPaginated(
    userId: string,
    cursor: Date | null,
    take: number,
  ) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: {
        userId,
        ...(cursor && {
          lastMessageAt: { lt: cursor },
        }),
      },
      orderBy: { lastMessageAt: 'desc' },
      take,
      select: { conversationId: true },
    })

    const conversations = await this.prisma.conversation.findMany({
      where: {
        id: { in: memberships.map((m) => m.conversationId) },
      },
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            senderMember: true,
          },
        },
      },
    })

    //sort lại conver theo thứ tự member vì conver không có order by
    const map = new Map(conversations.map((c) => [c.id, c]))

    const ordered = memberships.map((m) => map.get(m.conversationId))

    return ordered
  }

  async updateUpdatedAt(conversationId: string) {
    return await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }

  async searchByKeyword(userId: string, keyword: string) {
    // 1️⃣ Lấy danh sách conversation mà user tham gia
    const memberships = await this.prisma.conversationMember.findMany({
      where: {
        userId,
        conversation: {
          groupName: {
            contains: keyword,
            mode: 'insensitive', // không phân biệt hoa thường
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      select: { conversationId: true },
    })

    if (!memberships.length) return []

    // 2️⃣ Lấy conversation giống cấu trúc findByUserIdPaginated
    const conversations = await this.prisma.conversation.findMany({
      where: {
        id: { in: memberships.map((m) => m.conversationId) },
      },
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            senderMember: true,
          },
        },
      },
    })

    // 3️⃣ Giữ đúng thứ tự theo membership
    const map = new Map(conversations.map((c) => [c.id, c]))
    const ordered = memberships.map((m) => map.get(m.conversationId))

    return ordered
  }
}
