import { Module } from '@nestjs/common'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { CallController } from './call.controller'
import { CallService } from './call.service'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'

@Module({
  imports: [
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
  ],
  controllers: [CallController],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
