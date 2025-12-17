import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { NotificationType } from 'interfaces/notification'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class NotificationService {
  @Inject(MailerService)
  private readonly mailerService: MailerService
  @Inject(PrismaService)
  private readonly prisma: PrismaService

  @Inject(UtilService)
  private readonly utilService: UtilService

  @Inject('USER_REDIS')
  private readonly redis: RedisClient
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({
    exchange: 'user.events',
    routingKey: 'user.created',
    queue: 'notification_queue',
  })
  async handleUserRegistered(data: any) {
    await this.mailerService.sendUserConfirmation(data)
    //tạo thông báo
  }

  @RabbitSubscribe({
    exchange: 'user.events',
    routingKey: 'user.makeFriend',
    queue: 'notification_queue',
  })
  async handleMakeFriend(data: any) {
    /**
     * 
     * inviterName: data.inviterName,
      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: res.toUserId,
      inviterId: data.inviterId,
     */
    //vấn đề gặp phải đó là phải có inviteeId
    const socketCount = await this.redis.scard(`user:${data.inviteeId}:sockets`)
    let inviteeStatus = socketCount > 0

    const notificationCreated = await this.createNotification({
      inviteeId: data.inviteeId,
      message: `${data.inviterName} đã gửi lời mời kết bạn cho bạn.`,
      type: NotificationType.FRIEND_REQUEST,
    })

    if (!inviteeStatus) {
      //nếu offline thì gửi mail
      await this.mailerService.sendMakeFriendNotification({
        senderName: data.inviterName,
        friendEmail: data.inviteeEmail,
        receiverName: data.inviteeName,
      })
    } else {
      //bắn socket
      this.amqpConnection.publish(
        'notification.events',
        'notification.created',
        notificationCreated,
      )
    }

    return
  }

  async createNotification(data: any) {
    const res = await this.prisma.notification.create({
      data: {
        userId: data.inviteeId,
        message: data.message,
        type: data.type as NotificationType,
      },
    })
    return {
      id: res.id,
      userId: res.userId,
      message: res.message,
      isRead: res.isRead,
      type: res.type,
      createdAt: this.utilService.dateToTimestamp(res.createdAt),
    } as unknown
  }
}
