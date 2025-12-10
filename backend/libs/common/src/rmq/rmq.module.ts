import { DynamicModule, Module } from '@nestjs/common'
import { RmqService } from './rmq.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EXCHANGE } from '../constants/exchange'
import * as amqp from 'amqplib'

interface RmqModuleOptions {
  name: string
  // exchange: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  //consumer or listener
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: () => {
              return {
                transport: Transport.RMQ,
                options: {
                  urls: ['amqp://localhost:5672'],
                  queue: `${name}_QUEUE`,
                },
              }
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    }
  }

  // For publisher with exchange
  static registerDirectPublisher(): DynamicModule {
    return {
      module: RmqModule,
      providers: [
        {
          provide: EXCHANGE.RMQ_PUBLISHER_CHANNEL,
          useFactory: async () => {
            const rabbitmqUri = 'amqp://localhost:5672'

            const connection = await amqp.connect(rabbitmqUri)
            const channel = await connection.createChannel()
            return channel
          },
        },
      ],
      exports: [EXCHANGE.RMQ_PUBLISHER_CHANNEL],
    }
  }
}
