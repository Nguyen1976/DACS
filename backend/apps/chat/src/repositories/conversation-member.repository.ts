import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType } from '@prisma/client'
import { Member } from 'interfaces/chat.grpc'

@Injectable()
export class ConversationMemberRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private participantRoleBackfilled = false

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

  private async withRoleRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      const message = String((error as any)?.message || '')
      const isParticipantRoleError =
        message.includes(
          "Value 'member' not found in enum 'participantRole'",
        ) ||
        message.includes("Value 'admin' not found in enum 'participantRole'") ||
        message.includes("Value 'owner' not found in enum 'participantRole'")

      if (!isParticipantRoleError) {
        throw error
      }

      await this.forceBackfillParticipantRole()
      return await fn()
    }
  }

  async createMany(
    conversationId: string,
    members: Member[],
    createrId: string,
    type: conversationType,
  ) {
    return await this.prisma.conversationMember.createMany({
      data: members.map((member: Member) => ({
        ...member,
        conversationId,
        userId: member.userId,
        role:
          type === conversationType.GROUP && createrId === member.userId
            ? 'ADMIN'
            : 'MEMBER',
        lastReadMessageId: null,
        lastMessageAt: new Date(),
      })),
    })
  }

  async findByConversationId(conversationId: string) {
    await this.ensureParticipantRoleNormalized()

    return await this.withRoleRetry(() =>
      this.prisma.conversationMember.findMany({
        where: {
          conversationId,
        },
        select: {
          userId: true,
          role: true,
        },
      }),
    )
  }

  async updateLastMessageAt(conversationId: string, lastMessageAt: Date) {
    return await this.prisma.conversationMember.updateMany({
      where: {
        conversationId,
      },
      data: {
        lastMessageAt: lastMessageAt,
      },
    })
  }

  async findByConversationIdAndUserIds(
    conversationId: string,
    userIds: string[],
  ) {
    await this.ensureParticipantRoleNormalized()

    return await this.withRoleRetry(() =>
      this.prisma.conversationMember.findMany({
        where: {
          conversationId,
          userId: { in: userIds },
        },
        select: { userId: true },
      }),
    )
  }

  async findByConversationIdAndUserId(conversationId: string, userId: string) {
    await this.ensureParticipantRoleNormalized()

    return await this.withRoleRetry(() =>
      this.prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId,
        },
      }),
    )
  }

  async addMembers(conversationId: string, memberIds: string[]) {
    return await this.prisma.conversationMember.createMany({
      data: memberIds.map((memberId) => ({
        conversationId,
        userId: memberId,
        role: 'MEMBER',
        lastMessageAt: new Date(), //vì vừa mới được thêm lên mình sẽ để thời gian này conver sẽ ở đầu
      })),
    })
  }

  async updateLastRead(
    conversationId: string,
    userId: string,
    lastReadMessageId: string,
  ) {
    return await this.prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId,
      },
    })
  }

  async updateByUserId(
    userId: string,
    data: {
      avatar?: string
      fullName?: string
    },
  ) {
    return await this.prisma.conversationMember.updateMany({
      where: {
        userId,
      },
      data: {
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      },
    })
  }
}
