import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { PrismaModule } from '@app/prisma'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { UtilModule } from '@app/util'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import {
  ConversationRepository,
  MessageRepository,
  ConversationMemberRepository,
} from './repositories'
import { ChatEventsPublisher } from './rmq/publishers/chat-events.publisher'
import { MessageSubscriber } from './rmq/subcribers/chat-subcribers'
import { RmqModule } from './rmq.module'
import { LoggerModule } from '@app/logger'

@Module({
  imports: [
    PrismaModule,
    RmqModule,
    UtilModule,
    LoggerModule.forService('Chat-Service'),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ConversationRepository,
    MessageRepository,
    ConversationMemberRepository,
    ChatEventsPublisher,
    MessageSubscriber,
  ],
})
export class ChatModule {}
