import { Controller, Get, Inject } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { MailerService } from '@app/mailer'

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('user.created')
  async handleUserRegistered(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      this.notificationService.handleUserRegistered(data)
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
      // channel.nack(originalMsg)
    }
  }

  @EventPattern('user.makeFriend')
  async handleMakeFriend(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      await this.notificationService.handleMakeFriend(data)
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
    }
  }

  @EventPattern('user.updateStatusMakeFriend')
  async handleUpdateStatusMakeFriend(
    @Payload() data,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      await this.notificationService.handleUpdateStatusMakeFriend(data)
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
    }
  }
}
