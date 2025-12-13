import { Controller, Get } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @EventPattern('user.created')
  async handleUserRegistered(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      // this.notificationService.handleUserRegistered(data)
      console.log('Chat received user.created event:')
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
      // channel.nack(originalMsg)
    }
  }
}
