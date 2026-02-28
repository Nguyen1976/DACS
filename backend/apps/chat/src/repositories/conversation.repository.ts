import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType } from '@prisma/client'
import { Prisma } from '@prisma/client'

@Injectable()
export class ConversationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private updatedAtBackfilled = false
  private participantRoleBackfilled = false

  private async forceBackfillConversationUpdatedAt() {
    await this.prisma.$runCommandRaw({
      update: 'conversation',
      updates: [
        {
          q: {
            $or: [{ updatedAt: null }, { updatedAt: { $exists: false } }],
          },
          u: [
            {
              $set: {
                updatedAt: {
                  $ifNull: ['$createdAt', '$$NOW'],
                },
              },
            },
          ],
          multi: true,
        },
      ],
    })
  }

  private async ensureConversationUpdatedAtNotNull() {
    if (this.updatedAtBackfilled) return
    await this.forceBackfillConversationUpdatedAt()
    this.updatedAtBackfilled = true
  }

  private async forceBackfillParticipantRole() {
    await this.prisma.$runCommandRaw({
      update: 'conversationMember',
      updates: [
        {
          q: {
            $or: [
              { role: null },
              { role: { $exists: false } },
              { role: 'member' },
              { role: 'admin' },
              { role: 'owner' },
            ],
          },
          u: [
            {
              $set: {
                role: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$role', 'admin'] }, then: 'ADMIN' },
                      { case: { $eq: ['$role', 'owner'] }, then: 'OWNER' },
                      { case: { $eq: ['$role', 'member'] }, then: 'MEMBER' },
                    ],
                    default: 'MEMBER',
                  },
                },
              },
            },
          ],
          multi: true,
        },
      ],
    })
  }

  private async ensureParticipantRoleNormalized() {
    if (this.participantRoleBackfilled) return
    await this.forceBackfillParticipantRole()
    this.participantRoleBackfilled = true
  }

  private async findConversationsWithRetry(
    args: Prisma.conversationFindManyArgs,
  ) {
    try {
      return await this.prisma.conversation.findMany(args)
    } catch (error) {
      const prismaError = error as {
        code?: string
        meta?: {
          field_name?: string
        }
      }
      const isUpdatedAtTypeError =
        prismaError?.code === 'P2032' &&
        String(prismaError?.meta?.field_name || '').includes('updatedAt')

      const errorMessage = String((error as any)?.message || '')
      const isParticipantRoleError =
        errorMessage.includes(
          "Value 'member' not found in enum 'participantRole'",
        ) ||
        errorMessage.includes(
          "Value 'admin' not found in enum 'participantRole'",
        ) ||
        errorMessage.includes(
          "Value 'owner' not found in enum 'participantRole'",
        )

      if (!isUpdatedAtTypeError && !isParticipantRoleError) {
        throw error
      }

      if (isParticipantRoleError) {
        await this.forceBackfillParticipantRole()
      }

      if (isUpdatedAtTypeError) {
        await this.forceBackfillConversationUpdatedAt()
      }

      return await this.prisma.conversation.findMany(args)
    }
  }

  async findConversationByFriendId(friendId: string, userId: string) {
    await this.ensureParticipantRoleNormalized()

    return await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          some: { userId },
          every: { OR: [{ userId }, { userId: friendId }] },
        },
      },
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            senderMember: true,
            medias: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
    } as any)
  }

  private normalizeString(str: string) {
    return str
      .normalize('NFD') // tách ký tự + dấu
      .replace(/[\u0300-\u036f]/g, '') // xóa dấu
      .replace(/đ/g, 'd') // xử lý riêng đ
      .replace(/Đ/g, 'D')
      .toLowerCase()
  }

  async create(data: {
    type: conversationType
    groupName?: string
    groupAvatar?: string
  }) {
    return await this.prisma.conversation.create({
      data: {
        type: data.type,
        groupName: data.groupName || null,
        groupNameLower: data.groupName?.toLocaleLowerCase() || null,
        groupNameSearch: data.groupName
          ? this.normalizeString(data.groupName)
          : null,
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
    await this.ensureParticipantRoleNormalized()

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
            content: true,
            type: true,
            clientMessageId: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
            replyToMessageId: true,
            isDeleted: true,
            deleteType: true,
            medias: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
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
    } as any)
  }

  async findByUserIdPaginated(
    userId: string,
    cursor: Date | null,
    take: number,
  ) {
    await this.ensureConversationUpdatedAtNotNull()
    await this.ensureParticipantRoleNormalized()

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

    const conversations = await this.findConversationsWithRetry({
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
            medias: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
    } as any)

    //sort lại conver theo thứ tự member vì conver không có order by
    const map = new Map(conversations.map((c) => [c.id, c]))

    const ordered = memberships.map((m) => map.get(m.conversationId))

    return ordered
  }

  async updateUpdatedAt(
    conversationId: string,
    data?: {
      lastMessageId?: string
      lastMessageAt?: Date
      lastMessageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'
    },
  ) {
    return await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        ...(data?.lastMessageId ? { lastMessageId: data.lastMessageId } : {}),
        ...(data?.lastMessageAt ? { lastMessageAt: data.lastMessageAt } : {}),
        ...(data?.lastMessageType
          ? { lastMessageType: data.lastMessageType }
          : {}),
      },
    })
  }

  // async searchByKeyword(userId: string, keyword: string) {
  //   const memberships = await this.prisma.conversationMember.findMany({
  //     where: {
  //       userId,
  //       conversation: {
  //         groupName: {
  //           startsWith: keyword,
  //           mode: 'insensitive',
  //         },
  //       },
  //     },
  //     orderBy: { lastMessageAt: 'desc' },
  //     include: {
  //       conversation: {
  //         include: {
  //           members: true,
  //           messages: {
  //             orderBy: { createdAt: 'desc' },
  //             take: 1,
  //             include: {
  //               senderMember: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   })

  //   if (!memberships.length) return []

  //   // 👇 Trả về đúng structure như cũ
  //   return memberships.map((m) => m.conversation)
  // }

  // async findDirectConversationOfFriend(userId: string, keyword: string) {
  //   // 1️⃣ Lấy conversationMember của user hiện tại
  //   const memberships = await this.prisma.conversationMember.findMany({
  //     where: {
  //       userId,
  //       conversation: {
  //         type: 'DIRECT',
  //         members: {
  //           some: {
  //             NOT: { userId }, // phải là người khác
  //             username: {
  //               startsWith: keyword,
  //               mode: 'insensitive',
  //             },
  //           },
  //         },
  //       },
  //     },
  //     orderBy: { lastMessageAt: 'desc' },
  //     select: { conversationId: true },
  //   })

  //   if (!memberships.length) return []

  //   // 2️⃣ Lấy conversation giống searchByKeyword
  //   const conversations = await this.prisma.conversation.findMany({
  //     where: {
  //       id: { in: memberships.map((m) => m.conversationId) },
  //     },
  //     include: {
  //       members: true,
  //       messages: {
  //         orderBy: { createdAt: 'desc' },
  //         take: 1,
  //         include: {
  //           senderMember: true,
  //         },
  //       },
  //     },
  //   })

  //   // 3️⃣ Giữ thứ tự theo membership
  //   const map = new Map(conversations.map((c) => [c.id, c]))
  //   const ordered = memberships.map((m) => map.get(m.conversationId))

  //   return ordered
  // }

  async searchByKeyword(userId: string, keyword: string) {
    await this.ensureConversationUpdatedAtNotNull()
    await this.ensureParticipantRoleNormalized()

    return this.findConversationsWithRetry({
      where: {
        type: 'GROUP',
        groupNameSearch: {
          startsWith: this.normalizeString(keyword),
          // mode: 'insensitive',
        },
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            senderMember: true,
            medias: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    } as any)
  }

  async findDirectConversationOfFriend(userId: string, keyword: string) {
    await this.ensureParticipantRoleNormalized()

    // 1️⃣ Tìm member KHÁC user match username
    const matchedMembers = await this.prisma.conversationMember.findMany({
      where: {
        userId: { not: userId },
        username: {
          startsWith: keyword,
          mode: 'insensitive',
        },
      },
      select: { conversationId: true },
    })

    if (!matchedMembers.length) return []

    const conversationIds = matchedMembers.map((m) => m.conversationId)

    // 2️⃣ Lấy membership của current user trong các conversation đó
    const memberships = await this.prisma.conversationMember.findMany({
      where: {
        userId,
        conversationId: { in: conversationIds },
        conversation: {
          type: 'DIRECT',
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      select: { conversationId: true },
    })

    if (!memberships.length) return []

    // 3️⃣ Lấy conversation giống như cũ
    await this.ensureConversationUpdatedAtNotNull()

    const conversations = await this.findConversationsWithRetry({
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
            medias: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
    } as any)

    const map = new Map(conversations.map((c) => [c.id, c]))
    return memberships.map((m) => map.get(m.conversationId))
  }
}
