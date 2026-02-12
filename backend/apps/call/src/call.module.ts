import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { CallController } from './call.controller'
import { CallService } from './call.service'
import { CallEventsPublisher } from './rmq/publishers/call-events.publisher'
import { CallSubscriber } from './rmq/subscribers/call.subscriber'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { LoggerModule } from '@app/logger'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: EXCHANGE_RMQ.CALL_EVENTS,
          type: 'topic',
        },
      ],
      uri: 'amqp://user:user@localhost:5672',
      connectionInitOptions: { wait: true },
    }),
    LoggerModule.forService('Call-Service'),
  ],
  controllers: [CallController],
  providers: [CallService, CallEventsPublisher, CallSubscriber],
})
export class CallModule {}
